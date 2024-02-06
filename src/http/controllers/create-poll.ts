import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { pollService } from '../../services/poll-service'
import { HttpStatusCode } from '../../constants/HttpStatusCode'

export async function createPoll(req: FastifyRequest, res: FastifyReply) {
  const bodySchema = z.object({
    title: z.string(),
  })

  const { title } = bodySchema.parse(req.body)

  const { poll } = await pollService.create(title)

  return res.status(HttpStatusCode.Created).send({ pollId: poll.id })
}
