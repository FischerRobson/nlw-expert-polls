import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { pollService } from '../../services/poll-service'
import { HttpStatusCode } from '../../constants/HttpStatusCode'

export async function findPoll(req: FastifyRequest, res: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = paramsSchema.parse(req.params)

  const { poll } = await pollService.get(id)

  return res.status(HttpStatusCode.OK).send({ poll })
}
