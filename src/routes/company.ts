import { Hono } from 'hono'

import db from '../db/connection.js';
import { companies } from '../db/schema.js';
import withPagination from '../util/pagination.js';

const route = new Hono()

route.get('/', async (c) => {
  
  const query = db
    .select()
    .from(companies);

  return c.json({
    data: withPagination(query,'id')
  });

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