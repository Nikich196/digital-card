import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'A shipped project.' })
export class Project {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true, description: 'Live URL, if published.' })
  url!: string | null;

  @Field(() => String, { nullable: true })
  repositoryUrl!: string | null;

  @Field(() => [String], { description: 'Technologies used.' })
  stack!: string[];
}
