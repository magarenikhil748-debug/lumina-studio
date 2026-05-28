import express from 'express';
import { getUserPlan } from '../controllers/userPlanController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/plan', requireAuth, getUserPlan);

export default router;
