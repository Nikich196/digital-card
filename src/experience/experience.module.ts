import { Module } from '@nestjs/common';

import { ExperienceService } from './experience.service';

@Module({
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
