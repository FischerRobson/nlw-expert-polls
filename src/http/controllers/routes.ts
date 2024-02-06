import { FastifyInstance } from 'fastify'
import { createPoll } from './create-poll'
import { findPoll } from './find-poll'
import { voteOnPoll } from './vote-on-poll'

export async function routes(app: FastifyInstance) {
  app.get('/polls/:id', findPoll)

  app.post('/polls', createPoll)
  app.post('/polls/:id/vote', voteOnPoll)
}
