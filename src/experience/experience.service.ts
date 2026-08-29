import { Injectable } from '@nestjs/common';
import { Achievement, Experience } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { groupByKey } from '../common/dataloader/group-by';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<Experience[][]> {
    const rows = await this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      // Most recent role first — that is what a reader expects on a CV.
      orderBy: [{ profileId: 'asc' }, { startedAt: 'desc' }],
    });
    return groupByKey(rows, profileIds, (row) => row.profileId);
  }

  /**
   * Second level of nesting. Without a loader here, a profile with N roles
   * would issue N extra queries for achievements.
   */
  async findAchievementsByExperienceIds(
    experienceIds: readonly string[],
  ): Promise<Achievement[][]> {
    const rows = await this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: [{ experienceId: 'asc' }, { position: 'asc' }],
    });
    return groupByKey(rows, experienceIds, (row) => row.experienceId);
  }
}
