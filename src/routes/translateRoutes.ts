import { Router } from 'express';
import { translateText } from '../controllers/translateController.js';

const router = Router();

/**
 * Route: POST /api/translate
 * Description: Translates text into a target language.
 * Body: { text: string, target?: string }
 */
router.post('/translate', translateText);

export default router;
