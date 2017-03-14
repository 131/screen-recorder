"use strict";

const fs      = require('fs');
const net     = require('net');
const path    = require('path');
const cp      = require('child_process');
const Events  = require('events');

const mask_join = require('nyks/object/mask');
const tmppath   = require('nyks/fs/tmppath');
const map       = require('mout/object/map');
const values    = require('mout/object/values');
const merge     = require('mout/object/merge');
const  once      = require('nyks/function/once');


const RC_PORT  = 8088;

class ScreenRecorder extends Events.EventEmitter {

  constructor(rect, transcodeOpt) {
    super();

    this._duration = 180;
    this._grabFps  = 20;
    this._vlcCtrlStream = null;

    this._tmpPath       = tmppath();
    console.log("Recording in %s", this._tmpPath);
    this._recordingRect = rect; //{x,y,w,h}
    this._recorderState = 'init';  //['init', 'warmup', 'ready', 'recording', 'stopped']
    this._transcodeOpt  = transcodeOpt || {};
  }

  warmup(chain) {

    chain = once(chain);

    var self = this;
    if(self._recorderState != 'init')
      return chain("Invalid recorder status");

    self._recorderState = 'warmup';

    self._onFailure = function(){
      chain("VLC Closed too early");
    }


    var transcodeOpt = {
      'vcodec' : 'theo',
      'vb'     : 10240,
      'fps'    : self._grabFps,
      'acodec' : 'none',
      'scale'  : 1,
      'width'  : self._recordingRect.w,
      'height' : self._recordingRect.h,
    }, transcode = mask_join(merge(transcodeOpt, self._transcodeOpt), '%s=%s', ',');

    var outputOpt = {
      'access' : 'file',
      'mux'    : 'ogg',
      'dst'    : '"' + self._tmpPath + '"',
    }, output = mask_join(outputOpt, '%s=%s', ',');

    var configOpt = {
      'no-screen-follow-mouse' : null,

      'ignore-config'    : null,
      'no-plugins-cache' : null,
      'verbose'          : 0,
      'no-media-library' : null,
      'config'           : 'blank',

      'intf'             : 'dummy',
      'dummy-quiet'      : null,
      'screen-fps'       : self._grabFps,
      'screen-top'       : self._recordingRect.x,
      'screen-left'      : self._recordingRect.y,
      'screen-width'     : self._recordingRect.w,
      'screen-height'    : self._recordingRect.h,
      'run-time'         : self._duration,

      'no-crashdump'     : null,
      'extraintf'        : 'rc',
      'rc-host'          : 'localhost:' + RC_PORT,
      'rc-quiet'         : null, 
      'sout'             : '#transcode{'+transcode+'}:duplicate{dst=std{'+output+'}}',
    }, args = values( map(configOpt, function(v, k){
      return '--' + k + '' +(v === null ? '' : '=' + v);
    } ));



    var vlc_path = path.join(__dirname, "vlc/vlc.exe");
    var recorder = cp.spawn(vlc_path, args);

    if(false)
      recorder.stderr.pipe(process.stderr);

    recorder.once('error', function(){
      chain("Cannot find VLC in " + vlc_path);
    });

    recorder.once("exit", function(){
      if(self._recorderState != 'stopped')
        return self.emit(module.exports.EVENT_DONE, "Invalid exit status", self._tmpPath);
      self._recorderState = 'init';
      self.emit(module.exports.EVENT_DONE, null, self._tmpPath);
    });

    process.on('exit', function(code) {
      recorder.kill();
    });


    var attempt = 5;
    (function doConnect(){
      console.log("Trying to connect after 1s");

      self._vlcCtrlStream = net.connect(RC_PORT, function(){
        console.log("Connected to " + RC_PORT);
        self._recorderState = 'ready';
        self._vlcCtrlStream.removeAllListeners("error");
        chain();
      });

      self._vlcCtrlStream.setNoDelay();

      self._vlcCtrlStream.on("error", function(){
        attempt --;
        if(!attempt)
          return chain("Could not connect");

        setTimeout(doConnect, 1000);
        console.log("Failed to connect to, reconnect");
      });
    })();


  }


  StartRecord(chain) {
    if(this._recorderState != 'ready')
      return chain("No recording process available");
    this._recorderState = 'recording';

    this._send("add screen://\r\n", chain);
  }

  _send (str, chain) {
    if(!this._vlcCtrlStream)
      return chain("VLC stream not ready");

    this._vlcCtrlStream.write(str, chain);
  }

  StopRecord (chain) {
    if(this._recorderState != 'recording')
      return chain("No recording process running");
    this._recorderState = 'stopped';

    this._send("quit\r\n", chain);
  }

};


module.exports = ScreenRecorder;
module.exports.EVENT_DONE = 'done';
