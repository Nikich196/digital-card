import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Achievement } from './achievement.model';
import { Experience } from './experience.model';
import { Loaders } from '../common/dataloader/loaders';

@Resolver(() => Experience)
export class ExperienceResolver {
  @ResolveField(() => [Achievement])
  achievements(
    @Parent() experience: Experience,
    @Context('loaders') loaders: Loaders,
  ): Promise<Achievement[]> {
    return loaders.achievementsByExperience.load(experience.id);
  }

  /** Derived field: the database stores a nullable end date, not a flag. */
  @ResolveField(() => Boolean)
  isCurrent(@Parent() experience: Experience): boolean {
    return experience.finishedAt === null;
  }
}
