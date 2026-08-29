import { Module } from '@nestjs/common';

import { ExperienceResolver } from '../experience/experience.resolver';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  providers: [ProfileService, ProfileResolver, ExperienceResolver],
})
export class ProfileModule {}
