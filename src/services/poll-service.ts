import { prisma } from '../lib/prisma'

class PollService {
  async create(title: string) {
    const poll = await prisma.poll.create({
      data: {
        title,
      },
    })

    return { poll }
  }
}

export const pollService = new PollService()
