import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The card exposes exactly one profile. When no slug is given we return the
   * oldest row, which keeps `query { profile { ... } }` working out of the box.
   */
  async findOne(slug?: string): Promise<Profile> {
    const profile = slug
      ? await this.prisma.profile.findUnique({ where: { slug } })
      : await this.prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });

    if (!profile) {
      throw new NotFoundException(
        slug ? `Profile "${slug}" not found` : 'No profile has been seeded yet',
      );
    }
    return profile;
  }
}
