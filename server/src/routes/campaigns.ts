import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  deleteCampaign,
  sendCampaign,
} from '../controllers/campaignController';

const router = Router();

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.delete('/:id', deleteCampaign);
router.post('/:id/send', sendCampaign);

export default router;
