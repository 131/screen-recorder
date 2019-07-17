"use strict";

const Events  = require('events');
const Vlc     = require('vlc-remote/player');

const mask_join = require('nyks/object/mask');
const tmppath   = require('nyks/fs/tmppath');
const defer     = require('nyks/promise/defer');
const sleep     = require('nyks/function/sleep');




class ScreenRecorder extends Events.EventEmitter  {

  constructor(rect, transcodeOpt) {
    super();
    this._duration = 180;
    this._grabFps  = 20;
    this._recordingRect = rect; //{x,y,w,h}
    this._transcodeOpt  = transcodeOpt || {};
  }

  async warmup() {
    if(this.recorder)
      throw `Recorder already started, please create new instance`;

    this._tmpPath  = tmppath();
    console.log("Recording in %s", this._tmpPath);
    var transcodeOpt = {
      'vcodec' : 'h264',
      'venc'   : "x264{preset=ultrafast,profile=baseline,crf=0}", //"x264{qp=1}"
      'fps'    : this._grabFps,
      'acodec' : 'none',
      'scale'  : 1,
      'width'  : this._recordingRect.w,
      'height' : this._recordingRect.h,
      ...this._transcodeOpt
    };
    var transcode = mask_join(transcodeOpt, '%s=%s', ',');
    var outputOpt = {
      'access' : 'file',
      'mux'    : 'mp4',
      'dst'    : `"${this._tmpPath}"`
    };
    var output = mask_join(outputOpt, '%s=%s', ',');
    var args = {
      'screen-fps'       : transcodeOpt.fps,
      'screen-top'       : this._recordingRect.x,
      'screen-left'      : this._recordingRect.y,
      'screen-width'     : this._recordingRect.w,
      'screen-height'    : this._recordingRect.h,
      'run-time'         : this._duration,
      'sout'             : `#transcode{${transcode}}:duplicate{dst=std{${output}}}`,
    };
    this.recorder = new Vlc({args});
    await this.recorder.start();
    this._recorderState = 'ready';
  }

  StartRecord() {
    if(this._recorderState != 'ready')
      throw `No recording process available`;
    this._recorderState = 'recording';
    var defered = defer();
    this.recorder.screenRecorder(defered.chain);
    return defered;
  }

  async StopRecord() {
    if(this._recorderState != 'recording')
      throw `No recording process running`;
    this._recorderState = 'stopped';
    var defered = defer();
    this.recorder.shutdown(() => {});
    this.recorder.once('close', defered.resolve(this._tmpPath));
    this.recorder.once('exit', defered.resolve(this._tmpPath));
    await defered;
    await sleep(200);
    return this._tmpPath;
  }

}


module.exports = ScreenRecorder;
