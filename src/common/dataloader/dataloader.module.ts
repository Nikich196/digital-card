import { Module } from '@nestjs/common';

import { ExperienceModule } from '../../experience/experience.module';
import { LinkModule } from '../../link/link.module';
import { ProjectModule } from '../../project/project.module';
import { SkillModule } from '../../skill/skill.module';
import { LoaderFactory } from './loader.factory';

@Module({
  imports: [LinkModule, SkillModule, ExperienceModule, ProjectModule],
  providers: [LoaderFactory],
  exports: [LoaderFactory],
})
export class DataLoaderModule {}
