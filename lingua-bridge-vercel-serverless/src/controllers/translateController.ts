import type { Request, Response } from 'express';
import { translate } from 'google-translate-api-x';

/**
 * Controller for translation requests.
 * POST /api/translate
 * Body: { text: string, target?: string }
 */
export const translateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, target = 'en' } = req.body as { text?: unknown; target?: string };

    // Validate that 'text' is a non-empty string
    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'A valid "text" field is required for translation.',
      });
      return;
    }

    // Translate using google-translate-api-x
    const result = await translate(text, { to: target });

    res.status(200).json({
      success: true,
      translatedText: result.text,
      sourceLang: result.from.language.iso,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Translation service failed.',
    });
  }
};
