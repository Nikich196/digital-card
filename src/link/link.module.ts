import { Module } from '@nestjs/common';

import { LinkService } from './link.service';

@Module({
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
