import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: {
      chainId: config.chainId,
      rpcUrl: config.rpcUrl,
    },
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`FreelancerX backend server running on port ${config.port} [${config.nodeEnv}]`);
    console.log(`Target Network: Base Sepolia (Chain ID: ${config.chainId})`);
  });
}

export default app;
