import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

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

  // Declared as GraphQLISODateTime rather than String: a Date behind a String
  // field is serialised with String(), which yields epoch milliseconds — the
  // opposite of what the description promises.
  @Field(() => GraphQLISODateTime, { description: 'First day of the role.' })
  startedAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true, description: 'Null while ongoing.' })
  finishedAt!: Date | null;

  @Field(() => Boolean, { description: 'Derived from finishedAt.' })
  isCurrent?: boolean;

  @Field(() => [Achievement])
  achievements?: Achievement[];
}
