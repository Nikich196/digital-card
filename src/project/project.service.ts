import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { groupByKey } from '../common/dataloader/group-by';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByProfileIds(profileIds: readonly string[]): Promise<Project[][]> {
    const rows = await this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ profileId: 'asc' }, { position: 'asc' }],
    });
    return groupByKey(rows, profileIds, (row) => row.profileId);
  }
}
