import { Hono } from 'hono'

const route = new Hono()

route.get('/', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

route.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

route.post('/', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

route.patch('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

route.delete('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

export default route;