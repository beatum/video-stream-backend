/**
 * @author Happy.He
 * @email Beatum.He@outlook.com
 * @create date 2024-06-07 11:33:28
 * @modify date 2024-06-07 11:33:28
 * @desc MediaService
 */

import { Injectable, Logger } from '@nestjs/common';
import { FFMpegTask } from './ffmpegTask';
import { FfmpegTaskDto } from './dto/ffmpegTaskDto';
import { readFileSync } from 'fs';

@Injectable()
export class MediaService {
  /*
  private readonly options = [
    '-c:v copy',
    '-c:a copy',
    '-max_delay 1',
    '-hls_time 1',
    '-hls_list_size 2',
    '-fflags flush_packets',
  ];
  */
  private readonly logger = new Logger(MediaService.name);

  private _videoTasks = new Map<string, FFMpegTask>();

  //file path of configuration.
  private readonly _filePathOfConfig = './streamconfig.json';

  //config file.
  private _config: any;

  constructor() {
    this.ReadConfigFile();
  }

  private ReadConfigFile() {
    try {
      this._config = JSON.parse(readFileSync(this._filePathOfConfig, 'utf8'));
      for (const taskInfo of this._config.streams) {
        const dto = new FfmpegTaskDto();
        dto.taskId = taskInfo.taskId;
        dto.taskName = taskInfo.taskName;
        dto.inputUrl = taskInfo.inputUrl;
        dto.options = taskInfo.options;
        const task = new FFMpegTask(dto);
        this._videoTasks.set(taskInfo.taskId, task);
      }
    } catch (error) {
      this.logger.error('Load configuration failed:' + error.message);
    }
  }

  //get all tasks.
  public GetTasks() {
    return this._videoTasks;
  }
}
