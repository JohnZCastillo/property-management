import { Hono } from 'hono'

import { jwt } from 'hono/jwt'
import 'dotenv/config';

type Variables = {
    jwtPayload: {
        user: {
            id: number,
            name: string
        }
    };
};

import AuthRoute from './auth.js';
import BookingRoute from './company.js';
import CompanyRoute from './company.js';
import CustomerRoute from './customer.js';
import ExpenseRoute from './expense.js';
import JobOrderRoute from './jobOrder.js';
import PropertyRoute from './property.js';
import RoleRoute from './company.js';
import RoomRoute from './room.js';
import UserRoute from './company.js';

const route = new Hono<{Variables: Variables}>();

route.use('/auth/*', (c, next) => {
      const jwtMiddleware = jwt({
        secret: process.env.JWT_SECRET!,
        alg: 'HS256',
      })

      return jwtMiddleware(c, next)
})

route.route('/public/auth', AuthRoute);

route.route('/auth/bookings', BookingRoute);
route.route('/auth/companies', CompanyRoute);
route.route('/auth/customers', CustomerRoute);
route.route('/auth/expenses', ExpenseRoute);
route.route('/auth/job-orders', JobOrderRoute);
route.route('/auth/properties', PropertyRoute);
route.route('/auth/rooms', RoomRoute);
route.route('/auth/roles', RoleRoute);
route.route('/auth/users', UserRoute);

export default route;