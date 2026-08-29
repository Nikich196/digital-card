import { Module } from '@nestjs/common';

import { SkillService } from './skill.service';

@Module({
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
