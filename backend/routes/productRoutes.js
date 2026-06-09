import express from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateProduct } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), validateProduct, createProduct);

router.route('/:idOrSlug')
  .get(getProductByIdOrSlug)
  .put(protect, authorize('admin'), (req, res, next) => {
    req.params.id = req.params.idOrSlug;
    updateProduct(req, res, next);
  })
  .delete(protect, authorize('admin'), (req, res, next) => {
    req.params.id = req.params.idOrSlug;
    deleteProduct(req, res, next);
  });

export default router;
