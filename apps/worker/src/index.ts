import express, { Request, Response } from 'express';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// QStash webhook endpoint
app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    // TODO: Verify QStash signature
    // verifySignatureAppRouter(req);

    const { type, payload } = req.body;

    console.log(`[Worker] Received job: ${type}`, payload);

    // Route to appropriate job handler
    switch (type) {
      case 'generate-ideas':
        // TODO: Import and call idea generation job
        console.log('[Worker] Processing idea generation job');
        break;
      case 'generate-plan':
        // TODO: Import and call plan generation job
        console.log('[Worker] Processing plan generation job');
        break;
      case 'generate-artifact':
        // TODO: Import and call artifact generation job
        console.log('[Worker] Processing artifact generation job');
        break;
      default:
        console.warn(`[Worker] Unknown job type: ${type}`);
        return res.status(400).json({ error: 'Unknown job type' });
    }

    res.status(200).json({ success: true, type });
  } catch (error) {
    console.error('[Worker] Job processing error:', error);
    res.status(500).json({ error: 'Job processing failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[Worker] Server running on http://localhost:${PORT}`);
  console.log(`[Worker] Health check: http://localhost:${PORT}/health`);
  console.log(`[Worker] QStash webhook: http://localhost:${PORT}/api/jobs`);
});

export default app;