import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import * as svc from './categories.service.js';
import * as s from './categories.schemas.js';

// ─── Public ────────────────────────────────────────────────────
export const publicRouter = Router();

publicRouter.get('/', validate({ query: s.listQuery }), async (req, res) => {
  res.json(await svc.listCategories(req.validatedQuery));
});

publicRouter.get('/:idOrSlug', async (req, res) => {
  res.json(await svc.getCategory(req.params.idOrSlug));
});

// ─── Admin ─────────────────────────────────────────────────────
export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/', validate({ query: s.listQuery }), async (req, res) => {
  res.json(await svc.listCategories(req.validatedQuery, { onlyActive: false }));
});

adminRouter.post('/', validate({ body: s.createCategory }), async (req, res) => {
  res.status(201).json(await svc.createCategory(req.body));
});

adminRouter.patch('/:id', validate({ params: s.idParam, body: s.updateCategory }), async (req, res) => {
  res.json(await svc.updateCategory(req.params.id, req.body));
});

adminRouter.delete('/:id', validate({ params: s.idParam }), async (req, res) => {
  await svc.deleteCategory(req.params.id);
  res.status(204).end();
});
