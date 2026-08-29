import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Experience } from '../experience/experience.model';
import { Link } from '../link/link.model';
import { Project } from '../project/project.model';
import { Skill } from '../skill/skill.model';

@ObjectType({ description: 'Everything the digital business card exposes.' })
export class Profile {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Stable key used to look the profile up.' })
  slug!: string;

  @Field()
  name!: string;

  @Field({ description: 'One-line professional headline.' })
  headline!: string;

  @Field()
  description!: string;

  @Field()
  location!: string;

  @Field()
  email!: string;

  // Nested fields are optional on the TS class and non-null in the GraphQL
  // schema: the query resolver returns the plain database row, and @ResolveField
  // fills these in through per-request loaders.
  @Field(() => [Link])
  links?: Link[];

  @Field(() => [Skill])
  skills?: Skill[];

  @Field(() => [Experience])
  experiences?: Experience[];

  @Field(() => [Project])
  projects?: Project[];
}
