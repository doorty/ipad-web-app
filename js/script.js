/***********************************************
	Main script file
	- depends on Zepto.js (zeptojs.com)
************************************************/
if(!window.natrelle) { window.natrelle = {}; }
natrelle.framework = {

	frameworkContainerId: "#framework-container",
	pageContainerId: "#page-container",
	pageSelectionId: "#page-selection",
	section: { AUG: "aug", RECON: "recon", COVER: "cover"},
	augPages:		[1,2,3,4,5,6,7],		// augmentation and reconstruction share some of the same pages,
	reconPages:	[1,2,3,8,9,10,11,12,13],			// NOTE: update _framework.scss to match these
	allPages: [1,2,3,4,5,6,7,8,9,10,11,12,13],
	lastPageOffset: -1, // this is set dynamically when switching between aug/recall
	pageTitles: {
		1: "Cohesive gel, safety",
		2: "Most cohesive shaped gel",
		3: "Upper pole stability",
		4: "Anatomical contours",
		5: "Most selected shaped gel",
		6: "Ideal patient",
		7: "410 Matrix",
		8: "Anatomical shape",
		9: "Precise TE Match-up",
		10: "Precise TE Match-up",
		11: "<i>Natrelle</i><sup>&reg;</sup> 133 Series TE",
		12: "410 Matrix",
		13: "Ideal Patient"
	},
	currentSection: "",	// toggle between augmentation/reconstruction - use method: setSection(section.AUG|section.RECON|...)
	pageWidth: 1024,

	initCoverPage: function(callback) {
	 var $pageContainer = $(this.pageContainerId);

  	$.ajax({
			url: "pages/cover.html",
			context: document.body,
			error: function(xhr, errorType, error) {
				natrelle.utils.log ("error loading file: " + xhr.status + " " + errorType + " " + error);
				if (callback) { callback(); }
			},
			success: function(data, status, xhr) {
				var article = natrelle.utils.getBodyFromHtml(data); // the only thing within the body should be the <article>..</article>
				$pageContainer.html(article);
				if (callback) { callback(); }
			}
		});
  	
	},
	
	removeAugReconPages: function() {
  	var $pageContainer = $(this.pageContainerId);
  	
  	$pageContainer.children("article:not(:first-child)").remove();
	},
	
	initAugReconPages: function(callback) {
	 var $pageContainer = $(this.pageContainerId),
  	   pageNumbers = this.allPages.slice(0),
  	   addedFirst4Pages = false,
  	   numOfPages = pageNumbers.length;
  	   pageContents = [];

  	   // returns page path given a page number
  	   function getPageUrl(number) {
    	   var page = "page" + number + ".html",
    	       base = "pages/";
    	       
    	   return base+page;
  	   } // end getPageUrl
  	   
  	   // addPage - will add all aug & recon pages
  	   // after they have all been retrieved via ajax
  	   function addPage(number, article) {
  	     var pageIndex = pageNumbers.indexOf(number),
  	         articles = "";
  	     
  	     pageContents[pageIndex] = article;
  	     
  	     function loadPages(startIndex, endIndex, cb) {
    	     // do we have all pages yet?
    	     for (var i=startIndex; i < endIndex; i++) {
    	       if (pageContents[i] == undefined) {
    	         if (cb) { cb(false); }
      	       return; // haven't received all pages yet
    	       }
      	   }
      	   
      	   // if we have all pages add them to the DOM
    	     // in the right order
      	   for (var i=startIndex; i < endIndex; i++) {
    	       articles += pageContents[i];
      	   }
  
      	   $pageContainer.append(articles);

      	   for (var i=startIndex; i < endIndex; i++) {
      	     eval("window.slideLoaded"+pageNumbers[i]+"();"); // call "onload" event for each page
      	     //natrelle.utils.log("window.slideLoaded"+pageNumbers[i]+"();");
      	   }
      	   
      	   if (cb) { cb(true); }
      	   
  	     }
  	   
  	     // add pages to DOM piece-wise to decrease perceived load time
  	     if (addedFirst4Pages) {
    	     loadPages(4, numOfPages, function(loaded) {
      	     if (loaded) { 
        	     if (callback) { callback(); }
      	     }
    	     });
      	 }
      	 else {
        	 loadPages(0, 4, function(loaded) {
          	 if (loaded) { addedFirst4Pages = true; }
        	 });
      	 }
    	   
  	   } // end addPage
  	   
  	   for (var i=1; i <= numOfPages; i++) {
  	   
  	     (function(pageNumber) { 
      	   $.ajax({
        			url: getPageUrl(pageNumber),
        			context: document.body,
        			error: function(xhr, errorType, error){
        				natrelle.utils.log ("error loading file: " + xhr.status + " " + errorType + " " + error);
        			},
        			success: function(data, status, xhr){
        				// the only thing within the body should be the <article>..<script></script></article>
        				var article = natrelle.utils.getBodyFromHtml(data);
        				addPage(pageNumber, article);
        			}
        		});
        })(i);
        
  	   }
	},
	
	// TODO - firstPage, lastPage need setting when switching b/t sections
	pageNavigation: {

	  init: function() {
  	  this.fw = natrelle.framework;
  	  this.$pageContainer = $(this.fw.pageContainerId);
  	  this.lastScrollOffset = 0;
  	  
  	  natrelle.utils.log("init");
	  },
	  
	  // accepts page number corresponding to section
	  // to page 2 in aug is different from page 2 in recon
	  goToPage: function(pageNumberWithinSection) {
  	  var offset = -pageNumberWithinSection * this.fw.pageWidth;
  	  this.fw.menu.selectMenuItem(pageNumber);
  	  this.updatePosition(offset);
  	  this.lastScrollOffset = offset;
	  },
	
	  // set which page is visible by setting the 
	  // offset in the scrollabe slide area
	  updatePosition: function(x, isMoving) {

			if (x >= this.fw.lastPageOffset && x <= 0) {

  		  if (isMoving) {
  		  	this.$pageContainer.addClass("no-flick");
  		    if (natrelle.utils.isiOS6()) {
  		      this.$pageContainer.get(0).style.webkitTransform = "translate3d("+x+"px,0,0)";
  		      this.$pageContainer.get(0).style.left = "";
  		    }
  		    else {
  		      this.$pageContainer.get(0).style.left = x + "px";
  		      this.$pageContainer.get(0).style.webkitTransform = "";
  		    }
  		  }
  		  else {
	  		  this.$pageContainer.get(0).style.webkitTransform = "";
	  		  this.$pageContainer.removeClass("no-flick");
	  		  this.$pageContainer.get(0).style.left = x + "px";
  		  }
  		}
  		
  		if ( (x % this.fw.pageWidth) == 0) {
  		  // hide pages beyond previous, current, next pages

    		var pages = this.fw.getPages(),
    		    pageIndex = Math.abs(x / this.fw.pageWidth),
    		    visibilityClass = "invisible";
    		
    		for (var i=0, max=pages.length; i < max; i++) {
    		  if (i < pageIndex-1 || i > pageIndex+1) {
    		    // make all pages 2 or more behind invisible
    		    // make all pages 2 or more ahead invisible
      		  $("#slide-"+pages[i]).addClass(visibilityClass);
    		  }
    		  else {
    		    // make all other pages visible
      		  $("#slide-"+pages[i]).removeClass(visibilityClass); 
      		}
    		}
  		}
		},
		
		// go back to first page
		resetPageSwipe: function() {
		  this.lastScrollOffset = 0;
  		this.updatePosition(0);
  		this.resetPageState();
		},
		
		// undo animations, popups, etc
		resetPageState: function(slideId) {
			var pages = this.fw.allPages.slice(0);
			if (slideId) {
				eval("window.slideUnloaded"+slideId+"();"); // call "unload" event for specified page
			}
			else {
			  for (var i=0, max=pages.length; i < max; i++) {
			     eval("window.slideUnloaded"+pages[i]+"();"); // call "unload" event for each page
			     //natrelle.utils.log("window.slideUnloaded"+pages[i]+"();");
			   }
			}
		},
  
		// call this once the pages are in the DOM
    setupPageSwipe: function() {
  
  		var that = this,
  				startTouch = { x: 0, y: 0, time: 0 },
  				endTouch = diffTouch = tmpTouch = { x: 0, y: 0, time: 0 },
  				animatingId = null,
  				didMove = false;
  								
  		natrelle.utils.log("setupPageSwipe " + that.$pageContainer);
  
  		function touchStart(e) {
  		  		
  		  var touch = e.touches[0];

  			startTouch.x = touch.pageX;
  			startTouch.y = touch.pageY;
  			startTouch.time = Date.now();
  			that.$pageContainer.on("touchmove", touchMove);
  		  that.$pageContainer.on("touchend", touchEnd);
  			didMove = false; // reset on touchstart
  		}
  		
  		function touchMove(e) {
  			var touch = e.touches[0],
  					movePosX = 0;
  					
  		  if( (that.fw.currentSection === that.fw.section.COVER) || GlobalDoNotMovePage) {
    		  return;
  		  }
  					
  			endTouch.x = touch.pageX;
  			endTouch.y = touch.pageY;
  			endTouch.time = Date.now();
  			movePosX = endTouch.x-startTouch.x;
  			didMove = true;
  
  			that.updatePosition(that.lastScrollOffset + movePosX, true);
  		}
  
  		function touchEnd(e) {
  			diffTouch.x =  startTouch.x - endTouch.x; // positive is movement left, so swipe right
  			diffTouch.y =  startTouch.y - endTouch.y; // positive is movement up
  			diffTouch.time = endTouch.time - startTouch.time;
  			
  			if(didMove) {
  			
  				if (Math.abs(diffTouch.y) < Math.abs(diffTouch.x)) { // long distance in y may indicate a 'cancel'
  					if (diffTouch.x > 50) {
  						swipeLeft();
  					}
  					else if (diffTouch.x < -50) {
  						swipeRight();
  					}
  					else {
    				  slideBack();
    				}
  				}
  				else {
    				slideBack();
  				}
  			}
  			
  			that.$pageContainer.off("touchmove", touchMove);
  			that.$pageContainer.off("touchend", touchEnd);
  		}

  		function animate(resetPages) {
  		  
  		  var animation = {
	        className: "animate",
	        duration: 400
	      };
  
    		function endAnimation() {
    		  natrelle.utils.log("endAnimation, id = " + animatingId);
      		//that.$pageContainer.removeClass(animation.className);
      		that.$pageContainer.get(0).style.webkitTransition = "";
      		that.$pageContainer.get(0).style.webkitTransform = "";
      		that.$pageContainer.removeClass("no-flick");
      		that.$pageContainer.get(0).style.left = that.lastScrollOffset + "px";
      		animatingId = null;
      		if (resetPages) { 
        		that.resetPageState();
      		}
        }
        
        function startAnimation() {
      		//that.$pageContainer.addClass(animation.className);
      		if (natrelle.utils.isiOS6()) {
      		  that.$pageContainer.get(0).style.webkitTransition = "-webkit-transform 400ms ease-out";
      		}
      		else {
        		that.$pageContainer.get(0).style.webkitTransition = "left 400ms ease-out";
      		}
      		animatingId = setTimeout(endAnimation, 400);
      		natrelle.utils.log("startAnimation, id = " + animatingId);
        }
        
        if (animatingId != null) {
  		    clearTimeout(animatingId);
	  		  animatingId = setTimeout(endAnimation, 400);
	  		  natrelle.utils.log("clearTimeout, new animatingId = " + animatingId);
  		  }
  		  else {
    		  startAnimation();
  		  }
  
  		}
  
  		function slideBack(e) {
  			that.updatePosition(that.lastScrollOffset, true);
  			animate(false);
  		}
  
  		function swipeLeft(e) {
  		  if( (that.fw.currentSection === that.fw.section.COVER) || GlobalDoNotMovePage) {
  		    return;
  		  }
  		  if (that.lastScrollOffset > that.fw.lastPageOffset) {
  		    that.lastScrollOffset -= that.fw.pageWidth;
    			that.updatePosition(that.lastScrollOffset, true);
    			animate(true);
    			that.fw.menu.selectNextMenuItem();
    		}
  		}
  		
  		function swipeRight(e) {
  		  if( (that.fw.currentSection === that.fw.section.COVER) || GlobalDoNotMovePage) {
  		    return;
  		  }
  		  if (that.lastScrollOffset < 0) {
  		    that.lastScrollOffset += that.fw.pageWidth;
    		  that.updatePosition(that.lastScrollOffset, true);
    		  animate(true);
    		  that.fw.menu.selectPreviousMenuItem();
    		}
  		}
  
  		that.$pageContainer.on("touchstart", touchStart);
  
  	} // end setupPageSwipe
  	
	}, // end pageNavigation
	
	getPages: function() {
		return (this.currentSection === this.section.AUG) ? this.augPages : (this.currentSection === this.section.RECON) ? this.reconPages : [];
	},
	
	// sectionName = section: { AUG: "aug", RECON: "recon", COVER: "cover"}
	setSection: function setSection(sectionName) {

	  var fw = natrelle.framework;
	  
	  //natrelle.utils.log("sectionName: " + sectionName + " " + fw.section.AUG + " " + fw.section.RECON);

		if (!setSection.sections) {
			setSection.sections = "";
			for (var i in this.section) {
				if (this.section.hasOwnProperty(i)) {
					setSection.sections += this.section[i] + " ";
				}
			}
		}

		fw.currentSection = sectionName;
		
		natrelle.utils.log("sectionName: " + fw.currentSection);
		
		$(this.frameworkContainerId).removeClass(setSection.sections).addClass(sectionName);
		$(this.pageSelectionId).removeClass(setSection.sections).addClass(sectionName);
		
		if (sectionName === fw.section.AUG) {
		  natrelle.utils.log("it's aug: " + sectionName);
  		fw.lastPageOffset = -fw.pageWidth * (fw.augPages.length-1);
		}
		else if (sectionName === fw.section.RECON) {
		  natrelle.utils.log("it's recon: " + sectionName);
		  fw.lastPageOffset = -fw.pageWidth * (fw.reconPages.length-1);
		}
	},

	showCover: function() {
  	var that = this;
  	    $augBtn = $("#aug-button"),
  	    $reconBtn = $("#recon-button");
	
		that.setSection(this.section.COVER);
		
		function showAug() {
  		that.showAug();
  		that.pageNavigation.resetPageSwipe();
  		removeEvents();
		}
		
		function showRecon() {
  		that.showRecon();
  		that.pageNavigation.resetPageSwipe();
  		removeEvents();
		}
		
		function removeEvents() {
  		$augBtn.off(natrelle.utils.isTouch() ? "tap" : "click", showAug);
  		$reconBtn.off(natrelle.utils.isTouch() ? "tap" : "click", showRecon);
		}
		
		// add events for the two buttons on the page
		$augBtn.on(natrelle.utils.isTouch() ? "tap" : "click", showAug);
		$reconBtn.on(natrelle.utils.isTouch() ? "tap" : "click", showRecon);
	},
	
	showAug: function() {
		this.setSection(this.section.AUG);
	},
	
	showRecon: function() {
		this.setSection(this.section.RECON);
	},
	
	setupReferences: function() {
		var $refContainer = $("#ref-container"),
				$refOpenButton = $("#ref-open-button"),
				$refCloseButton = $("#ref-close-button");
				
		function toggleRef(e) {
			// toggle between "show" / "hide"
			// Why so complicated? Initially there is no (hide/show) class  
			// because I don't want it to animate on page load
			switch(true) {
				case $refContainer.hasClass("show"):
					$refContainer.toggleClass("show").toggleClass("hide");
					break;
				case $refContainer.hasClass("hide"):
					$refContainer.toggleClass("hide").toggleClass("show");
					break;
				default:
					$refContainer.toggleClass("show"); // only called the first time
			}
		}

		$refOpenButton.on(natrelle.utils.isTouch() ? "tap" : "click", toggleRef);
		$refCloseButton.on(natrelle.utils.isTouch() ? "tap" : "click", toggleRef);
	},
	
	setupIsi: function() {
		var that = this,
				$isiContainer = $("#isi-container"),
				$isiCloseButton = $("#isi-close-button"),
				$isiCloseButton2 = $("#isi-close-button-2");

		$isiCloseButton.one(natrelle.utils.isTouch() ? "tap" : "click", natrelle.framework.toggleIsi);
		$isiCloseButton2.on(natrelle.utils.isTouch() ? "tap" : "click", natrelle.framework.toggleIsi);

	},
	
	toggleIsi: function(e) {
  	var that = this,
				$isiContainer = $("#isi-container"),
				$isiCloseButton = $("#isi-close-button");
				
		if (e && e.stopPropagation) { e.stopPropagation(); }

		// toggle between "show" / "hide"
		// Why so complicated? Initially there is no (hide/show) class
		// because I don't want it to animate on page load
		switch(true) {
			case $isiContainer.hasClass("show"):
			  $isiContainer.get(0).scrollTop = 0;
				$isiContainer.removeClass("no-animation").toggleClass("show").toggleClass("hide");
				setTimeout(function() { // add delay to prevent firing immediately
				  $isiContainer.on(natrelle.utils.isTouch() ? "tap" : "click", natrelle.framework.toggleIsi);
			  }, 500);
				break;
			case $isiContainer.hasClass("hide"):
				$isiContainer.toggleClass("hide").toggleClass("show");
				$isiContainer.off(natrelle.utils.isTouch() ? "tap" : "click", natrelle.framework.toggleIsi);
				setTimeout(function() { // add delay to prevent firing immediately
				  $isiCloseButton.one(natrelle.utils.isTouch() ? "tap" : "click", natrelle.framework.toggleIsi);
			  }, 500);
				break;

		}

	},
	
	showTissueExpanderIsi: function() {
  	natrelle.framework.toggleIsi();
  	// manually specify tissue expander offset from top
  	document.getElementById('isi-container').scrollTop = 1000;
	},
	
	setupHomeButton: function() {
		var $homeButton = $("#home-open-button"),
				that = this;
				
		$homeButton.on(natrelle.utils.isTouch() ? "tap" : "click", function(e) {
			$(natrelle.framework.pageContainerId).attr("style",null);
			that.showCover();
			that.menu.resetMenuPosition();
			that.pageNavigation.resetPageSwipe();
			that.menu.selectMenuItem(1);
			that.removeAugReconPages();
			that.initAugReconPages(function() {
    		natrelle.utils.log("finished re-loading all pages");
  		});
		});
	},
	menu: {

		$menuPullout: $("#menu-pullout"),
		$pageSelection: $("#page-selection"),
		$toggleButton: $("#aug-recon-toggle"),
		$menuItems: $("#menu-items"),
		pageSelectionWidth: 328, // defined in framework.scss
		menuTabWidth: 48,				// defined in framework.scss
		currentPage: 1,
	
		setupMenu: function() {

			// initialize some constants
			this.fw = natrelle.framework;
			this.menuSection = this.fw.section.AUG;
			this.maxThresholdPullOutDistance = this.pageSelectionWidth - this.menuTabWidth;
			this.minThresholdPullOutDistance = -this.pageSelectionWidth + this.menuTabWidth;
			this.maxPullOutDistance = 0;
			this.minPullOutDistance = -this.pageSelectionWidth + this.menuTabWidth;

			// perform some initialization
			this.setMenuSection(this.fw.currentSection);
			this.createMenuElements();
	
			// setup menu events
			if (natrelle.utils.isTouch()) {
				this.$menuPullout.on("touchmove", $.proxy(this.touchMove, this));
				this.$menuPullout.on("touchend", $.proxy(this.touchEnd, this));
				this.$menuPullout.on("tap", $.proxy(this.toggleMenu, this));
				this.$toggleButton.on("tap", $.proxy(this.toggleMenuSection, this));
			}
			else {
				this.$menuPullout.on("click", $.proxy(this.toggleMenu, this));
				this.$toggleButton.on("click", $.proxy(this.toggleMenuSection, this));
			}
			this.selectMenuItem(1);
		},
		
		// hide menu
		resetMenuPosition: function() {
			this.setMenuPosition(this.minPullOutDistance);
		},
		
		// select menu item
		// if pageNumber is not provided, then we look in the DOM
		selectMenuItem: function(pageNumber) {

			var $selectedPageEl,
					selectedClass = "selected";
	
			$selectedPageEl = $("#menu-page-" + pageNumber);
	
			// give menu item selected state
			this.$menuItems.children().removeClass(selectedClass);
			$selectedPageEl.addClass(selectedClass);
			this.currentPage = pageNumber;
		},
		
		selectPreviousMenuItem: function() {

			var pageNumber = this.currentPage,
			    pages = this.fw.getPages(),
			    pageIndex = pages.indexOf(pageNumber),
			    previousPageNumber;
		  
		  previousPageNumber = (pageIndex === 0) ? pages[pages.length-1] : pages[pageIndex-1];
		  this.selectMenuItem(previousPageNumber);
		},

		selectNextMenuItem: function() {
  		var pageNumber = this.currentPage,
			    pages = this.fw.getPages(),
			    pageIndex = pages.indexOf(pageNumber),
			    nextPageNumber;
		  
		  nextPageNumber = (pageIndex === pages.length-1) ? pages[0] : pages[pageIndex+1];
		  this.selectMenuItem(nextPageNumber);
		},

		
		// returns "aug" or "recon"
		getMenuSection: function() {
			return this.$pageSelection.get(0).className;
		},
		
		// use framework.section.AUG ("aug"), framework.section.RECON ("recon")
		setMenuSection: function(section) {
			this.menuSection = section;
			this.$pageSelection.get(0).className = this.menuSection;
		},
		
		// toggle between AUG/RECON
		toggleMenuSection: function(e) {
			if(this.getMenuSection() === this.fw.section.AUG) {
				this.setMenuSection(this.fw.section.RECON);
			}
			else {
				this.setMenuSection(this.fw.section.AUG);
			}
		},
		
		// for moving the menu in and out
		setMenuPosition: function(offset) {
			this.$pageSelection.css("left", offset + "px");
		},
		
		// when you touch the pull out menu tab
		touchMove: function(e) {
			if(e.touches.length == 1){ // Only deal with one finger
				var touch = e.touches[0], // Get the information for finger #1
						pullOutDistance = touch.pageX;
				if (pullOutDistance >= this.menuTabWidth && pullOutDistance < this.pageSelectionWidth) {
					this.setMenuPosition(pullOutDistance - this.pageSelectionWidth);
				}
			}
		},
		
		// when you touch the pull out menu tab
		touchEnd: function(e) {
		  console.log("touchend");
			if(e.changedTouches.length == 1){ // Only deal with one finger
				var touch = e.changedTouches[0], // Get the information for finger #1
						pullOutDistance = touch.pageX,
						halfDistance = this.pageSelectionWidth / 2;

				if (pullOutDistance < halfDistance) {
  				this.setMenuPosition(this.minPullOutDistance);
  			}
  			else if (pullOutDistance >= halfDistance) {
    			this.setMenuPosition(this.maxPullOutDistance);
  			}
			}
		},
		
		addAnimation: function() {
			var that = this;
			this.$pageSelection.addClass("animate");
			setTimeout(function() {
				that.$pageSelection.removeClass("animate");
			},250);
		},
		
		// toggle whether menu is open or closed
		toggleMenu: function(e) {
			var left = parseInt(this.$pageSelection.css("left"),10);
			this.addAnimation();
			if(left === this.minPullOutDistance) {
				this.setMenuPosition(this.maxPullOutDistance);
			}
			else {
				this.setMenuPosition(this.minPullOutDistance);
			}
		},
		
		// what happens when a menu item is touched/clicked
		// it selects the menu item in the menu and uses
		// updatePosition(offset) to scroll to the right page
		hitMenuItem: function(e) {
			var augPages = this.fw.augPages.slice(),
					reconPages = this.fw.reconPages.slice(),
					$selectedEl = $(e.target),
					$selectedPageEl = $selectedEl.is("li") ? $selectedEl : $selectedEl.closest("li"),
					selectedPage = $selectedPageEl.attr("id"),
					menuSection = this.getMenuSection(),
					pages = (menuSection === this.fw.section.AUG) ? augPages : reconPages;
					matches = null,
					pageNumber = -1,
					pageIndex = -1;
			
			if (selectedPage != undefined) {
				matches = selectedPage.match(/menu-page-(\d+)/);
				if(matches) {
					// make sure we're on the right section
					this.fw.setSection(menuSection);
					// get page number from id and load into framework
					pageNumber = parseInt(matches[1],10);
					pageIndex = pages.indexOf(pageNumber);
					this.fw.pageNavigation.goToPage(pageIndex);
					this.addAnimation();
					this.resetMenuPosition();
				}
			}
		},
		
		// used to initially create the menu items using
		// framework.augPages/reconPages, and framework.pageTitles
		createMenuElements: function() {
			
			var augPages = this.fw.augPages.slice(),
					reconPages = this.fw.reconPages.slice(),
					titles = this.fw.pageTitles,
					docFragment = document.createDocumentFragment(),
					menuItem = "",
					menuItemClass = "",
					firstPage = augPages[0] < reconPages[0] ? augPages[0] : reconPages[0],
					lastPage = augPages[augPages.length - 1] > reconPages[reconPages.length - 1] ? augPages[augPages.length - 1] : reconPages[reconPages.length - 1];
			for(var i=firstPage; i <= lastPage; i++) {
				menuItemClass = "";
				if (augPages.indexOf(i) >= 0) { menuItemClass += this.fw.section.AUG; }
				if (reconPages.indexOf(i) >= 0) { menuItemClass += " " + this.fw.section.RECON; }
				if (menuItemClass.length > 0) {
					menuItem = $("<li id='menu-page-" + i + "' class='" + menuItemClass + "'><img src='images/thumbnails/page" + i + ".png'/><div class='content'><h3>" + titles[i] + "</h3><!--<p>A description might go here if there is room</p>--></div></li>").get(0);
					docFragment.appendChild(menuItem);
				}
			}
			this.$menuItems.empty().append(docFragment).on(natrelle.utils.isTouch() ? "tap" : "click", $.proxy(this.hitMenuItem, this));
		}
	},
	init: function() {
	 var that = this;
	  GlobalDoNotMovePage = false;
		this.setupIsi();
		this.setupReferences();
		this.setupHomeButton();
		this.pageNavigation.init();
		this.initCoverPage(function() {
  		that.showCover();
  		that.initAugReconPages(function() {
    		natrelle.utils.log("finished loading all pages");
  		});
  		that.pageNavigation.setupPageSwipe();
		});
		this.menu.setupMenu();
	}
};

// onload - call the init function on load with the framework as the context
$(function() { natrelle.framework.init.call(natrelle.framework) });

