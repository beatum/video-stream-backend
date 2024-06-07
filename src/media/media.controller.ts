/**
 * @author Happy.He
 * @email Beatum.He@outlook.com
 * @create date 2024-06-07 11:33:28
 * @modify date 2024-06-07 11:33:28
 * @desc MediaController
 */

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { readFile } from 'fs';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}
  @Get('hls/:id/:file')
  test(
    @Res() response,
    @Req() request,
    @Param('id') id: string,
    @Param('file') file: string,
  ) {
    const tasks = this.mediaService.GetTasks();
    const task = tasks.get(id);
    if (null == task || undefined == task) {
      throw new NotFoundException('No such task found with id:' + id);
    }
    task.Refresh();
    const filePath = './_media/' + id + '/' + file;
    readFile(filePath, function (error, content) {
      response.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      if (error) {
        response.end('', 'utf-8');
      } else {
        response.end(content, 'utf-8');
      }
    });
  }
}
