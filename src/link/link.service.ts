import { Injectable } from '@nestjs/common';
import { Link } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { groupByKey } from '../common/dataloader/group-by';

@Injectable()
export class LinkService {
  constructor(private readonly prisma: PrismaService) {}

  /** One query for every profile in the batch instead of one per profile. */
  async findManyByProfileIds(profileIds: readonly string[]): Promise<Link[][]> {
    const rows = await this.prisma.link.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ profileId: 'asc' }, { position: 'asc' }],
    });
    return groupByKey(rows, profileIds, (row) => row.profileId);
  }
}
