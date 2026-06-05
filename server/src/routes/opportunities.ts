import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../controllers/opportunityController';

const router = Router();

router.get('/', getOpportunities);
router.post('/', createOpportunity);
router.get('/:id', getOpportunityById);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

export default router;
