import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Achievement } from './achievement.model';

@ObjectType({ description: 'A period of work at one company.' })
export class Experience {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field()
  position!: string;

  @Field()
  summary!: string;

  @Field(() => String, { description: 'ISO date, first day of the role.' })
  startedAt!: Date;

  @Field(() => String, { nullable: true, description: 'ISO date, null while ongoing.' })
  finishedAt!: Date | null;

  @Field(() => Boolean, { description: 'Derived from finishedAt.' })
  isCurrent?: boolean;

  @Field(() => [Achievement])
  achievements?: Achievement[];
}
