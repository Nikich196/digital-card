import { Injectable } from '@nestjs/common';
import { Skill } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { groupByKey } from '../common/dataloader/group-by';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<Skill[][]> {
    const rows = await this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ profileId: 'asc' }, { category: 'asc' }, { name: 'asc' }],
    });
    return groupByKey(rows, profileIds, (row) => row.profileId);
  }
}
