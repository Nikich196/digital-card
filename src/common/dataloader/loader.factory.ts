import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';

import { ExperienceService } from '../../experience/experience.service';
import { LinkService } from '../../link/link.service';
import { ProjectService } from '../../project/project.service';
import { SkillService } from '../../skill/skill.service';
import { Loaders } from './loaders';

@Injectable()
export class LoaderFactory {
  constructor(
    private readonly links: LinkService,
    private readonly skills: SkillService,
    private readonly experiences: ExperienceService,
    private readonly projects: ProjectService,
  ) {}

  /** Called once per request from the GraphQL context factory. */
  create(): Loaders {
    return {
      linksByProfile: new DataLoader((ids) => this.links.findManyByProfileIds(ids)),
      skillsByProfile: new DataLoader((ids) => this.skills.findManyByProfileIds(ids)),
      experiencesByProfile: new DataLoader((ids) => this.experiences.findManyByProfileIds(ids)),
      projectsByProfile: new DataLoader((ids) => this.projects.findManyByProfileIds(ids)),
      achievementsByExperience: new DataLoader((ids) =>
        this.experiences.findAchievementsByExperienceIds(ids),
      ),
    };
  }
}
