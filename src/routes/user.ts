import { Hono } from 'hono'

import db from '../db/connection.js';
import { companies, users } from '../db/schema.js';
import withPagination from '../util/pagination.js';
import { eq, getTableColumns, and } from 'drizzle-orm';
import { companyValidation as schema } from '../validation/schema.js';
import { sValidator } from '@hono/standard-validator'
import type { Variables } from '../types/index.js';

const route = new Hono<{Variables: Variables}>();

route.get('/', async (c) => {
  
  const payload = c.get('jwtPayload')

  const query = db
    .select(getTableColumns(companies))
    .from(companies)
    .innerJoin(users, eq(users.companyId, companies.id))
    .where(eq(users.id, payload.user.id))

    const [result] = await withPagination(query,'id');

    return c.json({
      data: result
    });
})

route.get('/:id', async (c) => {

  const id = parseInt(c.req.param('id'))

  const payload = c.get('jwtPayload')

  const result = await db
    .select(getTableColumns(companies))
    .from(companies)
    .innerJoin(users, eq(users.companyId, companies.id))
    .where(and(
        eq(users.id, payload.user.id),
        eq(companies.id, id)
    ))
    .limit(1)
    .execute();

    return c.json({
      data: result
    });
})

route.post('/', sValidator('json', schema), async (c) => {
  
  const data = c.req.valid('json');

  const result = await db
    .insert(companies)
    .values(data)
    .returning()
  
  return c.json({
    data: result
  }, 201)

})

route.patch('/:id', sValidator('json', schema), async (c) => {
  
  const id = parseInt(c.req.param('id'))

  const payload = c.get('jwtPayload')

  const data = c.req.valid('json');

  const result = await db
    .update(companies)
    .set(data)
    .where(and(
        eq(companies.id, id),
        eq(companies.id, payload.company.id)
    ))
    .execute();
  
  return c.json({
    data: result
  })

})

route.delete('/:id', async (c) => {

  const id = parseInt(c.req.param('id'))
  const payload = c.get('jwtPayload')

  const result = await db
    .delete(companies)
    .where(and(
        eq(companies.id, id),
        eq(companies.id, payload.company.id)
    ))
    .execute();
  
  return c.json({
    data: result
  })

})

export default route;