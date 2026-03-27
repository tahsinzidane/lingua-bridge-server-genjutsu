import express from 'express';
import type { Request, Response } from 'express'; 
import { translate } from 'google-translate-api-x';

/**
 * Controller for translation requests.
 */
export const translateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, target = 'en' } = req.body;

    // Request Validation
    // Check if 'text' is provided and is a non-empty string.
    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'A valid "text" field is required for translation.',
      });
      return;
    }

    // Use google-translate-api-x to translate the text.
    // 'to' specifies the target language (defaults to 'en').
    const result = await translate(text, { to: target });

    // Return the translated text and the detected source language.
    res.status(200).json({
      success: true,
      translatedText: result.text,
      sourceLang: result.from.language.iso,
    });
  } catch (error) {
    // If the translation service fails, return a 500 Internal Server Error.
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Translation service failed.',
    });
  }
};
