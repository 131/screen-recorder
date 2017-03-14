# Motivation

[![Version](https://img.shields.io/npm/v/screen-capture-recorder.svg)](https://www.npmjs.com/package/screen-capture-recorder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)


Screen recorder is a wrapper around VLC desktop screen recording capability with a very simple API.

Capture codec is optimized to VLC real time capture best setting (ogg/theo, hight bitrate).
Feel free to transcode/re-encode as please you afterward.

# Note
ffmpeg can also grab desktop, yet, we prefer a minimal (bundled) VLC for its ability to expose a telnet/rc interface and start capture very quickly (as the VLC process is already running in the background).


# Installation
```
npm install screen-capture-recorder
```


# API

```
var recorder = require('screen-capture-recorder');
var scene    = new recorder({ x:0, y:0, w:640, h:480 });

scene.warmup(function(err){
  //recorder is ready, now start capture
  scene.StartRecord(function(err){
    if(err)
      console.log("Something got wrong");
    //capture start _very_ quicky (60ms)
  });

  setTimeout(function(){

    scene.once(recorder.EVENT_DONE, function(err, tmp_path) {
      if(!err)
        console.log("Everything is ok, find video in %s.ogg", tmp_path);
      //tmp_path is a temporary file that will be deleted on process exit, keep it by renaming it
      require('fs').renameSync(tmp_path, tmp_path + ".ogg");
    });

    scene.StopRecord(function(err){
      if(err)
        console.log("Something got wrong");
    });
  }, 1000 * 10);
});

```

