scrollObj = {

	init : function(noteNo) {
	
		debugLog('- scrollObj.init(' + noteNo + ')');
	
		var noteJson = pageObj.pageJson.notes[noteNo];
		
		// build the scrollbars
		scrollObj.buildScroll(noteNo);
		
		// adjust the proportional scrollbar size
		scrollObj.adjustScroll(noteNo);
		
		// mouse wheel scrolling		
		/** DOMMouseScroll is for mozilla. */
		if (window.addEventListener)
			window.addEventListener('DOMMouseScroll', scrollObj.mouseWheel, false);
		/** IE/Opera. */
		window.onmousewheel = document.onmousewheel = scrollObj.mouseWheel;
	
	},
	
	buildScroll : function (noteNo) {
	
		debugLog('- buildScroll(' + noteNo + ')');
	
		var noteJson = pageObj.pageJson.notes[noteNo];
		
		// add the scroll bar
		var noteInner = document.getElementById( 'bnote_note' + noteNo ).childNodes[0];
		var noteScrollBar = document.createElement('div');
		noteScrollBar.className = 'bnote_note_scroll_bar';
		
		// add the scroll bar handle hit area
		var noteScrollHandleHit = document.createElement('div');
		noteScrollHandleHit.className = 'bnote_note_scroll_handle_hit';
		noteScrollHandleHit.onmousedown = this.startDrag;
		noteScrollBar.appendChild(noteScrollHandleHit);
		
		// add the scroll bar handle
		var noteScrollHandle = document.createElement('div');
		noteScrollHandle.className = 'bnote_note_scroll_handle';
		noteScrollHandleHit.appendChild(noteScrollHandle);
		
		noteInner.appendChild(noteScrollBar);
	
	},
	
	// adjust the position of the scroll handle depending on the height of the note/length of the comments
	adjustScroll : function (noteNo) {
	
		debugLog('- adjustScroll(' + noteNo + ')');
	
		var noteJson = pageObj.pageJson.notes[noteNo];
		
		// how long is the scroll track?
		var scribbleTrack = document.getElementById( 'bnote_note' + noteNo ).childNodes[0].childNodes[1].childNodes[0];
		var scribbleTrackH = scribbleTrack.offsetHeight;
		
		// how long is the current note?
		var note = document.getElementById( 'bnote_note' + noteNo );
		var noteH = note.offsetHeight - 46;
			
		// grab the handle
		var scrollTrack = document.getElementById( 'bnote_note' + noteNo ).childNodes[0].childNodes[3];
		var scrollHandle = scrollTrack.childNodes[0];
		
		if (scribbleTrackH > noteH) {
		
			// fraction of the scroll handle to scroll track?
			var scrollHandleFraction = noteH/scribbleTrackH;
			var scrollHandleHeight = Math.round(scrollHandleFraction * noteH);
			if (scrollHandleHeight<15) {
				scrollHandleHeight = 15;
			}
		
			// fade up scroll track 
			removeClass(scrollTrack,'off');
			
			// resize the handle
			scrollHandle.style.height = scrollHandleHeight + 'px';
		
			debugLog('- scrollObj.init(' + noteNo + ') - build scrollbar');
		
		} else {
		
			// fade down scrollTrack
			addClass(scrollTrack,'off');
		
			debugLog('- scrollObj.init(' + noteNo + ') - no scroll needed');
		
		}
	
	},



	// RESIZE FUNCTIONS
	
	startDrag: function (e) 
	{
		debugLog('- startDrag()');
		
		var evt = e || window.event;
		
		initialMouseY = evt.clientY;
		addEventSimple(document,'mousemove',scrollObj.dragScroll);
		addEventSimple(document,'mouseup',scrollObj.releaseScroll);
		
		scrollHandle = this;
		startTop = scrollHandle.offsetTop;
		handleHeight = scrollHandle.offsetHeight;
		var scrollBar = scrollHandle.parentNode;
		barHeight = scrollBar.offsetHeight;
		
		// stop text selection
		document.onselectstart = function() {return false;} // ie
		document.onmousedown = function() {return false;} // mozilla
	},
	dragScroll: function (e) 
	{
		var evt = e || window.event;
		var y = startTop + evt.clientY - initialMouseY;
		
		// set the 
		var thisNoteId = scrollHandle.parentNode.parentNode.parentNode.id
		scrollObj.setPosition(thisNoteId,y);
	},
	releaseScroll: function () 
	{
		debugLog('- releaseScroll()');
		
		removeEventSimple(document,'mousemove',scrollObj.dragScroll);
		removeEventSimple(document,'mouseup',scrollObj.releaseScroll);
			
		// reset
		scrollHandle = null;
		startTop = null;
		handleHeight = null;
		barHeight = null;
		
		// start text selection again
		document.onselectstart = function() {return true;} // ie
		document.onmousedown = function() {return true;} // mozilla
	},
	
	
	setPosition: function (noteId,y) 
	{
	
		var thisNoteDom = document.getElementById(noteId);
		if (thisNoteDom == undefined) {
			return;
		}
		var noteHandle = thisNoteDom.childNodes[0].childNodes[3].childNodes[0];
		
		// don't calc the scrollbar height unless necessary (ie on drag it's set at the start of drag)
		if (handleHeight == undefined || handleHeight == null) {
			var handleHeight = noteHandle.offsetHeight;
			var scrollBar = noteHandle.parentNode;
			var barHeight = scrollBar.offsetHeight;
		}
	
		// within boundaries
		if (y < 0) {
			y = 0;
		} else if (y > (barHeight - handleHeight)) {
			y = (barHeight - handleHeight);
		}
		
		// set the position of the scroll bar handle
		noteHandle.style.top = y + 'px';
		
		// set the position of the scribble track
		var scrollFraction = y / (barHeight - handleHeight);
		var scrollTrackLining = thisNoteDom.childNodes[0].childNodes[1].childNodes[0];
		var scrollHeight = scrollTrackLining.offsetHeight - thisNoteDom.offsetHeight + 32;
		var scrollDistance = scrollFraction * scrollHeight;
		scrollTrackLining.style.marginTop = '-' + scrollDistance + 'px';
		
	},



	
	mouseWheel : function () {
	
		if (mouseWheelThis == false || mouseWheelThis == undefined) {
			return;
		}
	
		var delta = 0;
		if (!event) /* For IE. */
			event = window.event;
		if (event.wheelDelta) { /* IE/Opera. */
			delta = event.wheelDelta/120;
			/** In Opera 9, delta differs in sign as compared to IE.
				*/
			if (window.opera)
					delta = -delta;
		} else if (event.detail) { /** Mozilla case. */
			/** In Mozilla, sign of delta is different than in IE.
				* Also, delta is multiple of 3.
				*/
			delta = -event.detail/3;
		}
		/** If delta is nonzero, handle it.
 		* Basically, delta is now positive if wheel was scrolled up,
 		* and negative, if wheel was scrolled down.
 		*/
		if (delta)
			scrollObj.mouseWheelHandle(mouseWheelThis,delta);
		/** Prevent default actions caused by mouse wheel.
 		* That might be ugly, but we handle scrolls somehow
 		* anyway, so don't bother here..
 		*/
		if (event.preventDefault)
				event.preventDefault();
				
		event.returnValue = false;
	
	},
	
	mouseWheelHandle : function (noteId,delta) {
	
		//debugLog('- mouseWheelHandle(' + noteId + ':' + delta + ')');
	
		var thisNoteDom = document.getElementById(noteId);
		var noteScrollTrack = thisNoteDom.childNodes[0].childNodes[3];
		var noteScrollHandle = thisNoteDom.childNodes[0].childNodes[3].childNodes[0];
		
		// get the existing positon of the scroll handle
		startTop = noteScrollHandle.offsetTop;
		
		// new 
		newTop = startTop - Math.round(delta/4);
		
		if (newTop < 0) {
		
			newTop = 0
			
		} else if (newTop > (noteScrollTrack.offsetHeight - noteScrollHandle.offsetHeight))  {
		
			newTop = noteScrollTrack.offsetHeight - noteScrollHandle.offsetHeight;
		
		}
		
		this.setPosition(noteId, newTop);
			
	
	}


}