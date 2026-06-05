import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  addNote,
} from '../controllers/contactController';

const router = Router();

router.get('/', getContacts);
router.post('/', createContact);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/:id/notes', addNote);

export default router;
