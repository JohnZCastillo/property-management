import { sql } from "drizzle-orm";

export default function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  pageSize = 3,
) {

  const count = ()=> {
    return 0;
  //  return qb.select({ count: sql<number>`count(*)` });
  }

  const paginate = ()=> {
    return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  }

  return Promise.all([
      count(),
      paginate()
    ]);
   
}