import { Request, Response } from 'express';
import { JobsService } from './jobs.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { CreateJobSchema, JobStatus } from '@freelancerx/shared';

export class JobsController {
  static async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const { query, skill, minBudget, maxBudget, status, page, limit } = req.query;

      const jobsData = await JobsService.listJobs({
        query: query ? String(query) : undefined,
        skill: skill ? String(skill) : undefined,
        minBudget: minBudget ? parseFloat(String(minBudget)) : undefined,
        maxBudget: maxBudget ? parseFloat(String(maxBudget)) : undefined,
        status: status ? (String(status) as JobStatus) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
      });

      res.json({ success: true, ...jobsData });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to retrieve jobs' });
    }
  }

  static async createJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = CreateJobSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid job data', details: parsed.error.issues });
        return;
      }

      const job = await JobsService.createJob(req.user.id, parsed.data);
      res.status(201).json({ success: true, job });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create job' });
    }
  }

  static async getJobById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const jobId = req.params['id'] as string;
      const job = await JobsService.getJobById(jobId, req.user?.id);
      res.json({ success: true, job });
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Job not found' });
    }
  }

  static async closeJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const jobId = req.params['id'] as string;
      const job = await JobsService.closeJob(jobId, req.user.id);
      res.json({ success: true, job });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to close job' });
    }
  }
}
