import { Router } from 'express';
import multer from 'multer';
import { validate } from '../../middlewares/validate.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { badRequest } from '../../utils/httpError.js';
import * as svc from './products.service.js';
import * as s from './products.schemas.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(badRequest('مسموح بصور jpeg/png/webp/avif فقط')),
});

// ---------- Public ----------
export const publicRouter = Router();

publicRouter.get('/', validate({ query: s.listQuery }), async (req, res) => {
  res.json(await svc.listProducts(req.validatedQuery));
});

publicRouter.get('/:idOrSlug', async (req, res) => {
  res.json(await svc.getProduct(req.params.idOrSlug));
});

// ---------- Admin ----------
export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/', validate({ query: s.listQuery }), async (req, res) => {
  res.json(await svc.listProducts(req.validatedQuery, { onlyActive: false }));
});

adminRouter.post('/', validate({ body: s.createProduct }), async (req, res) => {
  res.status(201).json(await svc.createProduct(req.body));
});

adminRouter.patch('/:id', validate({ params: s.idParam, body: s.updateProduct }), async (req, res) => {
  res.json(await svc.updateProduct(req.params.id, req.body));
});

adminRouter.delete('/:id', validate({ params: s.idParam }), async (req, res) => {
  await svc.deleteProduct(req.params.id);
  res.status(204).end();
});

adminRouter.post('/:id/images', validate({ params: s.idParam }), upload.single('image'), async (req, res) => {
  if (!req.file) throw badRequest('ابعت الصورة في الحقل image');
  res.status(201).json(await svc.addImage(req.params.id, req.file));
});

adminRouter.delete('/:id/images/:imageId', validate({ params: s.imageParams }), async (req, res) => {
  await svc.removeImage(req.params.id, req.params.imageId);
  res.status(204).end();
});
