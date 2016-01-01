var console = require('nwconsole'),
    fs  = require('fs'),
    net = require('net'),
    cp  = require('child_process'),
    tmp = require('tmp');


var Class     = require('uclass');
var Events    = require('uclass/events');
var mask_join = require('nyks/object/mask');
var map       = require('mout/object/map');
var values    = require('mout/object/values');

var Main = new Class({
  RC_PORT : 8088,

  _tmpPath  : null,
  _duration : 180,
  _grabFps  : 20,
  _recordingRect : null,

  _vlcCtrlStream : null,
  _recordingProcess : null,

  initialize : function(rect) {
    this._tmpPath       = tmp.tmpNameSync();
    console.log("Recording in %s", this._tmpPath);
    this._recordingRect = rect; //{x,y,w,h}
  },

  warmup : function(chain) {
    chain = once(chain);

    var self = this;

    this.off('  

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
    }, transcode = mask_join(transcodeOpt, '%s=%s', ',');

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

      'intf'             : 'none',
      'dummy-quiet'      : null,
      'screen-fps'       : self._grabFps,
      'screen-top'       : self._recordingRect.x,
      'screen-left'      : self._recordingRect.y,
      'screen-width'     : self._recordingRect.w,
      'screen-height'    : self._recordingRect.h,
      'run-time'         : self._duration,

      'extraintf'        : 'rc',
      'rc-host'          : 'localhost:' + self.RC_PORT,
      'rc-quiet'         : null, 
      'sout'             : '#transcode{'+transcode+'}:duplicate{dst=std{'+output+'}}',
    }, args = values( map(configOpt, function(v, k){
      return '--' + k + '' +(v === null ? '' : '=' + v);
    } ));

    var cmd = "vlc\\vlc.exe";
    console.log(cmd);
    var record = self._recordingProcess = cp.spawn(cmd, args);

    record.on("exit", function(){
      self._recordingProcess = null;
      self.emit(module.exports.EVENT_DONE, null, self._tmpPath);
    });

    process.on('exit', function(code) {
      record.kill();
    });

    self._vlcCtrlStream = net.connect(self.RC_PORT, function(){
      console.log("Connected to " + self.RC_PORT);
      chain();
    });

    self._vlcCtrlStream.setNoDelay();

  },

  StartRecord : function(chain) {
    this._send("add screen://\r\n", chain);
  },

  _send : function(str, chain) {
    this._vlcCtrlStream.write(str, chain);
  },

  StopRecord : function(chain) {
    if (this._recordingProcess == null)
        return;

    try {
      this._send("quit\r\n", chain);
    } catch (e){ }
  }
});


module.exports = Main;

module.exports.EVENT_DONE = 'done';
