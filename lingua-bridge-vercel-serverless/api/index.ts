/**
 * Vercel Serverless Entry Point
 *
 * Vercel looks for a default export in /api/index.ts.
 * We simply import our Express app (which has no app.listen call)
 * and re-export it. Vercel wraps it as a serverless function.
 */
import app from '../src/app.js';

export default app;
