noteObj = {
	initialMouseX: undefined,		// position of mouse at start of drag
	initialMouseY: undefined,
	startX: undefined,				// position of note at start of drag
	startY: undefined,
	datum: undefined,				// the container of everything
	draggedObject: undefined,		// the outer container of the note (sets the position of the note)
	dragBarObject: undefined,		// the top bar of the note which will be the only part that can be dragged
	pivotObject: undefined,			// the inner container of the note (sets the pivot angle on webkit)
	ready: true,					// ready to edit the notes









	// INIT A SINGLE NOTE
	
	init: function (noteId) {
		
		debugLog('************ NOTE ' + noteId + ': init()');
		
		var noteJson = pageObj.pageJson.notes[noteId];
		
		// does the note already exist?
		if (document.getElementById('bnote_note' + noteJson.id)!=undefined) {
		
			debugLog('- init() atomoconote' + noteJson.id + ' EXISTS');
		
			noteElAlter = this.alterNote(noteId);
			noteEl = document.getElementById('bnote_note' + noteJson.id)
		
		// else build from scratch
		} else {
		
			noteEl = this.buildNote(noteId);
			
		}
		
		// if no note has been created - error
		if (!noteEl) {
			alert('error');
			return false;
		}
	},











	// BUILD A SINGLE NOTE
	
	buildNote: function(noteId) {
	
		debugLog('- buildNote()');
		
		var noteJson = pageObj.pageJson.notes[noteId];
		
		// stamp the id of this note on the object
		this.id = noteJson.id;
	
		// outer
		var noteHtml = document.createElement('div');
		noteHtml.id = 'bnote_note' + noteJson.id;
		noteHtml.className = 'bnote_note bnote_note_locked bnote_note_appear';
		if (parseInt(noteJson.min)) {
			noteHtml.className += ' bnote_note_minimised';
		}
		//if (parent.thisToken == noteJson.who_id ) {
		//	noteHtml.className += ' bnote_note_mine';
		//}
		noteHtml.style.left = noteJson.posx + 'px';
		noteHtml.style.top = noteJson.posy + 'px';
		noteHtml.style.width = noteJson.sizex + 'px';
		noteHtml.style.height = noteJson.sizey + 'px';
		noteHtml.style.zIndex = parseInt(pageObj.pageJson.minz) + parseInt(noteJson.order);
		//noteHtml.style.background = '#f00';
		
		// inner
		var noteHtmlInner = document.createElement('div');
		noteHtmlInner.className = 'bnote_note_inner bnote_note_user2';
		noteHtml.appendChild(noteHtmlInner);
		
		// drag bar handle
		var noteHtmlHandle = document.createElement('div');
		noteHtmlHandle.className = 'bnote_note_handle';
		addEventSimple(noteHtmlHandle,'mousedown',this.startDragMouse);
		addEventSimple(noteHtmlHandle,'dblclick',this.toggleSize);
		noteHtmlInner.appendChild(noteHtmlHandle);
		
		// delete button
		if (thisToken == noteJson.who_token) {
			var noteHtmlButton = document.createElement('a');
			noteHtmlButton.title = 'Click to delete this note.';
			addEventSimple(noteHtmlButton,'mousedown',this.deleteNote);
		} else {
			var noteHtmlButton = document.createElement('span');
			noteHtmlButton.title = 'You did not start this note, so you can not delete it - sorry!';
		}
		noteHtmlButton.className = 'bnote_but_delete';
		noteHtmlButton.innerHTML = 'del';
		noteHtmlHandle.appendChild(noteHtmlButton);
		
		// minimise button
		/*
		var noteHtmlButton = document.createElement('a');
		noteHtmlButton.title = 'Click to minimise this note.';
		noteHtmlButton.className = 'bnote_but_delete';
		noteHtmlButton.innerHTML = 'min';
		addEventSimple(noteHtmlButton,'mousedown',this.toggleSize);
		noteHtmlHandle.appendChild(noteHtmlButton);
		*/
		
		// add button
		var noteHtmlButton = document.createElement('a');
		noteHtmlButton.title = 'Click to add a new scribble to this note.';
		noteHtmlButton.className = 'bnote_but_add';
		noteHtmlButton.innerHTML = 'add';
		addEventSimple(noteHtmlButton,'mousedown',this.flipNote);
		noteHtmlHandle.appendChild(noteHtmlButton);
		
		// status indicator
		var noteHtmlStatus = document.createElement('span');
		noteHtmlStatus.className = 'bnote_note_status';
		noteHtmlStatus.innerHTML = '...';
		noteHtmlHandle.appendChild(noteHtmlStatus);
		
		// track
		var noteTrack = document.createElement('div');
		noteTrack.className = 'bnote_note_track';
		addEventSimple(noteTrack,'mouseover',this.mouseWheelInit);
		addEventSimple(noteTrack,'mouseout',this.mouseWheelExit);
		var noteTrackLining = document.createElement('div');
		noteTrackLining.className = 'bnote_note_track_lining';
		noteTrack.appendChild(noteTrackLining);
		noteHtmlInner.appendChild(noteTrack);
		
		// action comment container
		var noteHtmlNewScribble = document.createElement('div');
		noteHtmlNewScribble.className = 'bnote_note_textbox';
		
		// action comment handle
		var noteHtmlHandle = document.createElement('div');
		noteHtmlHandle.className = 'bnote_note_handle';
		addEventSimple(noteHtmlHandle,'mousedown',this.startDragMouse);
		noteHtmlNewScribble.appendChild(noteHtmlHandle);
		
		// action comment cancel button
		var noteHtmlButton = document.createElement('a');
		noteHtmlButton.title = 'Click to return to the note contents.';
		noteHtmlButton.className = 'bnote_but_back';
		noteHtmlButton.innerHTML = 'cancel';
		addEventSimple(noteHtmlButton,'mousedown',this.flipNote);
		noteHtmlHandle.appendChild(noteHtmlButton);
		
		var noteHtmltitle = document.createElement('h3');
		noteHtmltitle.innerHTML = 'Enter a new comment:';
		noteHtmlHandle.appendChild(noteHtmltitle);
		
		// action comment textbox
		var noteHtmlNewScribbleBox = document.createElement('textarea');
		noteHtmlNewScribbleBox.id = 'bnote_note' + noteJson.id + '_new_scribble_val';
		if (supports_input_placeholder()) {
			noteHtmlNewScribbleBox.placeholder = 'enter comment here';
		}
		noteHtmlNewScribbleBox.rows = 4;
		noteHtmlNewScribbleBox.style.width = (noteJson.sizex - 20) + 'px';
		noteHtmlNewScribbleBox.style.height = (noteJson.sizey - 80) + 'px';
		noteHtmlNewScribble.appendChild(noteHtmlNewScribbleBox);
		
		// action comment button
		var noteHtmlNewScribbleButton = document.createElement('a');
		noteHtmlNewScribbleButton.id = 'bnote_note' + noteJson.id + '_new_scribble_but';
		noteHtmlNewScribbleButton.className = 'bnote_but_submit';
		noteHtmlNewScribbleButton.innerHTML = 'add';
		noteHtmlNewScribble.appendChild(noteHtmlNewScribbleButton);

		// add action comment box
		noteHtml.appendChild(noteHtmlNewScribble);
		addEventSimple(noteHtmlNewScribbleButton,'mouseup',this.addScribble);
		
		// note resize handle
		var noteHtmlRSize = document.createElement('a');
		noteHtmlRSize.className = 'bnote_note_resize_handle';
		addEventSimple(noteHtmlRSize,'mousedown',this.startReSize);
		noteHtmlInner.appendChild(noteHtmlRSize);
		
		// add note to page
		datum.appendChild(noteHtml);
		
		// scribbles text
		noteObj.buildNoteScribbles(noteJson.id);
		
		// scrollbar
		setTimeout(function(){
			scrollObj.init(noteJson.id);
		},500)
		
		// make note swoosh in
		noteHtml.className = noteHtml.className.replace(/bnote_note_appear/,'bnote_note_stretch');
		// unlock note
		setTimeout(function(){
			noteHtml.className = noteHtml.className.replace(/ bnote_note_stretch/,'');
			noteHtml.className = noteHtml.className.replace(/bnote_note_locked/,'');
			
			setTimeout(function(){
			
				// shadow lungs
				var noteHtmlShadow = document.createElement('span');
				noteHtmlShadow.className = 'bnote_note_shadow bnote_note_shadow1';
				noteHtml.appendChild(noteHtmlShadow);
				var noteHtmlShadow = document.createElement('span');
				noteHtmlShadow.className = 'bnote_note_shadow bnote_note_shadow2';
				noteHtml.appendChild(noteHtmlShadow);
				
			},200);
			
		},200);
		
		
		debugLog('- buildNote() ' + noteId + ' complete');
		
		return noteHtml;
	
	},
	
	
	
	
	
	
	
	// BUILD HTML OF SCRIBBLES
	
	buildNoteScribbles : function(noteId) {
	
		debugLog('- buildNoteScribbles()');
		
		var noteJson = pageObj.pageJson.notes[noteId];
		
		// get the scribble track
		var thisNoteDom = document.getElementById('bnote_note' + noteId);
		var thisTrackLiningDom = thisNoteDom.childNodes[0].childNodes[1].childNodes[0];
		
		// clear track
		thisTrackLiningDom.innerHTML = '';
		
		// for each scribble, add it to the track
		for(var key in noteJson.scribbles) {
			var scribble = noteJson.scribbles[key];
			var scribbleHtml = scribbleObj.buildScribble(scribble,noteId);
			thisTrackLiningDom.appendChild(scribbleHtml);
		}
	
	},



	// ALTER THE NOTE
	
	alterNote: function(noteId) {
	
		debugLog('- alterNote()');
		
		var noteJson = pageObj.pageJson.notes[noteId];
		
		// retrieve the previous note config to compare against the new config
		var jsonTemp = pageObj.pageJsonOld;
		var noteJsonOld = jsonTemp.notes[noteId];
		
		alteredObject = document.getElementById('bnote_note' + noteJson.id);
	
		// position note
		if (noteJson.posx != jsonTemp.notes[noteId].posx
			|| noteJson.posy != jsonTemp.notes[noteId].posy ) {
			
			this.setPositionSlow (alteredObject,noteJson.posx,noteJson.posy);
			debugLog('- alterNote() POS WAS: ' + noteJsonOld.posx + 'x' + noteJsonOld.posy + ', MOVED TO: ' + noteJson.posx + 'x' + noteJson.posy);
		}
		
		// resize note
		if (noteJson.sizex != noteJsonOld.sizex 
			|| noteJson.sizey != noteJsonOld.sizey ) {
			
			this.setSizeSlow (alteredObject,noteJson.sizex,noteJson.sizey);
			debugLog('- alterNote() SIZE WAS: ' + noteJsonOld.sizex + 'x' + noteJsonOld.sizey + ', RESIZED TO: ' + noteJson.sizex + 'x' + noteJson.sizey);
		}
		
		// zindex
		if (parseInt(noteJson.order) != parseInt(noteJsonOld.order) ) {
		
			var newOrder = parseInt(noteJson.order);
			this.jumpZSet(alteredObject,newOrder);
			
		}

		// minimize note
		if (noteJson.min != noteJsonOld.min ) {
			if (noteJson.min == 1) {
			
				this.toggleMin(alteredObject);
				// jump it to the front (or it could get lost behind other notes)
				jumpZFront(alteredObject);
				
			} else {
				
				this.toggleMax(alteredObject);
			
			}
		}

		// delete/reinstate note
		if (noteJson.status != noteJsonOld.status ) {
			if (noteJson.status < 0) {
			
				debugLog('- alterNote() DELETE note ' + noteId);
				noteObj.deleteNote3 (noteId);
				
			} else if (noteJson.status == 5) {
				
				debugLog('- alterNote() RE-INSTATE note ' + noteId);
				buildNote (noteId);
			
			}
		}

		// scribbles changed??
		if (noteJson.scribble_list != noteJsonOld.scribble_list ) {

			var thisTrackLiningDom = document.getElementById('bnote_note' + noteId).childNodes[0].childNodes[1].childNodes[0];
		
			// clear track
			thisTrackLiningDom.innerHTML = '';

			for (var key in noteJson.scribbles) {
				var scribble = noteJson.scribbles[key];
				var scribbleHtml = scribbleObj.buildScribble(scribble,noteId);
				thisTrackLiningDom.appendChild(scribbleHtml);
			}

		}
		
	
	},














	// DRAG FUNCTIONS
	
	startDragMouse: function (e) 
	{
	
		debugLog('- startDragMouse()');
		
		var evt = e || window.event;
		initialMouseX = evt.clientX;
		initialMouseY = evt.clientY;
		lastMouseX = initialMouseX;
		lastSwish = 0;
		thisNote = this.parentNode.parentNode;
		pivotObject = this.parentNode;
		noteObj.startDrag(this);
		//debugLog(pivotObject);
		addEventSimple(document,'mousemove',noteObj.dragMouse);
		addEventSimple(document,'mouseup',noteObj.releaseDrag);
		
		// jump to front using z-axis
		noteObj.jumpZFront(draggedObject);
		
		// hide the note shadows
		thisNote.childNodes[2].style.display = 'none';
		thisNote.childNodes[3].style.display = 'none';
		
		//debugLog('initialMouse: ' + initialMouseX +'px '+ initialMouseY +'px');
		//debugLog('datum: ' + datum.offsetLeft +'px '+ datum.offsetTop +'px');
		//debugLog('dragBarObject: ' + draggedObject.offsetLeft +'px '+ draggedObject.offsetTop +'px');
		
 		/* set up pivot point for draglag */
		var pivotX = initialMouseX - draggedObject.offsetLeft - datum.offsetLeft;
		var pivotY = initialMouseY - draggedObject.offsetTop - datum.offsetTop;
		pivotObject.style.webkitTransformOrigin = pivotX + 'px '+ pivotY + 'px';
		pivotObject.style.MozTransformOrigin = pivotX + 'px '+ pivotY + 'px';
		
		//debugLog('pivot: ' + pivotX +'px '+ pivotY +'px');
		
		// debug - show pivot point
		/*
		var debug = document.createElement('div');
		debug.className = 'debug';
		debug.style.left = pivotX-1+'px';
		debug.style.top = pivotY-1+'px';
		dragBarObject.appendChild(debug);
		//*/
		
		// stop text selection
		document.onselectstart = function() {return false;} // ie
		document.onmousedown = function() {return false;} // mozilla
			
		return false;
	},
	startDrag: function (obj) 
	{
	
		debugLog('- startDrag()');
		
		if (this.draggedObject)
			this.releaseDrag();
		draggedObject = obj.parentNode.parentNode;
		
		startX = draggedObject.offsetLeft;
		startY = draggedObject.offsetTop;		
		//debugLog('START: ' + startX + ' x ' + startY);
		 		
	},
	dragMouse: function (e) 
	{
	
		debugLog('- dragMouse()');
		
		var evt = e || window.event;
		if (evt.clientX == initialMouseX || evt.clientY == initialMouseY) {
			return;
		}
		
		// move
		var dX = evt.clientX - initialMouseX;
		var dY = evt.clientY - initialMouseY;
		noteObj.setPositionDrag(dX,dY);
				
		// draglag
		var dX = evt.clientX - lastMouseX;
		swish = Math.round(dX/2);
		if (swish != lastSwish) {
		
			var max = 20;	// max angle of swish
			if (swish > max)
				swish = max;
			if (swish < -max)
				swish = -max;
			
			pivotObject.style.webkitTransform = 'rotate(' + swish + 'deg)';
			pivotObject.style.MozTransform = 'rotate(' + swish + 'deg)';
		
		}
		
		// reset lastMouseX
		lastMouseX = evt.clientX;
		lastSwish = swish;
				
		return false;
	},
	setPositionDrag: function (dx,dy) 
	{
		debugLog('- setPositionDrag( ' + dx + ',' + dy + ' )');
		
		// lock (the locking is here not at the dragStart stage because if the mouse is down on the note, but hasn't moved it, we don't want to lock it - it's confusing, and anyway, it prevents you from double clicking to minimise etc)
		noteObj.lock(draggedObject);
		
		// move
		draggedObject.style.left = startX + dx + 'px';
		draggedObject.style.top = startY + dy + 'px';
	},
	releaseDrag: function() 
	{
	
		debugLog('- releaseDrag()');
		
		removeEventSimple(document,'mousemove',noteObj.dragMouse);
		removeEventSimple(document,'mouseup',noteObj.releaseDrag);
		
		// reveal the note shadows again
		setTimeout(function() {
			thisNote.childNodes[2].style.display = 'block';
			thisNote.childNodes[3].style.display = 'block';
		},500);
		
		// put note back square
		//pivotObject.style.webkitTransform = 'rotate(0deg)';
		var existingTrans = pivotObject.style.webkitTransform;
			//var regEx = /([a-z0-9\s\(\),]*)rotate\([-]*[0-9]deg\)([a-z0-9\s\(\),]*)/;
			//console.log('[' + existingTrans.replace(regEx,'$1rotate(0deg)$2') + ']');
		pivotObject.style.webkitTransform = pivotObject.style.webkitTransform.replace(existingTrans,'');
		pivotObject.style.MozTransform = pivotObject.style.webkitTransform.replace(existingTrans,'');
 		//debugLog('STOP: ' + draggedObject.style.left + ' x ' + draggedObject.style.top);
		
		pivotObject.style.webkitTransformOrigin = null;
		pivotObject.style.MozTransformOrigin = null;
		
		// save changes
		var noteID = draggedObject.id.replace('bnote_note','');
		posLeftParsed = parseInt(draggedObject.style.left.replace('px',''));
		posTopParsed = parseInt(draggedObject.style.top.replace('px',''));
		noteObj.saveNoteProperty(noteID,{'posx':posLeftParsed,'posy':posTopParsed});
		
		// start text selection again
		document.onselectstart = function() {return true;} // ie
		document.onmousedown = function() {return true;} // mozilla
		
		// unlock
		noteObj.unlock(draggedObject);
		
		draggedObject = null;
		pivotObject = null;
		lastMouseX = null;
		lastSwish = null;
	},
	setPositionSlow: function (movedObj,dx,dy) 
	{
		debugLog('- setPositionSlow( ' + dx + ',' + dy + ' )');
		
		// lock it
		noteObj.lock(movedObj);
	
		// add lag
		movedObj.className += ' bnote_note_moving';
		
		// move (wrap so that css transitions can run it)
		setTimeout(function(){
			movedObj.style.left = dx + 'px';
			movedObj.style.top = dy + 'px';
		},0);
		// after the move
		setTimeout(function() {
			// unlock
			noteObj.unlock(movedObj);
			// remove lag
			movedObj.className = movedObj.className.replace(/bnote_note_moving/,'');
		},300)
	},
	
	
	
	
	
	
	
	
	
	// JUMP Z INDEX TO FRONT
	
	jumpZFront: function (jumpObj) {
	
		debugLog('- jumpZFront()');
	
		// run through all the notes to find the front one
		var topZ = 0;
		for(var key in pageObj.pageJson.notes)
		{
			var nOrder = parseInt(pageObj.pageJson.notes[key].order);
			var thisZ = parseInt(pageObj.pageJson.minz) + parseInt(nOrder);
			if (thisZ > topZ) {
				topZ = thisZ;
			}
		}
		
		// if this note is the front anyway, exit
		if (jumpObj.style.zIndex == topZ) {
			debugLog('- jumpZFront() - already the top note, no change');
			return;
		}
		
		// err.. add one
		newZ = topZ + 1;
		var newOrder = newZ - parseInt(pageObj.pageJson.minz);
		
		// set new z on note
		jumpObj.style.zIndex = newZ;
		
		// save it
		var noteID = jumpObj.id.replace('bnote_note','');
		noteObj.saveNoteProperty(noteID,{'order':newOrder})
		
	
	},
	
	jumpZSet: function (jumpObj,zOrder) {
	
		debugLog('- jumpZSet(jumpObj, ' + zOrder + ')');
	
		// if no z order requested, jump to the front instead
		if (!zOrder) {
			jumpZFront(jumpObj);
			return;
		}
		
		// err..
		newZ = zOrder + parseInt(pageObj.pageJson.minz);
		var newOrder = newZ - parseInt(pageObj.pageJson.minz);
		
		// set new z on note
		jumpObj.style.zIndex = newZ;
		
		// save it
		var noteID = jumpObj.id.replace('bnote_note','');
		noteObj.saveNoteProperty(noteID,{'order':zOrder})
		
	
	},











	// RESIZE FUNCTIONS
	
	startReSize: function (e) 
	{
		var evt = e || window.event;
		
		if (this.draggedObject)
			this.releaseDrag();
			
		draggedObject = this.parentNode.parentNode;
		
		initialMouseX = evt.clientX;
		initialMouseY = evt.clientY;
		addEventSimple(document,'mousemove',noteObj.dragReSize);
		addEventSimple(document,'mouseup',noteObj.releaseReSize);
		
		reSizeHandle = this;
		
		startW = draggedObject.clientWidth;
		startH = draggedObject.clientHeight;
		
		//debugLog('START: W:' + startW + ' H:' + startH);
		
		// stop text selection
		document.onselectstart = function() {return false;} // ie
		document.onmousedown = function() {return false;} // mozilla
	},
	dragReSize: function (e) 
	{
		var evt = e || window.event;
		var dX = startW + evt.clientX - initialMouseX;
		var dY = startH + evt.clientY - initialMouseY;
		noteObj.setSizeDrag(draggedObject,dX,dY);
	},
	setSizeDrag: function (resizedObj,dx,dy) 
	{
		// lock it
		noteObj.lock(resizedObj);
		
		resizedObj.style.width = dx + 'px';
		resizedObj.style.height = dy + 'px';
	},
	setSizeSlow: function (resizedObj,dx,dy) 
	{
		// lock it
		noteObj.lock(resizedObj);
	
		// add lag
		resizedObj.className += ' bnote_note_resizing';
		
		// move (wrap so that css transitions can run it)
		setTimeout(function(){
			resizedObj.style.width = dx + 'px';
			resizedObj.style.height = dy + 'px';
		},0);
		// after the move
		setTimeout(function() {
			// unlock
			noteObj.unlock(resizedObj);
			// remove lag
			resizedObj.className = resizedObj.className.replace(/bnote_note_resizing/,'');
			// resize text entrybox
			noteObj.newScribbleResize(resizedObj);
		},300);
	},
	releaseReSize: function (dx,dy) 
	{
		removeEventSimple(document,'mousemove',noteObj.dragReSize);
		removeEventSimple(document,'mouseup',noteObj.releaseReSize);
		
		//debugLog('STOP: W:' + draggedObject.clientWidth + ' H:' + draggedObject.clientHeight);
		
		// save changes
		var noteID = draggedObject.id.replace('bnote_note','');
		noteObj.saveNoteProperty(noteID,{'sizex':draggedObject.clientWidth,'sizey':draggedObject.clientHeight});
		
		// unlock
		noteObj.unlock(draggedObject);
		
		// resize text entrybox
		noteObj.newScribbleResize(draggedObject);
		
		// resize the scrollbar
		scrollObj.adjustScroll(noteID);
			
		// reset
		draggedObject = null;
		
		// start text selection again
		document.onselectstart = function() {return true;} // ie
		document.onmousedown = function() {return true;} // mozilla
	},
	
	// resizes the <textbox> in the note that adds a new comment to be the right width
	newScribbleResize: function (resizedObj) {
	
		// somtimes the id is of the note object, sometimes the dom object.
		var noteId = resizedObj.id;
		if (noteId.indexOf('bnote_note')>=0) {
			var newScribbleId = noteId + '_new_scribble_val';
		} else {
			var newScribbleId = 'bnote_note' + noteId + '_new_scribble_val';
		}
		// spot if the width is either a number of a '222px'
		var noteW = resizedObj.offsetWidth;
		var noteH = resizedObj.offsetHeight;
		
		// resize the comment box
		document.getElementById(newScribbleId).style.width = (noteW - 20) + 'px';
		document.getElementById(newScribbleId).style.height = (noteH - 80) + 'px';
	
	},
	












	// TOGGLE MINIMIZE FUNCTIONS
	
	toggleSize: function () 
	{
	
		draggedObject = this.parentNode.parentNode;
		var startW = draggedObject.clientWidth;
		var noteID = draggedObject.id.replace('bnote_note','');
		
		// minimize
		if (draggedObject.className.indexOf('bnote_note_minimis')<0) 
		{
		
			noteObj.toggleMin(draggedObject);
		
			// save changes
			noteObj.saveNoteProperty(noteID,{'min':1});
			
		} 
		// maximize
		else 
		{
		
			noteObj.toggleMax(draggedObject);
		
			// save changes
			noteObj.saveNoteProperty(noteID,{'min':0});
		}
		
	
	},
	
	// TOGGLE SIZE (MINIMISE)
	
	toggleMin: function (resizeObj) 
	{
		
		resizeObj.className += ' bnote_note_minimising_stage1';
		
		setTimeout((function()
		{
			resizeObj.className += ' bnote_note_minimising_stage2';
			resizeObj.className = resizeObj.className.replace(/bnote_note_minimising_stage1/,'');
		}),0);
		setTimeout((function()
		{
			resizeObj.className += ' bnote_note_minimised';
			resizeObj.className = resizeObj.className.replace(/bnote_note_minimising_stage2/,'');
		}),500);
	
	},
	
	// TOGGLE SIZE (MAXIMISE)
	
	toggleMax: function (resizeObj) 
	{
			
		resizeObj.className += ' bnote_note_minimising_stage1';
		resizeObj.className = resizeObj.className.replace(/bnote_note_minimised/,'');
		
		setTimeout((function()
		{
			resizeObj.className = resizeObj.className.replace(/bnote_note_minimising_stage1/,'');
			scrollObj.adjustScroll(resizeObj.id.replace('bnote_note',''));
			
		}),500);
	
	},
	






	// LOCKING
	
	lock: function (lockObj) {
		if (lockObj.className.indexOf('bnote_note_locked') >= 0) {
			return false;
		}
		lockObj.className += ' bnote_note_locked';
	},
	
	unlock: function (lockObj) {
		if (lockObj.className.indexOf('bnote_note_locked') < 0) {
			return false;
		}
		lockObj.className = lockObj.className.replace(/bnote_note_locked/,'');
	},





	// SAVING PROPERTIES FOR THIS NOTE
	
	saveNoteProperty: function(noteID,properties) 
	{
	
		debugLog('- saveNoteProperty( ' + noteID + ', ' + properties + ' )');
	
		// test to see if we need to save
		var saveNew = false;
	
		// loop each property and set it in memory
		for(var key in properties) {
			var obj = properties[key];
			if (pageObj.pageJson.notes[noteID][key]) {
				// if new value is same as old, don't bother
				if (pageObj.pageJson.notes[noteID][key] == obj) {
					continue;
				}
				saveNew = true;
				pageObj.pageJson.notes[noteID][key] = obj;
			}
		}
		// only save the results if any property has actually been changed
		// (saves on pointless http requests, like the first click on a double click)
		if (saveNew) {
			// whats the new save date?
			saveTime = Math.round(new Date().getTime() / 1000);
			// set the new dates
			pageObj.pageJson.lastmodlast = pageObj.pageJson.lastmod;
			pageObj.pageJson.lastmod = saveTime;
			// save to cloud storage
			this.savePropsToCloud(thisPage,noteID,properties);
		} else {
		
			debugLog('- saveNoteProperty( ' + noteID + ' no change, not saved )');
		
		}
	
	},
	
	
	// SAVING THE PROPERTIES OF THIS NOTE TO THE CLOUD
	
	
	savePropsToCloud: function (pageRef,noteID,properties) 
	{
	
		debugLog('- savePropsToCloud()');
		
		var url = urlToServer + 'notes_set.php';
		var data = 'page=' + pageRef + '&user=' + thisToken + '&note=' + noteID + '&p=' + JSON.stringify(properties);
		data = data.replace(/\\/g, '');
		debugLog('- savePropsToCloud() DATA: ' + data);
		success = sendRequest(url,this.savePropsToCloud2,data);
		
	},
	
	
	savePropsToCloud2: function (req) 
	{
	
		debugLog('- savePropsToCloud2()');
		
		var response = eval('(' + req.responseText + ')');
		if (response.success) {
			// now save the whole page blueprint with the latest changes and savetime to local storage
			debugLog('- savePropsToCloud2(): **PROPERTIES SET** page: ' + thisPage);
			debugLog('');
			pageObj.saveBluePrintLocal(response.page);
		} else {
			debugLog('- savePropsToCloud2(): **PROPERTIES SET FAILED** page:' + thisPage);
			debugLog(req.responseText);
			debugLog('');
		}
	
	},






	// ADD SCRIBBLE
	
	addScribble: function (e) {
	
		debugLog('- addScribble()');
	
		// whats the textbox id?
		var boxValId = this.id.replace('_new_scribble_but','_new_scribble_val');
		debugLog(boxValId)
		var boxVal = document.getElementById(boxValId).value;
		
		// if nothing entered, exit
		if (boxVal.length < 1) {
			alert ("Sorry, You didn't enter a comment");
			return;
		}
		
		// what's the note?
		var noteId = this.id.replace('bnote_note','');
		noteId = noteId.replace('_new_scribble_but','');
		
		// lock it
		//noteObj.lock(document.getElementById('bnote_note' + noteId));
		
		// do the request back to the server to find the new not id and z-index
		var url = urlToServer + 'notes_scribble_add.php'
		var data = 'page=' + thisPage + '&token=' + thisToken + '&note=' + noteId + '&msg=' + boxVal;
		sendRequest(url,noteObj.addScribble2,data);
	
	},
	
	
	addScribble2: function (req) 
	{
	
		debugLog('- addScribble2()');
		
		var response = eval('(' + req.responseText + ')');
		if (response.success) {
					
			debugLog('- addScribble2(): **SCRIBBLE ADDED** page: ' + thisPage);
			debugLog('');
			
			// add the scribble to memory
			if (pageObj.pageJson.notes[response.msg.s_note]['scribbles'] == undefined) {
				pageObj.pageJson.notes[response.msg.s_note]['scribbles'] = {};
			}
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success] = {};
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success]['created'] = response.msg.s_created;
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success]['id'] = response.success;
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success]['message'] = response.msg.s_message;
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success]['who_id'] = response.msg.s_who_id;
			pageObj.pageJson.notes[response.msg.s_note]['scribbles'][response.success]['who_name'] = response.msg.s_who_name;
			
			// whats the new save date?
			saveTime = Math.round(new Date().getTime() / 1000);
			// set the new dates
			pageObj.pageJson.lastmodlast = pageObj.pageJson.lastmod;
			pageObj.pageJson.lastmod = saveTime;
			// resave the blueprint to the local storage
			pageObj.saveBluePrintLocal(response.page);
		
			// update the scribbles for this note
			noteObj.buildNoteScribbles(response.msg.s_note);
			
			// adjust the scroll bar
			scrollObj.adjustScroll(response.msg.s_note);
			
			// jump to the bottom
			scrollObj.setPosition(response.msg.s_note,999999);
			
			// flip the note
			noteObj.flipNote(false,response.msg.s_note);
			
			// clear the textarea
			document.getElementById('bnote_note' + response.msg.s_note + '_new_scribble_val').value = '';
			
		} else {
			debugLog('- addScribble2(): **SCRIBBLE INSERT FAILED** page:' + thisPage);
			debugLog(req.responseText);
			debugLog('');
			alert('sorry - it appears there was a problem adding that comment - could you refresh the page to see if it was entered correctly?')
		}
	
	},




	flipNote: function (e,noteId) {
	
		if (noteId!=undefined) {console.log('['+noteId+']')
			var thisNote = document.getElementById('bnote_note' + noteId);
		} else {
			var thisNote = this.parentNode.parentNode.parentNode;
		}
		
		// hide the note shadows
		thisNote.childNodes[2].style.display = 'none';
		thisNote.childNodes[3].style.display = 'none';
		 		
		// if the note is already flipped, flip it back
		if (thisNote.className.search('bnote_note_flipped')!=-1) {
			thisNote.className = thisNote.className.replace(/ bnote_note_flipped/g,'');
		// otherwise flip the note
		} else {
			thisNote.className = thisNote.className + ' bnote_note_flipped';
		}
		
		// reveal the note shadows again
		setTimeout(function() {
			thisNote.childNodes[2].style.display = 'block';
			thisNote.childNodes[3].style.display = 'block';
		},500);
		
		return false;
	
	},
	
	
	
	
	
	
	// DELETE NOTE
	
	deleteNote: function (e)
	{
	
		var confirmDelete = confirm("Are you sure you want to delete this note?")
		if (confirmDelete){
	
			debugLog('- deleteNote()');
			
			var thisNote = this.parentNode.parentNode.parentNode.id.replace('bnote_note','');
			
			// do the request back to the server to find the new not id and z-index
			var url = urlToServer + 'notes_delete.php'
			var data = 'page=' + thisPage + '&user=' + thisToken + '&note=' + thisNote;
			sendRequest(url,noteObj.deleteNote2,data);
		
		}
	
	},
	
	deleteNote2: function (req,callback) 
	{
		debugLog('- deleteNote2()');
	
		// parse json
		var response = eval('(' + req.responseText + ')');
		debugLog(req.responseText);
		debugLog(response);
		
		noteObj.deleteNote3(response.note);
		
	
	},
	
	deleteNote3: function (noteId) 
	{
		debugLog('- deleteNote3()');
		
		var noteToDelete = document.getElementById('bnote_note' + noteId);
		if (noteToDelete == undefined) {
			debugLog('- deleteNote3(): failed to delete bnote_note[' + noteId + ']');
			return;
		}
		var noteParent = noteToDelete.parentNode;
		
		// try and prevent a webkit redraw problem that leaves the shadow after the note has gone:
		noteToDelete.style.webkitTransform = 'scale(1,1)';
		noteToDelete.style.webkitTransform = 'scale3d(1,1,1)';
		noteToDelete.style.webkitBoxShadow = 'none';
		
		// make note poof once
		setTimeout(function(){
			noteToDelete.className = noteToDelete.className += ' bnote_note_poof1';
			
			// make note poof twice
			setTimeout(function(){
				noteToDelete.className = noteToDelete.className.replace(/bnote_note_poof1/,'bnote_note_poof2');
				
				// delete note from DOM
				setTimeout(function(){
				
					noteParent.removeChild(noteToDelete);
					
					// if the note is in the temporary config, delete it
					if (pageObj.pageJson.notes[noteId]) {
						debugLog('- deleteNote3(): deleted note from temporary config');
						delete pageObj.pageJson.notes[noteId];
						pageObj.saveBluePrintLocal(thisPage);
					}
					
				},150);
				
			},150);
		},10);
	
	},
	
	
	
	

	// tell the scroll wheel which note to scroll
	
	mouseWheelInit : function () {
	
		mouseWheelThis = this.parentNode.parentNode.id;
	
	},
	mouseWheelExit : function () {
	
		mouseWheelThis = false;
	
	},
	
	
	
	
	
}