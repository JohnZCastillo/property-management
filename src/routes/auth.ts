import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import db from '../db/connection.js';
import { companies, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

const route = new Hono()

route.get('/', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

route.get('/:id', async (c) => {
  
  const id = parseInt( c.req.param('id'))
  
  const [query] = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        email: users.email
      },
      company: {
        id: companies.id,
        name: companies.name
      }
    })
    .from(users)
    .innerJoin(companies, eq(users.companyId, companies.id))
    .where(eq(users.id, id))
    .limit(1);

    const token =  await sign(query, process.env.JWT_SECRET!);

    return c.json({
      token: token
    })
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