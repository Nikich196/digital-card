import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'A concrete, verifiable outcome of a role.' })
export class Achievement {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field(() => Int)
  position!: number;
}
