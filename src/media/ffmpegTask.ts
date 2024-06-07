/**
 * @author Happy.He
 * @email Beatum.He@outlook.com
 * @create date 2024-06-07 11:31:41
 * @modify date 2024-06-07 11:31:41
 * @desc Ffmpeg task management.
 */

import * as ffmpeg from 'fluent-ffmpeg';
import { Logger } from '@nestjs/common';
import { FfmpegTaskDto } from './dto/ffmpegTaskDto';
import { setInterval } from 'timers';
import { existsSync, mkdirSync, readdir, unlink } from 'node:fs';
import { join } from 'node:path';

export class FFMpegTask {
  constructor(taskDto: FfmpegTaskDto) {
    this._ffmpegcommand = ffmpeg();
    this._ffmpegcommand.setFfmpegPath(process.env.FFMPEG_PATH);
    this._ffmpegTaskDto = taskDto;
    this.init();
    this.deleteAllFilesInDir(this._outputDirectory);
    this.LaunchTask();
  }
  private readonly logger = new Logger(FFMpegTask.name);
  private _ffmpegTaskDto: FfmpegTaskDto;
  private _ffmpegcommand = null;
  private _isRuning: boolean;

  private _lastExecutionTime: number;

  private _isInuseIntervalID: NodeJS.Timeout;

  private _outputPathWithIndex: string;

  private _outputDirectory: string;

  //initial
  private init() {
    this._ffmpegcommand.input(this._ffmpegTaskDto.inputUrl);
    this._ffmpegcommand.output(this.GetOutputPath());
    this._ffmpegcommand.addOptions(this._ffmpegTaskDto.options);
    this._ffmpegcommand.on('start', this.OnStart);
    this._ffmpegcommand.on('error', this.OnStdError);
  }

  //on start event.
  private OnStart = (commandLine: string) => {
    this.StartIsInuseInterval();
    this._isRuning = true;
    this.logger.log('Ffpmeg task is started:' + commandLine);
    this.logger.log('Task is running with id:' + this._ffmpegTaskDto.taskId);
  };

  //On Error event.
  private OnStdError = (commandLine: string) => {
    this.ClearIsInuseInterval;
    this._isRuning = false;
    this._ffmpegcommand.kill();
    this.logger.warn(
      'Ffpmeg task error:' +
        commandLine +
        ' with id:' +
        this._ffmpegTaskDto.taskId,
    );
    this.logger.log('Task is stop with id:' + this._ffmpegTaskDto.taskId);
  };

  //Get current time as long.
  private GetCurrentStampAsLong(): number {
    const now: Date = new Date();
    return now.getTime();
  }

  //Get output path.
  private GetOutputPath() {
    const tempPath = './_media/' + this._ffmpegTaskDto.taskId;
    if (!existsSync(tempPath)) {
      mkdirSync(tempPath, { recursive: true });
    }
    this._outputDirectory = tempPath;
    this._outputPathWithIndex = tempPath + '/index.m3u8';
    return this._outputPathWithIndex;
  }

  //kill task with a command.
  public KillTask(cmd: string) {
    this._ffmpegcommand.kill(cmd);
  }

  //To start interval for monitor.
  private StartIsInuseInterval() {
    this._lastExecutionTime = new Date().getTime();
    this._isInuseIntervalID = setInterval(() => {
      const tookMs: number = new Date().getTime() - this._lastExecutionTime;
      if (tookMs >= 30000) {
        this.ClearIsInuseInterval();
        this._ffmpegcommand.kill();
        this.logger.warn(
          'Task:' + this._ffmpegTaskDto.taskId + ' is stop after 30 Seconeds.',
        );
      }
    }, 30000);
  }

  //To clear interval for monitor.
  private ClearIsInuseInterval() {
    try {
      clearInterval(this._isInuseIntervalID);
    } catch (error) {
    } finally {
      this._isInuseIntervalID = null;
      this._isRuning = false;
    }
  }

  //Stop.
  public Stop() {
    this._ffmpegcommand.kill();
    this.ClearIsInuseInterval();
    this._isRuning = false;
  }

  //Resume.
  public Resume() {
    this._ffmpegcommand.run();
    this._isRuning = true;
    //this.StartIsInuseInterval();
    this.logger.log('Task resume with id:' + this._ffmpegTaskDto.taskId);
  }

  //Launch task.
  public LaunchTask() {
    this._ffmpegcommand.run();
    this._isRuning = true;
    //this.StartIsInuseInterval();
  }

  //Get status of this task.
  public ISRuning() {
    return this._isRuning;
  }

  public GetTaskInfo() {
    return this._ffmpegTaskDto;
  }

  //Refresh task.
  public Refresh() {
    this._lastExecutionTime = this.GetCurrentStampAsLong();
    if (!this._isRuning) {
      this.deleteAllFilesInDir(this._outputDirectory);
      this.LaunchTask();
      this.logger.log('Task refresh with id:' + this._ffmpegTaskDto.taskId);
    }
  }

  //Remove all files under a directory
  private deleteAllFilesInDir(dirPath) {
    readdir(dirPath, (err, files) => {
      if (err) {
        this.logger.error(
          'Failed to delete all temporary files under ' + dirPath,
        );
      } else {
        files.map(
          (file) => unlink(join(dirPath, file), () => {}),
          this.logger.log('delete all temporary files under ' + dirPath),
        );
      }
    });
  }
}
