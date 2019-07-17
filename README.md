# Motivation

[![Build Status](https://travis-ci.org/131/screen-recorder.svg?branch=master)](https://travis-ci.org/131/screen-recorder)
[![Version](https://img.shields.io/npm/v/screen-capture-recorder.svg)](https://www.npmjs.com/package/screen-capture-recorder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
![Available platform](https://img.shields.io/badge/platform-win32\/linux-blue.svg)

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
'use strict';

const {vlc : Recorder} = require('./'); //you can also use {ffmpeg : Recorder}
const sleep = require('nyks/function/sleep');

(async() => {

  const scene = new Recorder( {x : 0, y : 0 , w : 640 , h : 480} );
  await scene.warmup();
  await scene.StartRecord();
  await sleep(5000);
  const moviePath = await scene.StopRecord();
  console.log(moviePath);
})();


```

