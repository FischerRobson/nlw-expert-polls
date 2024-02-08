import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { votingPubSub } from '../utils/voting-pub-sub'
import { UserAlreadyVotedException } from './exceptions/user-already-voted-exception'

class PollService {
  async create(title: string, options: string[]) {
    const poll = await prisma.poll.create({
      data: {
        title,
        pollOptions: {
          createMany: {
            data: options.map((option) => {
              return {
                title: option,
              }
            }),
          },
        },
      },
    })

    return { poll }
  }

  async get(id: string) {
    const poll = await prisma.poll.findUniqueOrThrow({
      where: { id },
      include: { pollOptions: { select: { id: true, title: true } } },
    })

    const result = await redis.zrange(id, 0, -1, 'WITHSCORES') // -1 to get all
    // result is a array like ['id', 'votes', 'id', 'votes']

    const votes = result.reduce(
      (acc, item, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1] // get the score stored on next redis result index
          Object.assign(acc, { [item]: Number(score) })
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const response = {
      id: poll.id,
      title: poll.title,
      pollOptions: poll.pollOptions.map((op) => {
        return {
          id: op.id,
          title: op.title,
          votes: votes[op.id],
        }
      }),
    }

    return { poll: response }
  }

  async voteOnPoll(sessionId: string, pollId: string, pollOptionId: string) {
    const userAlreadyVoted = await this.verifyIfUserAlreadyVoted(
      sessionId,
      pollId,
    )

    if (userAlreadyVoted && userAlreadyVoted.pollOptionId !== pollOptionId) {
      await prisma.vote.delete({ where: { id: userAlreadyVoted.id } })
      const votes = await redis.zincrby(
        pollId,
        -1,
        userAlreadyVoted.pollOptionId,
      )

      votingPubSub.publish(pollId, {
        pollOptionId: userAlreadyVoted.pollOptionId,
        votes: Number(votes),
      })
    } else if (userAlreadyVoted) {
      throw new UserAlreadyVotedException()
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    })

    const votes = await redis.zincrby(pollId, 1, pollOptionId) // on key increment member

    votingPubSub.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    })
  }

  async verifyIfUserAlreadyVoted(sessionId: string, pollId: string) {
    const vote = await prisma.vote.findUnique({
      where: {
        sessionId_pollId: {
          sessionId,
          pollId,
        },
      },
    })

    return vote
  }
}

export const pollService = new PollService()
