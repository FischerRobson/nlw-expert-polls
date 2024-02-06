import fastify from 'fastify'
import { routes } from './controllers/routes'
import { ZodError } from 'zod'

const app = fastify()

app.register(routes)

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
