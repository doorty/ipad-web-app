if(!window.natrelle) { window.natrelle = {}; }
natrelle.utils = {

  log: function(msg) {
		if(window.console && window.console.log) { window.console.log(msg); }
	},
	
	isiOS6: function() {
  	var isSix = navigator.userAgent.match(/OS 6(_\d)+/i);
  	
  	if (isSix) isiOS6 = function() { return true; }
  	else isiOS6 = function() { return false; }
  	
  	return isSix;
	},

  isTouch: function() {
		// we'll redefine the function so not to waste testing each time
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
			this.isTouch = function() { return true; }
			return true;
		} 
		else {
			this.isTouch = function() { return false; }
			return false;
		}
	},
	
	getBodyFromHtml: function(html) {
  	return html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)[1];
  }
	
}