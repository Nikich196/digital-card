import DataLoader from 'dataloader';
import { Achievement, Experience, Link, Project, Skill } from '@prisma/client';

/**
 * One set of loaders is created per HTTP request and lives in the GraphQL
 * context. Request scope matters: a loader cache that outlives the request
 * would serve stale rows.
 */
export interface Loaders {
  linksByProfile: DataLoader<string, Link[]>;
  skillsByProfile: DataLoader<string, Skill[]>;
  experiencesByProfile: DataLoader<string, Experience[]>;
  projectsByProfile: DataLoader<string, Project[]>;
  achievementsByExperience: DataLoader<string, Achievement[]>;
}

export const LOADERS = 'LOADERS';
