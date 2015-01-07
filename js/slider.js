// slider code
Apple = {
  browser : {
    FF     : (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)),
    SAFARI : (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)),
    IE : (navigator.appName=="Microsoft Internet Explorer")
  },
  ////////////////////////////////////////////////////////////////////////////
  // SLIDER                                                                 //
  // ======                                                                 //
  ////////////////////////////////////////////////////////////////////////////
  slider : {
    activeSlider : null,   // This will hold the Active Slider Object (the one responding to mousemove events)
    defaults : {
      sliderType: "Linear",
      minValue:0,
      maxValue:100,
      initialValue:0,
      allowsTickMarkValuesOnly:false,
      numberOfTickMarks: 0,
      tickMarkPosition: "Above",
      onSlide: function() { //document.getElementById('x').innerHTML = "Value: " + this._value + "<br/>VPP: " + this._valuePerPixel;

      },
      onSlideComplete: function() { //alert('done!\n\nFinal value is ' + this._value);
      },
      height: 19,
      width: 19
    },
    valid : {
      sliderTypes: ["Linear", "Circular"],
      tickMarkPositions: ["Above", "Below","Arrow"],
      minHeight: 19,
      minWidth: 19
    },
    /////////////////////////////////////////////////////////////////////////////
    // slider.create( string id, OPTIONAL JSON params ) - creates a new Slider //
    // ---------------------------------------------                           //
    /////////////////////////////////////////////////////////////////////////////
    create : function(id, params) {
      params = params || this.defaults;
      var _sliderObj = document.getElementById(id);

      if (_sliderObj) {
        _sliderObj.id = id;

        // Get a handle to the SliderTrack and SliderThumb child Objects
        if (_sliderObj.getElementsByClassName) {
          _sliderObj._track = _sliderObj.getElementsByClassName('sliderTrack')[0];
          _sliderObj._thumb = _sliderObj.getElementsByClassName('sliderThumb')[0];
          _sliderObj._ticks = _sliderObj.getElementsByClassName('sliderTicks')[0];
        } else {
          // Use another mechanism to find the child objects
          _sliderObj._track = _sliderObj.childNodes[1];
          _sliderObj._thumb = _sliderObj.childNodes[3];
          _sliderObj._ticks = _sliderObj.childNodes[4];
        }

        // Add arbitrary properties to the containing element
        _sliderObj._sliderType               = params["sliderType"]               || this.defaults.sliderType;
        _sliderObj._minValue                 = params["minValue"]                 || this.defaults.minValue;
        _sliderObj._maxValue                 = params["maxValue"]                 || this.defaults.maxValue;
        _sliderObj._doubleValue              = params["initialValue"]             || this.defaults.initialValue;
        _sliderObj._height                   = params["height"]                   || this.defaults.height;
        _sliderObj._width                    = params["width"]                    || this.defaults.width;
        _sliderObj._numberOfTickMarks        = params["numberOfTickMarks"]        || this.defaults.numberOfTickMarks;
        _sliderObj._tickMarkPosition         = params["tickMarkPosition"]         || this.defaults.tickMarkPosition;
        _sliderObj._allowsTickMarkValuesOnly = params["allowsTickMarkValuesOnly"] || this.defaults.allowsTickMarkValuesOnly;
        _sliderObj._onSlide                  = params["onSlide"]                  || this.defaults.onSlide;
        _sliderObj._onSlideComplete          = params["onSlideComplete"]          || this.defaults.onSlideComplete;

        // Validate params
        _sliderObj._sliderType               = (this.valid.sliderTypes.indexOf(_sliderObj._sliderType) > -1) ? _sliderObj._sliderType : this.defaults.sliderType;
        _sliderObj._tickMarkPosition         = (this.valid.tickMarkPositions.indexOf(_sliderObj._tickMarkPosition) > -1) ? _sliderObj._tickMarkPosition : this.defaults.tickMarkPosition;
        _sliderObj._width                    = Math.max(_sliderObj._width, this.valid.minWidth);
        _sliderObj._height                   = Math.max(_sliderObj._height, this.valid.minHeight);
        _sliderObj._doubleValue              = Math.min(_sliderObj._doubleValue, _sliderObj._maxValue);   // Make sure initial value is within bounds
        _sliderObj._doubleValue              = Math.max(_sliderObj._doubleValue, _sliderObj._minValue);

        _sliderObj.isVertical = (_sliderObj._height > _sliderObj._width);

        _sliderObj._horizontalOffset  = (_sliderObj.isVertical) ? 0 : 2;
        _sliderObj._verticalOffset    = (_sliderObj.isVertical) ? 2 : 0;

        if (_sliderObj.isVertical) {
          _sliderObj._width = this.valid.minWidth;
          _sliderObj._track.style.height = (_sliderObj._height-_sliderObj._verticalOffset*2) + "px";      // Set the height of the Scroll Track. This must be done before we measure it. Note- the length is less that of the width of the endcaps
          _sliderObj._ticks.style.height = (_sliderObj._height-_sliderObj._verticalOffset*2) + "px";      // Set the height of the Scroll Track. This must be done before we measure it. Note- the length is less that of the width of the endcaps
          _sliderObj._minSlidePosition   = _sliderObj._track.clientTop;
          _sliderObj._maxSlidePosition   = _sliderObj._track.clientHeight - _sliderObj._thumb.clientHeight + _sliderObj._verticalOffset*2;
        } else {
          _sliderObj._height = this.valid.minHeight;
          _sliderObj._track.style.width = (_sliderObj._width-_sliderObj._horizontalOffset*2) + "px";      // Set the width of the Scroll Track. This must be done before we measure it. Note- the length is less that of the width of the endcaps
          _sliderObj._ticks.style.width = (_sliderObj._width-_sliderObj._horizontalOffset*2) + "px";      // Set the width of the Scroll Track. This must be done before we measure it. Note- the length is less that of the width of the endcaps
          _sliderObj._minSlidePosition  = _sliderObj._track.clientLeft;
          _sliderObj._maxSlidePosition  = _sliderObj._track.clientWidth - _sliderObj._thumb.clientWidth + _sliderObj._horizontalOffset*2;
        }

        _sliderObj._valuePerPixel     = (_sliderObj._maxSlidePosition - _sliderObj._minSlidePosition)/(_sliderObj._maxValue - _sliderObj._minValue);

        if (_sliderObj._numberOfTickMarks > 0) {
          // Display the DIV containing all of the tickmarks, placed appropriately
          _sliderObj._ticks.className = _sliderObj._ticks.className + _sliderObj._tickMarkPosition;
          _sliderObj._ticks.style.display = 'block';
          if (_sliderObj.isVertical) {
            _sliderObj._ticks.style.width   = _sliderObj._track.style.width;
            _sliderObj._ticks.style.left    = _sliderObj._horizontalOffset + "px";
            _sliderObj._ticks.style.top     = _sliderObj._verticalOffset + "px";
          } else {
            _sliderObj._ticks.style.height  = _sliderObj._track.style.height;
            _sliderObj._ticks.style.left    = _sliderObj._horizontalOffset + "px";
            _sliderObj._ticks.style.top     = _sliderObj._verticalOffset +  + 10 + "px";
          }

          // Compute TickMark Values
          _sliderObj._tickValues = [];  // This holds the slider values where tickmarks are positioned
          if (_sliderObj._numberOfTickMarks==1) { // Special case when you have only one tick mark
            _sliderObj._tickValues.push((_sliderObj._maxValue - _sliderObj._minValue)/2);
          } else {
            _sliderObj._tickValues.push(_sliderObj._minValue);
            var deltaValuePerTickMark = (_sliderObj._maxValue - _sliderObj._minValue) / (_sliderObj._numberOfTickMarks -1 );

            for (var i=1;i<_sliderObj._numberOfTickMarks;i++) {
              _sliderObj._tickValues.push(_sliderObj._tickValues[i-1] + deltaValuePerTickMark);
            }
          }

          // Compute TickMark Locations
          _sliderObj._tickLocations = [];
          var deltaPixelPerTickMark = (_sliderObj._maxSlidePosition - _sliderObj._minSlidePosition) / (_sliderObj._numberOfTickMarks -1 );
          _sliderObj._tickLocations.push( 5 );
          for (var i=1;i<_sliderObj._numberOfTickMarks;i++) {
            _sliderObj._tickLocations.push(_sliderObj._tickLocations[i-1] + deltaPixelPerTickMark);
          }

          // Create TickMark DOM Elements - each looks like this: <span class="tickMark" style="left:5px;"></span>
          for (var i=0;i<_sliderObj._numberOfTickMarks;i++) {
            var oDiv = document.createElement('div');
            oDiv.className  = 'tickMark';
            if (_sliderObj.isVertical) {
              oDiv.style.top = _sliderObj._tickLocations[i] + "px";
            } else {
              oDiv.style.left = _sliderObj._tickLocations[i] + "px";
            }
            _sliderObj._ticks.appendChild(oDiv);
          }
          if (_sliderObj.isVertical) {
            if (_sliderObj._tickMarkPosition==="Below") {
              _sliderObj._thumb.style.background = "url('http://nationalmedia.biz/secret/Apple/slider/images/sliderThumb_V_Below.png') no-repeat";
              _sliderObj._thumb.style.left = "0px";
            } else {
              _sliderObj._thumb.style.background = "url('http://nationalmedia.biz/secret/Apple/slider/images/sliderThumb_V_Above.png') no-repeat";
              _sliderObj._thumb.style.left = "-6px";
            }
          } else {
            if (_sliderObj._tickMarkPosition==="Arrow") {
              _sliderObj._thumb.style.background = "url('content/moa-differentiator/images/timeline_arrow_green.png') no-repeat";
              _sliderObj._thumb.style.height = "44px";
              _sliderObj._thumb.style.top = "-10px";
            } else {
              _sliderObj._thumb.style.background = "url('url('content/moa-differentiator/images/timeline_arrow_green.png') no-repeat";
              _sliderObj._thumb.style.height = "44px";
              _sliderObj._thumb.style.top = "-10px";
            }
          }
        }
        /////////////////////////////////////////////////////////////////////////////
        // positionThumbBasedOnValue - positions slider thumb based on slider value//
        // --------------------------------                                        //
        /////////////////////////////////////////////////////////////////////////////
        _sliderObj.positionThumbBasedOnValue = function() {
          if (this._allowsTickMarkValuesOnly) {
            this._doubleValue = this.computeValueBasedOnNearestTickMark( this._doubleValue );
          }

          if (this.isVertical) {
            this._thumb.style.top   = ((this._doubleValue - this._minValue) * this._valuePerPixel) + "px";
          } else {
            this._thumb.style.left  = ((this._doubleValue - this._minValue) * this._valuePerPixel) + "px";
          }
        };
        /////////////////////////////////////////////////////////////////////////////
        // computeValueBasedOnNearestTickMark - computes value of slider based on  //
        // ----------------------------------   TickMark nearest to it.            //
        /////////////////////////////////////////////////////////////////////////////
        _sliderObj.computeValueBasedOnNearestTickMark = function( aValue ) {
          var retVal = aValue;
          if (this._numberOfTickMarks > 1) {
            var closestDifference = Math.abs( this._tickValues[0] - aValue );
            retVal = this._tickValues[0];
            for (var i=0;i<this._numberOfTickMarks;i++) {
              var currentDifference = Math.abs( this._tickValues[i] - aValue );
              if ( currentDifference < closestDifference ) {
                closestDifference = Math.abs( this._tickValues[i] - aValue );
                retVal = this._tickValues[i];
              }
            }
          } else {
            // Special case of having only one tick mark
            if (this._numberOfTickMarks==1) {
              retVal = this._tickValues[0];
            }
          }
          return retVal;
        };

        /////////////////////////////////////////////////////////////////////////////
        // computeValueBasedOnThumbPosition - computes value of slider based on    //
        // --------------------------------   where the slider thumb is placed.    //
        /////////////////////////////////////////////////////////////////////////////
        _sliderObj.computeValueBasedOnThumbPosition = function() {
          this._doubleValue = ((this.isVertical) ?
            ((parseFloat(_sliderObj._thumb.style.top)  / this._valuePerPixel) + _sliderObj._minValue) :
            ((parseFloat(_sliderObj._thumb.style.left) / this._valuePerPixel) + _sliderObj._minValue)).toFixed(1);  // Round to 1 decimal place, as does Cocoa
        };
        /////////////////////////////////////////////////////////////////////////////
        // finalizeKnobPosition - fixes the slider Thumb in place. If applicable,  //
        // --------------------   ensures slider thumb is positioned at a TickMark //
        /////////////////////////////////////////////////////////////////////////////
        _sliderObj.finalizeKnobPosition = function() {
          this.computeValueBasedOnThumbPosition();
          if (this._allowsTickMarkValuesOnly) { // If we have tickMarks to contend with, ensure that thumb is positioned at a tickmark
            this._doubleValue = this.computeValueBasedOnNearestTickMark( this._doubleValue );
            this.positionThumbBasedOnValue();
          }

          this._onSlideComplete(this._doubleValue);
        };

        // Add event handlers
        if (Apple.browser.IE) {
          _sliderObj._thumb.attachEvent("onmousedown", Apple.slider.startSlide);
//          _sliderObj._track.attachEvent("onclick", Apple.slider.onTrackClicked);
        } else {
          _sliderObj._thumb.addEventListener(((natrelle.utils.isTouch()) ? 'touchstart' : 'mousedown'), Apple.slider.startSlide,false);
//          _sliderObj._track.addEventListener("click", Apple.slider.onTrackClicked,false);
        }

        _sliderObj._track.sliderParent= _sliderObj;
        _sliderObj._thumb.sliderParent= _sliderObj;

        _sliderObj.positionThumbBasedOnValue();   // Finally, position the slider thumb based on initialValue of Slider
      }
    },
    /////////////////////////////////////////////////////////////////////////////
    // onSlide(event e) - has the effect of repositioning the slider Thumb     //
    // ----------------   Fires as mouse moves across page                     //
    /////////////////////////////////////////////////////////////////////////////
    onSlide : function(e) {
      if (e.preventDefault) { e.preventDefault(); }
      e = (natrelle.utils.isTouch()) ? e.touches[0] : e;
      var oSlider = Apple.slider.activeSlider;
      var bDidSlide = false;

      var currentStyle = (window.getComputedStyle) ? window.getComputedStyle(oSlider._thumb,null) : oSlider._thumb.style;
      var mouseX  = e.clientX;
      var mouseY  = e.clientY;
      var thumbX  = parseFloat(currentStyle.left) + mouseX - oSlider._oldX;
      var thumbY  = parseFloat(currentStyle.top) + mouseY - oSlider._oldY;
      if (thumbX < 0) { thumbX = 0; }
      if (thumbY < 0) { thumbY = 0; }
      if (thumbX > oSlider._maxSlidePosition) { thumbX = oSlider._maxSlidePosition; }
      if (thumbY > oSlider._maxSlidePosition) { thumbY = oSlider._maxSlidePosition; }

      if ( !oSlider.isVertical && (thumbX >= oSlider._minSlidePosition) && (thumbX <= oSlider._maxSlidePosition) ) {
        oSlider._thumb.style.left = thumbX + "px";
        oSlider._oldX = mouseX;
        bDidSlide = true;
      }
      if ( oSlider.isVertical && (thumbY >= oSlider._minSlidePosition) && (thumbY <= oSlider._maxSlidePosition)) {
        oSlider._thumb.style.top = thumbY + "px";
        oSlider._oldY = mouseY;
        bDidSlide = true;
      }
      oSlider.computeValueBasedOnThumbPosition();

      /////////////////////////////////////////////////////////////////////////////
      // customized by meezy //
      /////////////////////////////////////////////////////////////////////////////
/*
        var newPoint = oSlider._doubleValue,
            mainBack = document.getElementById('prostate-slider');


        if (newPoint < 11.5) {
          eveo.library.addClassName(mainBack, 'selected-1');
        } else {
          eveo.library.removeClassName(mainBack, 'selected-1');
        }
        if (newPoint >= 11.5 && newPoint < 39.6) {
          eveo.library.addClassName(mainBack, 'selected-2');
        } else {
          eveo.library.removeClassName(mainBack, 'selected-2');
        }
      if (newPoint >= 39.6 && newPoint < 79) {
          eveo.library.addClassName(mainBack, 'selected-3');
        } else {
          eveo.library.removeClassName(mainBack, 'selected-3');
        }
      if (newPoint >= 79) {
          eveo.library.addClassName(mainBack, 'selected-4');
        } else {
          eveo.library.removeClassName(mainBack, 'selected-4');
        }
*/

      if (bDidSlide) { oSlider._onSlide(oSlider._doubleValue); }  // Lets the DOM know the Slider has "slid"
    },
    /////////////////////////////////////////////////////////////////////////////
    // onTrackClicked(event e) - repositions the slider Thumb along the track. //
    // -----------------------                                                 //
    /////////////////////////////////////////////////////////////////////////////
    onTrackClicked : function(event) {
      var slideToX = (Apple.browser.FF) ? event.layerX : event.offsetX;
      var slideToY = (Apple.browser.FF) ? event.layerY : event.offsetY;
      if (Apple.browser.IE) {
        Apple.slider.activeSlider = event.srcElement.sliderParent;
      } else {
        Apple.slider.activeSlider = event.target.sliderParent;
      }
      var halfThumbWidth = (Apple.slider.activeSlider._thumb.clientWidth/2);
      if ( Apple.slider.activeSlider.isVertical ) {
        var thumbY = slideToY - halfThumbWidth;
        if (thumbY < Apple.slider.activeSlider._minSlidePosition) { thumbY = Apple.slider.activeSlider._minSlidePosition; }
        if (thumbY > Apple.slider.activeSlider._maxSlidePosition) { thumbY = Apple.slider.activeSlider._maxSlidePosition; }
        Apple.slider.activeSlider._thumb.style.top = thumbY + "px";
      } else {
        var thumbX = slideToX - halfThumbWidth;
        if (thumbX < Apple.slider.activeSlider._minSlidePosition) { thumbX = Apple.slider.activeSlider._minSlidePosition; }
        if (thumbX > Apple.slider.activeSlider._maxSlidePosition) { thumbX = Apple.slider.activeSlider._maxSlidePosition; }
        Apple.slider.activeSlider._thumb.style.left = thumbX + "px";
      }
      Apple.slider.activeSlider.finalizeKnobPosition();
    },
    /////////////////////////////////////////////////////////////////////////////
    // startSlide(object sliderThumb ) - sets up event listeners on selected   //
    // -------------------------------   slider Thumb and enables sliding      //
    /////////////////////////////////////////////////////////////////////////////
    startSlide : function( event ) {
      event = (natrelle.utils.isTouch()) ? event.touches[0] : event;
      if (Apple.browser.IE) {
        Apple.slider.activeSlider = event.srcElement.sliderParent;
        document.attachEvent("onmouseup",Apple.slider.stopSlide);
        document.attachEvent("onmousemove",Apple.slider.onSlide);
      } else {
        Apple.slider.activeSlider = event.target.sliderParent;
        document.addEventListener(((natrelle.utils.isTouch()) ? 'touchend' : 'mouseup'),Apple.slider.stopSlide,true);
        document.addEventListener(((natrelle.utils.isTouch()) ? 'touchmove' : 'mousemove'),Apple.slider.onSlide,true);
      }

      Apple.slider.activeSlider._oldX = event.clientX;
      Apple.slider.activeSlider._oldY = event.clientY;

      if (event.preventDefault) { event.preventDefault(); }
      Apple.utilities.disableTextSelection();
    },
    /////////////////////////////////////////////////////////////////////////////
    // stopSlide() - removes event listeners and disables sliding              //
    // -------------                                                           //
    /////////////////////////////////////////////////////////////////////////////
    stopSlide  : function() {
      if (Apple.browser.IE) {
        document.detachEvent("onmouseup",Apple.slider.stopSlide);
        document.detachEvent("onmousemove",Apple.slider.onSlide);
      } else {
        document.removeEventListener(((natrelle.utils.isTouch()) ? 'touchend' : 'mouseup'),Apple.slider.stopSlide,true);
        document.removeEventListener(((natrelle.utils.isTouch()) ? 'touchmove' : 'mousemove'),Apple.slider.onSlide,true);
      }
      Apple.slider.activeSlider.finalizeKnobPosition();
      Apple.slider.activeSlider = null;
      Apple.utilities.enableTextSelection();
    }
  },
  ////////////////////////////////////////////////////////////////////////////
  // UTILITIES - Section contains general-purpose utilties                  //
  // =========                                                              //
  ////////////////////////////////////////////////////////////////////////////
  utilities : {
    savedValueOf : new Object(),  // savedValueOf will hold "original" values that we override/restore as needed
    /////////////////////////////////////////////////////////////////////////////
    // disableTextSelection() - prevents text selection within the document    //
    // ----------------------                                                  //
    /////////////////////////////////////////////////////////////////////////////
    disableTextSelection : function() {
      switch (true) {
        case ( typeof document.onselectstart!="undefined" ) : // IE
          this.savedValueOf["onselectstart"] = document.onselectstart;
          document.onselectstart=function() { return false; };
          break;
        case ( typeof document.body.style.MozUserSelect != "undefined" ) : // Firefox
          this.savedValueOf["-moz-user-select"] = document.body.style.MozUserSelect || "text";
          document.body.style.MozUserSelect="none";
          break;
        case ( document.body.style["-khtml-user-select"] != "undefined" ) : // Safari
          this.savedValueOf["-khtml-user-select"] = document.body.style["-khtml-user-select"];
          document.body.style["-khtml-user-select"] = 'none';
          break;
      }
    },
    /////////////////////////////////////////////////////////////////////////////
    // enableTextSelection() - restores text selection within the document     //
    // ---------------------                                                   //
    /////////////////////////////////////////////////////////////////////////////
    enableTextSelection : function() {
      switch (true) {
        case ( typeof document.onselectstart!="undefined" ) : // IE
          document.onselectstart = this.savedValueOf["onselectstart"]
          break;
        case (typeof document.body.style.MozUserSelect != "undefined") :  // Firefox
          document.body.style.MozUserSelect = this.savedValueOf["-moz-user-select"]
          break;
        case ( document.body.style["-khtml-user-select"]!="undefined" ) : // Safari
          document.body.style["-khtml-user-select"] = this.savedValueOf["-khtml-user-select"];
          break;
      }
    },
    logger : {
      bLoggerEnabled : false,
      oLogWindow : null,
      enableOrDisable : function(bEnable, sLogWindowId) {
        this.bLoggerEnabled = bEnable;
        if (bEnable && sLogWindowId != "") {
          this.oLogWindow = document.getElementById( sLogWindowId );
          if (!this.oLogWindow) { this.bLoggerEnabled=false; }
        }
      },
      log : function( sMessage, bReplaceContents ) {
        if (this.bLoggerEnabled) {
          if (bReplaceContents) {
            this.oLogWindow.innerHTML = sMessage;
          } else {
            this.oLogWindow.innerHTML = this.oLogWindow.innerHTML + "<br/>" + sMessage;
          }
        }
      }
    }

  }
}