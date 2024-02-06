import { FastifyInstance } from 'fastify'
import { createPoll } from './create-poll'

export async function routes(app: FastifyInstance) {
  app.post('/polls', createPoll)
}
