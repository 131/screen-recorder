"use strict";

const fs     = require('fs');
const expect = require('expect.js');

const sleep  = require('nyks/async/sleep');

const {vlc : Recorder} = require('../');

describe("Initial test suite", function() {

  var scene;
  this.timeout(10 * 1000);

  it("Should should setup everything properly", function(){
    scene = new Recorder({
      x : 0,
      y : 0,
      w : 640,
      h : 480,
    }, {
      'fps'    : 20,
    });
  });



 it("Should cannot start recording until warmup", async function() {
    try {
      await scene.StartRecord();
      expect().to.fail("Never here");
    } catch(err) {
      expect(err).to.match(/No recording process available/);
    }
  });


  it("Should warmup underlying capture engine", async function() {
    await  scene.warmup();

    try {
      await scene.warmup();
      expect().to.fail("Never here");
    } catch(err) {
      expect(err).to.match(/already started/); //cannot warmup twice
    }

  });

 it("Should start recording", async function() {
    await scene.StartRecord();
  });


 it("Should stop recording", async function() {
    this.timeout(10 * 1000);
    await sleep(5000);

    const moviePath = await scene.StopRecord();

    expect(fs.existsSync(moviePath)).to.be.ok();
    fs.renameSync(moviePath, moviePath + ".mp4");
    console.log("Capture ready in %s", moviePath + ".mp4");

    try {
      await scene.StopRecord();
      expect().to.fail("Never here");
    } catch(err) {
      expect(err).to.match(/No recording process running/); //cannot StopRecord twice
    }

  });



}); 