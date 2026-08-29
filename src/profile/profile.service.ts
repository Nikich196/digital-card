import { GraphQLError } from 'graphql';
import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The card exposes exactly one profile. When no slug is given we return the
   * oldest row, which keeps `query { profile { ... } }` working out of the box.
   *
   * A GraphQLError with an explicit code is thrown rather than Nest's
   * NotFoundException: this service speaks only GraphQL, and an HTTP status
   * would be a borrowed concept here. The code is what the error formatter
   * uses to decide that the message is safe to show the client.
   */
  async findOne(slug?: string): Promise<Profile> {
    // Именно «аргумент передан», а не «строка непустая»: profile(slug: "")
    // — это запрос конкретного профиля, и молча подменять его на первый
    // попавшийся означает отдать чужие данные вместо честного NOT_FOUND.
    const askedForSlug = slug !== undefined && slug !== null;
    const profile = askedForSlug
      ? await this.prisma.profile.findUnique({ where: { slug: slug as string } })
      : await this.prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });

    if (!profile) {
      throw new GraphQLError(
        askedForSlug ? `Profile "${slug}" was not found` : 'No profile has been seeded yet',
        { extensions: { code: 'NOT_FOUND' } },
      );
    }
    return profile;
  }
}
