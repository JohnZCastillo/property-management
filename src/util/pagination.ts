import { sql } from "drizzle-orm";

export default function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  pageSize = 10,
) {

  const paginate = ()=> {
    return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  }

  const count = ()=> ({
        page: page,
        perPage: pageSize,
        totalPage: 1
      })

  return Promise.all([
      paginate(),
      count()
    ]);
   
}