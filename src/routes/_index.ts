import { Hono } from 'hono'

import AuthRoute from './company.js';
import BookingRoute from './company.js';
import CompanyRoute from './company.js';
import CustomerRoute from './company.js';
import ExpenseRoute from './company.js';
import JobOrderRoute from './company.js';
import PropertyRoute from './company.js';
import RoleRoute from './company.js';
import RoomRoute from './company.js';
import UserRoute from './company.js';

const route = new Hono()

route.route('/auth', AuthRoute);
route.route('/bookings', BookingRoute);
route.route('/companies', CompanyRoute);
route.route('/customers', CustomerRoute);
route.route('/expenses', ExpenseRoute);
route.route('/job-orders', JobOrderRoute);
route.route('/properties', PropertyRoute);
route.route('/roles', RoleRoute);
route.route('/rooms', RoomRoute);
route.route('/users', UserRoute);

export default route;