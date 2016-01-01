var expect = require('expect.js');
var fs     = require('fs');


var recorder = require('../');


describe("Initial test suite", function(){

  var scene;
  it("Should should setup everything properly", function(){
    scene = new recorder({
      x : 0,
      y : 0,
      w : 640,
      h : 480,
    });
  });



 it("Should cannot start recording until warmup", function(done){
    scene.StartRecord(function(err){
      expect(err).to.be.ok();
      done();
    });
  });


  it("Should warmup underlying capture engine", function(done){

    scene.warmup(function(err){
      expect(err).not.to.be.ok();

      scene.warmup(function(err){
        expect(err).to.be.ok(); //cannot warmup twice
        done();
      });

    });

  });

 it("Should start recording", function(done){
    scene.StartRecord(function(err){
      expect(err).not.to.be.ok();
      done();
    });
  });


 it("Should stop recording", function(done){
    this.timeout(10 * 1000);

    scene.once(recorder.EVENT_DONE, function(err, path){
      expect(err).not.to.be.ok();
      expect(fs.existsSync(path)).to.be.ok();
      fs.renameSync(path, path + ".mp4");
      console.log("Capture ready in %s", path + ".mp4");
      done();
    });

    setTimeout(function(){
      scene.StopRecord(function(err){
        expect(err).not.to.be.ok();

        scene.StopRecord(function(err){
          expect(err).to.be.ok(); //cannot stop twice
        });

      });
    }, 5000);

  });



});