import { FastifyInstance } from 'fastify'
import z from 'zod'
import { votingPubSub } from '../utils/voting-pub-sub'

export async function websocketRoutes(app: FastifyInstance) {
  app.get('/polls/:id/results', { websocket: true }, (conn, req) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    votingPubSub.subscribe(id, (message) => {
      conn.socket.send(JSON.stringify(message))
    })

    // conn.socket.on('message', (message: string) => {
    //   conn.socket.send('you sent: ' + message)
    // })
  })
}
