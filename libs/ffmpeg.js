"use strict";

const exec    = require('nyks/child_process/exec');
const tmppath = require('nyks/fs/tmppath');
const defer   = require('nyks/promise/defer');

class FFMPEGRecorder {

  constructor(rect) {
    this._recordingRect = rect; //{x,y,w,h}
    this._tmpPath  = `${tmppath()}.avi`;
  }

  async warmup() {
    if(this.recorder)
      throw `Recorder already started, please create new instance`;

    const option = {
      threads    : 'auto',
      r          : '30',
      f          : 'x11grab',
      video_size : `${this._recordingRect.w}x${this._recordingRect.h}`,
      draw_mouse : 0,
      i          : ':0',
      'c:v'      : 'h264_nvenc',
      preset     : 'losslesshp',
      y          : null,
      "ivs-rc"   : null
    };

    var cmd_opt = [];
    for(const key in option) {
      cmd_opt.push(`-${key}`);
      if(option[key] != null)
        cmd_opt.push(option[key]);
    }

    cmd_opt.push(this._tmpPath);
    this.recorder = exec('ffmpeg', cmd_opt, console.log);
    this._recorderState = 'ready';
  }

  StartRecord() {
    if(this._recorderState != 'ready')
      throw `No recording process available`;
    console.log('start recording ');
    this.recorder.kill('SIGUSR2');
    this._recorderState = 'recording';
  }

  async StopRecord() {
    if(this._recorderState != 'recording')
      throw `No recording process running`;
    console.log('stop recording ');
    this._recorderState = 'stopped';
    var defered = defer();
    this.recorder.once('close', defered.resolve.bind(null, this._tmpPath));
    this.recorder.once('exit', defered.resolve.bind(null, this._tmpPath));
    this.recorder.kill('SIGTERM');
    return defered;
  }

}


module.exports = FFMPEGRecorder;
