import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory, SkillLevel } from '@prisma/client';

registerEnumType(SkillCategory, { name: 'SkillCategory' });
registerEnumType(SkillLevel, { name: 'SkillLevel' });

@ObjectType({ description: 'A single skill with a self-assessed level.' })
export class Skill {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;

  @Field(() => SkillLevel)
  level!: SkillLevel;
}
