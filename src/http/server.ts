import fastify from 'fastify'
import { routes } from './controllers/routes'
import { ZodError } from 'zod'
import fastifyCookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'
import { websocketRoutes } from '../ws/websocket-routes'

const app = fastify()

app.register(fastifyWebsocket)

app.register(fastifyCookie, {
  secret: 'polls-cookie-secret',
  hook: 'onRequest',
})

app.register(routes)
app.register(websocketRoutes)

app.listen({ port: 3333 }).then(() => {
  console.log('Server running...')
})

app.setErrorHandler((err, req, res) => {
  // if (env.NODE_ENV !== 'prod') console.error(err)

  if (err instanceof ZodError) {
    return res.status(400).send({ error: err.format() })
  }

  return res.status(500).send({ error: 'Interal Server Error' })
})
