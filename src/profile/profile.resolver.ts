import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Experience } from '../experience/experience.model';
import { Link } from '../link/link.model';
import { Loaders } from '../common/dataloader/loaders';
import { Profile } from './profile.model';
import { ProfileService } from './profile.service';
import { Project } from '../project/project.model';
import { Skill } from '../skill/skill.model';

/**
 * The resolver only orchestrates: it asks the service for the root object and
 * hands nested fields to request-scoped loaders. No Prisma calls live here.
 */
@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profiles: ProfileService) {}

  @Query(() => Profile, { description: 'The digital business card.' })
  profile(
    @Args('slug', { type: () => String, nullable: true }) slug?: string,
  ): Promise<Profile> {
    return this.profiles.findOne(slug);
  }

  @ResolveField(() => [Link])
  links(@Parent() profile: Profile, @Context('loaders') loaders: Loaders): Promise<Link[]> {
    return loaders.linksByProfile.load(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile, @Context('loaders') loaders: Loaders): Promise<Skill[]> {
    return loaders.skillsByProfile.load(profile.id);
  }

  @ResolveField(() => [Experience])
  experiences(
    @Parent() profile: Profile,
    @Context('loaders') loaders: Loaders,
  ): Promise<Experience[]> {
    return loaders.experiencesByProfile.load(profile.id) as unknown as Promise<Experience[]>;
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile, @Context('loaders') loaders: Loaders): Promise<Project[]> {
    return loaders.projectsByProfile.load(profile.id);
  }
}
