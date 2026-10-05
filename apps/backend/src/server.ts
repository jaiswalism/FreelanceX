import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import jobsRoutes from './modules/jobs/jobs.routes.js';
import proposalsRoutes from './modules/proposals/proposals.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import reputationRoutes from './modules/reputation/reputation.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import disputesRoutes from './modules/disputes/disputes.routes.js';
import { BlockchainIndexer } from './blockchain/indexer/indexer.service.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route groups
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/jobs', jobsRoutes);
app.use('/', proposalsRoutes);
app.use('/', projectsRoutes);
app.use('/', reputationRoutes);
app.use('/', messagesRoutes);
app.use('/', disputesRoutes);

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

    // Start Indexer
    const indexer = new BlockchainIndexer();
    indexer.startIndexing();
  });
}

export default app;
