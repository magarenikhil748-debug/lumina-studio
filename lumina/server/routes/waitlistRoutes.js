import express from 'express';
import { joinWaitlist } from '../controllers/waitlistController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { waitlistValidators } from '../middleware/validators.js';

const router = express.Router();

router.post('/', waitlistValidators, validateRequest, joinWaitlist);

export default router;
