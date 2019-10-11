import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMiddlewares from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups:id', MeetupController.update);
routes.delete('/meetups:id', MeetupController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
