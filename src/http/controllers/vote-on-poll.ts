import { randomUUID } from 'node:crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { HttpStatusCode } from '../../constants/HttpStatusCode'
import { pollService } from '../../services/poll-service'
import { UserAlreadyVotedException } from '../../services/exceptions/user-already-voted-exception'

export async function voteOnPoll(req: FastifyRequest, res: FastifyReply) {
  const bodySchema = z.object({
    pollOptionId: z.string().uuid(),
  })

  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const { pollOptionId } = bodySchema.parse(req.body)
  const { id } = paramsSchema.parse(req.params)

  let { sessionId } = req.cookies

  if (!sessionId) {
    sessionId = randomUUID()

    res.setCookie('sessionId', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // a month
      path: '/',
      signed: true,
      httpOnly: true,
    })
  }

  try {
    await pollService.voteOnPoll(sessionId, id, pollOptionId)
    return res
      .status(HttpStatusCode.Created)
      .send({ message: 'Vote confirmed!' })
  } catch (e) {
    if (e instanceof UserAlreadyVotedException) {
      return res.status(HttpStatusCode.Forbidden).send({ error: e.message })
    }
    return res.status(HttpStatusCode.InternalServerError).send({ error: e })
  }
}
