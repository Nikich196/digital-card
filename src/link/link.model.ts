import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'External professional link.' })
export class Link {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Display label, e.g. "GitHub".' })
  label!: string;

  @Field()
  url!: string;

  @Field(() => Int, { description: 'Sort order, ascending.' })
  position!: number;
}
