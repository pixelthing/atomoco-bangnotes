/* 
pageObj is a class for controlling the notes on a page, anything that isn't connected to a particular note object.
Visually, you could imagine the pinboard floating ontop of the page, containing the notes.
*/


pinBoardObj = {


	// UPDATE LOOP
	
	updateNotes: function (pageRef) 
	{
	
		debugLog('- loopGo: ' + pinBoardObj.loopGo);
	
		setTimeout(function() {
			
			if (pinBoardObj.loopGo) {
				pinBoardObj.refreshCounter ++;
				pageObj.init(pageRef);
				//pinBoardObj.updateNotes (pageRef);
			}
			
		},2000);
	
	},

	
	
	
	// START UP ALL NOTES ON THE PINBOARD
	
	startAllNotes: function () 
	{
		
		debugLog('- startAllNotes()');
		debugLog(pageObj.pageJson);
		
		var notesThisPage = pageObj.pageJson.notes;
		var minZIndex = pageObj.pageJson.minz;
		datum = document.getElementById(pageObj.pageJson.datum);
		debugLog('- datum: ' + datum.offsetLeft +'px '+ datum.offsetTop +'px');
		
		// check existing notes on the page, if any are no longer in JSON from server, delete them
		for(var key in pageObj.pageJsonOld.notes )
		{
			if (notesThisPage[key] == undefined) {
				
				noteObj.deleteNote3(key);
				
			}
		}
		
		// check notes in JSON from server
		if (pinBoardObj.notes == undefined) {
			pinBoardObj.notes = [];
		}
		for(var key in notesThisPage) {
			if (isNaN(key)) {
				continue;
			}
			pinBoardObj.notes[key] = noteObj.init (key);
		}
		debugLog('');
	
	},
	
	
	
	
	
	// ADD A NEW NOTE
	
	addNote: function () 
	{
		debugLog('- addNote()');
	
		// mark the button as working
		var toolNew = document.getElementById('bnote_tool_new');
		toolNew.className = 'working';
		
		// do the request back to the server to find the new not id and z-index
		var url = urlToServer + 'notes_add.php'
		var data = 'page=' + thisPage + '&token=' + thisToken;
		sendRequest(url,pinBoardObj.addNote2,data);
	
	},
	
	addNote2: function (req,callback) 
	{
		debugLog('- addNote2()');
	
		// parse json
		var response = eval('(' + req.responseText + ')');
		debugLog(req.responseText);
		debugLog(response);
		
		// load the note to the screen
		pageObj.init(thisPage);
		pinBoardObj.updateNotes (thisPage);
		
		setTimeout(function () {
			noteObj.flipNote(false,response.note)
		},500);
		
		//unlock the button
		var toolNew = document.getElementById('bnote_tool_new');
		toolNew.className = '';
	
	}
	
}