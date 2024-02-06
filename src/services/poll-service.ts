import { prisma } from '../lib/prisma'
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
    return { poll }
  }

  async voteOnPoll(sessionId: string, pollId: string, pollOptionId: string) {
    const userAlreadyVoted = await this.verifyIfUserAlreadyVoted(
      sessionId,
      pollId,
    )

    if (userAlreadyVoted && userAlreadyVoted.pollOptionId !== pollOptionId) {
      await prisma.vote.delete({ where: { id: userAlreadyVoted.id } })
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
