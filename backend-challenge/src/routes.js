import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import AlbumController from './controllers/AlbumController';

const routes = Router();

const upload = multer(multerConfig);

routes.get('/albuns', AlbumController.index);
routes.get('/albuns/:id', AlbumController.view);
routes.post('/albuns', upload.single('folder'), AlbumController.store);
routes.patch(
  '/albuns/:id',
  upload.single('folder'),
  AlbumController.updatePartial
);
routes.put('/albuns/:id', upload.single('folder'), AlbumController.updateAll);
routes.delete('/albuns/:id', AlbumController.delete);

export default routes;
