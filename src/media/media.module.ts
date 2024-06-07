/**
 * @author Happy.He
 * @email Beatum.He@outlook.com
 * @create date 2024-06-07 11:33:28
 * @modify date 2024-06-07 11:33:28
 * @desc MediaModule
 */

import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
