/***********************************************
	Frame flipper extracted from library.js
************************************************/
if(!window.eveo) { window.eveo = {}; }
eveo.browser = {
  IE : (navigator.appName=="Microsoft Internet Explorer"),
  isiPAD : /iPad/.exec(navigator.userAgent)
}

eveo.library = {
  log : function (message) {
    if (window.console && window.console.log) { window.console.log(message); }
  },
	getElement : function( oHTMLElement ) {
    if (typeof(oHTMLElement)=="string")  {
      oHTMLElement = document.getElementById(oHTMLElement);
    }
    return oHTMLElement;
  }
};

/*

  params {
    target: elementId (string),
    touchArea: elementId (string),
    numberOfFrames: 25 (int),
    filePath: ../images/path/ (string),
    fileName: fileName (string), // assumes images names fileName01.png, fileName02.png, ..., fileName25.png
    fileExt: png (string),
    cacheSize: 6 (int),
    startingFrame: 1 (int), // optional
    infiniteRotation: true|false, // default true
    onRotate: callback (function) // optional
  }


*/

eveo.rotater = function(params) {
  
  var self, i, max, rotatedEls, touchAreaEl, numberOfFrames, filePrefixs, fileSuffixs, cacheSize, startingFrame, numOfFramesDigits, lastTouchPosX, currFrameNum, infiniteRotation, rotateToFrameTimer, rotateCallback, pageContainer;
  
  self = this;
  
  // assign parameters to local variables
  if(params.target) {
    rotatedEls = [];
    for (i=0, max=params.target.length; i < max; i++) {
      rotatedEls.push(eveo.library.getElement(params.target[i]));
    } 
  } else { throw("missing target"); }
  if(params.touchArea) { touchAreaEl = eveo.library.getElement(params.touchArea); } else { eveo.library.log("missing target area - but this is okay if you are controlling the rotation manually: rotateForward,rotateBackward,rotateToFrame"); }
  if(!touchAreaEl) { eveo.library.log("missing target area - unable to find element ("+params.touchArea+") in dom"); }
  if(params.numberOfFrames) { numberOfFrames = params.numberOfFrames; } else { throw("missing number of frames"); }
  if(params.filePath && params.fileName) {
    filePrefixs = [];
    for (i=0, max=params.filePath.length; i < max; i++) {
      filePrefixs.push(params.filePath[i] + params.fileName[i]);
    }
  } else { throw("missing file path or file name"); }
  if(params.fileExt) {
    fileSuffixs = [];
    for (i=0, max=params.fileExt.length; i < max; i++) {
      fileSuffixs.push("." + params.fileExt[i]);
    }
  } else { throw("missing file extention"); }
  if(params.cacheSize) { cacheSize = params.cacheSize; } else { throw("missing cache size"); }
  if(params.infiniteRotation != undefined) { infiniteRotation = params.infiniteRotation; } else { infiniteRotation = true; }
  if(params.onRotate) { rotateCallback = params.onRotate; }
  
  currFrameNum = startingFrame = params.startingFrame && (params.startingFrame > 0 && params.startingFrame < numberOfFrames) ? params.startingFrame : 1;
  numOfFramesDigits = (numberOfFrames + "").length;
  pageContainer = $("#page-container"); // needed to toggle between "no-flick" class which toggles translate3d hardware acceleration
  
  function init() {
    preloadFrames();
    setupEvents();
  }
  
  function onRotate() {
    if(rotateCallback) { rotateCallback(); }
  }
  
  function getFrameUrls(frameNum) {
    var frameUrls = [];
    for (i=0, max = filePrefixs.length; i < max; i++) {
      frameUrls.push(filePrefixs[i] + frameNum.padWithZeroesToLength(numOfFramesDigits) + fileSuffixs[i]);
    }
    return frameUrls;
  }
  
  function endingRotate(event) {

    if (touchAreaEl) {
    	pageContainer.addClass("no-flick");
      touchAreaEl.removeEventListener("touchmove", rotating, false);
      touchAreaEl.removeEventListener("touchmove", endingRotate, false);
    }

  }
  
  function rotating(event) {
  
    event.preventDefault();
    event.stopPropagation();
    
    var currPosX = event.touches[0].pageX;

    if (lastTouchPosX < currPosX) {
      self.rotateForward();
    }
    else if (lastTouchPosX > currPosX) {
      self.rotateBackward();
    }

    lastTouchPosX = currPosX;
    
    
    return false;
  }
  
  function startingRotate(event) {

    if (touchAreaEl) {
    	pageContainer.removeClass("no-flick");
      touchAreaEl.addEventListener("touchmove", rotating, false);
      touchAreaEl.addEventListener("touchend", endingRotate, false);
    }
    
    lastTouchPosX = event.touches[0].pageX;

  }
  
  function setupEvents() {

    if (touchAreaEl) {
      touchAreaEl.addEventListener("touchstart", startingRotate, false);
    }
  }
  
  function preloadFrames() {
  
    var i, j, max, cacheFrame, img, frameUrls;
    
    cacheFrame = currFrameNum - Math.floor(cacheSize / 2);

    if (cacheFrame < 1) { 
      cacheFrame += numberOfFrames;
    }
  
    for (i=0; i < cacheSize; i++) {
      frameUrls = getFrameUrls(cacheFrame);
      for (j=0, max = frameUrls.length; j < max; j++) {
        img = document.createElement("img");
        img.src = frameUrls[j];
      }
      cacheFrame++;
      if (cacheFrame > numberOfFrames) { cacheFrame = 1; }
    }

  }
  
  self.resetRotation = function() {
    currFrameNum = startingFrame;
    
    var frameUrls = getFrameUrls(currFrameNum);
    for (i=0, max = frameUrls.length; i < max; i++) {
      rotatedEls[i].src = frameUrls[i];
    }
  };
  
  self.rotateForward = function() {
    var frameUrls, i, max;
    currFrameNum++;
    if (currFrameNum > numberOfFrames) {
      currFrameNum = infiniteRotation ? 1 : numberOfFrames;
    }
    frameUrls = getFrameUrls(currFrameNum);
    for (i=0, max = frameUrls.length; i < max; i++) {
      rotatedEls[i].src = frameUrls[i];
    }
    
    onRotate();
    preloadFrames();
  };
  
  self.rotateBackward = function() {
    var frameUrls, i, max;
    currFrameNum--;
    if (currFrameNum < 1) {
      currFrameNum = infiniteRotation ? numberOfFrames : 1;   
    }
    frameUrls = getFrameUrls(currFrameNum);
    for (i=0, max = frameUrls.length; i < max; i++) {
      rotatedEls[i].src = frameUrls[i];
    }

    onRotate();
    preloadFrames();
  };
  
  self.rotateToFrame = function(frameNumber, callback) {

    var milliSecondsPerFrame = 10;
    
    if(rotateToFrameTimer) { clearTimeout(rotateToFrameTimer); }
    rotateToFrameTimer = setTimeout(rotateFunc,milliSecondsPerFrame);
    
    function rotateFunc() {
      if (frameNumber > currFrameNum) {
        self.rotateForward();
        rotateToFrameTimer = setTimeout(rotateFunc,milliSecondsPerFrame);
      }
      else if (frameNumber < currFrameNum) {
        self.rotateBackward();
        rotateToFrameTimer = setTimeout(rotateFunc,milliSecondsPerFrame);
      }
      else {
        clearTimeout(rotateToFrameTimer);
        if (callback) { callback(); }
      }
    }
  };
  
  self.rotateToFrameShortest = function(frameNumber, callback) {

    var milliSecondsPerFrame = 10,
        shortestPathForward = (frameNumber > currFrameNum) ? (frameNumber - currFrameNum) : (frameNumber - currFrameNum + numberOfFrames),
        shortestPathBackward = (frameNumber < currFrameNum) ? (currFrameNum - frameNumber) : (currFrameNum - frameNumber + numberOfFrames),
        goForward = shortestPathForward < shortestPathBackward;
    
    function rotateFunc() {
    
      if (currFrameNum === frameNumber) {
        clearTimeout(rotateToFrameTimer);
        if (callback) { callback(); }
      }
      else {
        if (goForward) {
          self.rotateForward();
        }
        else {
          self.rotateBackward();
        }
        rotateToFrameTimer = setTimeout(rotateFunc,milliSecondsPerFrame);
      }  
    }
    
    if(rotateToFrameTimer) { clearTimeout(rotateToFrameTimer); }
    rotateToFrameTimer = setTimeout(rotateFunc,milliSecondsPerFrame);
    
  };

  init();
  
  return self;

}; // end rotater

////////////////////////////////////////////////////////////////////////////////
//
// Number.padWithZeroesToLength( integer length) - ensures a number is padded with zeroes
//    to provided length. Example x = 1,  x.padWithZeroesToLength(3) returns "001"
//
////////////////////////////////////////////////////////////////////////////////
Number.prototype.padWithZeroesToLength = function( length ) {
	var tempString = this.toString(),
      lengthOfTempString = tempString.length,
	    pileOfPads = "000000000000000000000000";
	if (lengthOfTempString >= length) {
  	retVal = tempString;
	} else {
  	retVal = pileOfPads + tempString;
  	retVal = retVal.substring(retVal.length-length);
	}
	return retVal;
}