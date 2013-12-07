/* 
pageObj controls all actions related to this particular web page, ie:

	- calculating the page ID to find notes against
	- controlling the connection to the cloud and the local DB, and retrieving info from it.
	- group saving to the local DB (& cloud?) 
	- initialising the pinboard

A word on terms used.

	- page is the web page we're looking at
	- pinboard is the object on the page that is covered in notes
	- a note is a single note object
	- tools is the sidebar that holds the "add note" etc buttons
	- scribbles are the individual textual messages that are part of a note
	- the page blueprint is the data object holding all the config for this page. it includes the notes, the page info, last time modified, etc, and is stored in browser memory during use, plus locally (if local storage exists) and in the cloud.
*/


pageObj = {
	thisAcc: undefined, // the reference of the current account
	thisToken: undefined, // the reference of the current user
	thisPage: undefined, // the reference of the current page, used to look up the notes on the page for this person
	online: undefined, // toggle for telling is we're online
	pageJson: {},	// the config of the notes in memory (not stored in the cloud)
	notes: {},		// the notes that will be part of the page

	// START THE WHOLE THING UP
	
	init: function () 
	{

		// add CSS to the page
		pageObj.addCSS();
		
		// add toolbar to the page
		pageObj.addToolBar();
		
		// figure out the host for this page
		var thisProt = document.location.protocol;
		var thisHost = document.location.hostname;
		var thisPort = document.location.port;
		
		// check the user has logged in
		thisToken = readCookie('bnote_token');
		if (thisToken == null || thisToken.length<16) {
			loginObj.passwordInit();
			return false;
		}
		
		// add the tools
		pageObj.addTools();
		
		// figure out the ref for this page
		thisPage = document.location.pathname;
	
		//
		debugLog(' ');
		debugLog('************ PAGE ' + thisHost + thisPage + ': init() [' + pinBoardObj.refreshCounter + ']');
		
		// check if we're online (also checks cloud app version) - then carry out next part of initialisation
		checkOnline(thisPage,'pageObj.getPage()');
		
		// mousewheel variable telling the script what note we're hovering over
		mouseWheelThis = false;
		
		// start the update loop
		pinBoardObj.updateNotes(pageObj.thisPage);
		
	},
	
	// ADD CSS TO THE PAGE

	addCSS: function () {
	
		// add in css
		if (!document.getElementById('bnote_notes_css'))
		{
			debugLog('- addCSS(): CSS added');
		
			var head  = document.getElementsByTagName('head')[0];
			var link  = document.createElement('link');
			link.id   = 'bnote_notes_css';
			link.rel  = 'stylesheet';
			link.type = 'text/css';
			link.href = 'css/notes.css';
			link.media = 'all';
			head.appendChild(link);
		}	
		
	},
	
	// ADD NOTE TOOLBAR
	
	addToolBar : function () {
	
		if (document.getElementById('bnote_tools') != undefined) {
			return;
		}
	
		// container
		var toolsHTMLContainer = document.createElement('div');
		toolsHTMLContainer.id = 'bnote_tools';
		
		// tab
		var toolsHTMLTab = document.createElement('div');
		toolsHTMLTab.type = 'text';
		toolsHTMLTab.id = 'bnote_tools_tab';
		toolsHTMLContainer.appendChild(toolsHTMLTab);
		
		// tools tray
		var toolsHTMLTray = document.createElement('div');
		toolsHTMLTray.type = 'password';
		toolsHTMLTray.id = 'bnote_tools_tray';
		toolsHTMLContainer.appendChild(toolsHTMLTray);
		
		// logo
		var toolsHTMLLogo = document.createElement('a');
		toolsHTMLLogo.id = 'bnote_tools_logo';
		toolsHTMLLogo.href = 'http://bangnotes.com';
		toolsHTMLLogo.target = '_blank';
		toolsHTMLTray.appendChild(toolsHTMLLogo);
		
		// toolbar wrapper
		var toolsHTMLBar = document.createElement('div');
		toolsHTMLBar.id = 'bnote_tools_bar';
		toolsHTMLTray.appendChild(toolsHTMLBar);
		
		// add the form to the page
		document.body.appendChild(toolsHTMLContainer);
	
	},
	
	// ADD TOOLS
	
	addTools : function () {
	
		var toolBar = document.getElementById('bnote_tools_bar');
		
		// clean out the toolbar 
		toolBar.innerHTML = '';
		
		// NEW button
		var toolsHTMLButton = document.createElement('div');
		toolsHTMLButton.className = 'bnote_tool_button';
		var toolsHTMLLink = document.createElement('a');
		toolsHTMLLink.id = 'bnote_tool_new';
		toolsHTMLLink.innerHTML = 'new';
		toolsHTMLButton.appendChild(toolsHTMLLink);
		toolBar.appendChild(toolsHTMLButton);
		addEventSimple(toolsHTMLLink,'mouseup',pinBoardObj.addNote);
		
		// LOGOUT button
		var toolsHTMLButton = document.createElement('div');
		toolsHTMLButton.className = 'bnote_tool_button';
		var toolsHTMLLink = document.createElement('a');
		toolsHTMLLink.id = 'bnote_tool_logout';
		toolsHTMLLink.innerHTML = 'log-out';
		toolsHTMLButton.appendChild(toolsHTMLLink);
		toolBar.appendChild(toolsHTMLButton);
		addEventSimple(toolsHTMLLink,'mouseup',loginObj.logOut);
	
	},
	
	// LOOK UP THE LATEST NOTES FOR THE PAGE
	
	getPage: function (page,callBack) {
	
		// get the last modified date from the local storage
		var pageModLocal = this.getPageModLocal(thisPage);
		var pageModCloud = this.getPageModCloud(thisPage);
		
		// store the old blueprint for the moment
		if (pageObj.pageJson['id'] != undefined) {
			pageObj.pageJsonOld = pageObj.pageJson;
		} else {
			pageObj.pageJsonOld = {};
		}
		
		debugLog('- getPage(): checking mod date for page: local:' + pageModLocal + ' : cloud:' + pageModCloud);
		
		// if the retrieved modified date is the same as that on the cloud, pull from blueprint local, it's quicker
		// also note that pageObj.noLocal allows you to turn off retrieving from the local DB
		if (pageModLocal == pageModCloud && !pageObj.noLocal) {
			debugLog('- getPage(): getting page data from *LOCAL*');
			this.getPageFromLocal(thisPage,'pinBoardObj.startAllNotes()');
		// if the local and cloud data differ, pull blueprint from cloud
		} else {
			debugLog('- getPage(): getting page data from *CLOUD*');
			this.getPageFromCloud(thisPage,'pinBoardObj.startAllNotes()');
		}
		
	},
	
	// CHECK THE MOD DATE OF THIS PAGE IN LOCAL STORAGE
	
	getPageModLocal: function (page) {
	
		return localStorage.getItem(page + '_mod');
	
	},
	
	// CHECK THE MOD DATE OF THIS PAGE ON THE CLOUD
	
	getPageModCloud: function (page) {
	
		return this.lastmod;
	
	},
	
	// PULL BLUEPRINT FROM LOCAL STORAGE
	
	getPageFromLocal: function (page,callback) {
	
		// if no support for local, no luck.
		if (!supports_html5_storage()) {
			return;
		}
		// if the blueprint is stored locally, pull it out of storage
		var localRaw = localStorage.getItem(page);
		if (localRaw && localRaw!='undefined') {
			//debugLog(localRaw);
			debugLog('- getPageFromLocal(): json retrieved successfully from local');
			
			// save the blueprint into the memory
			pageObj.pageJson = JSON.parse(localRaw);
		
			// if there is no previous version of this blueprint, save this one now
			if (pageObj.pageJsonOld['id'] == undefined) {
				pageObj.pageJsonOld = pageObj.pageJson;
			}
			
			// next stage
			if (callback) {
				eval('(' + callback + ')');
			}
			
			return;
		}
		debugLog('- getPageFromLocal(): json *NOT* retrieved successfully from local: ' + localRaw);
		
	
	},
	
	// PULL THE BLUEPRINT FROM THE CLOUD FEED
	
	getPageFromCloud: function (page,callback) {
	
		debugLog('- getPageFromCloud(): requesting page from cloud server');
	
		// we'll use that timestamp to compare to the cloud version.
		var url = urlToServer + 'notes_page.php'
		var data = 'page=' + page + loginObj.tokenUrl();
		sendRequest(url,this.getPageFromCloud2,data,callback);
		
	},
	
	// PULL THE BLUEPRINT FROM THE CLOUD FEED (part 2)
	
	getPageFromCloud2: function (req,callback) {
		
		debugLog('- getPageFromCloud2(): response from cloud server received');
	
		// parse json
		var response = eval('(' + req.responseText + ')');
		//debugLog(req.responseText);
		//debugLog(response);
		
		// is valid?
		if (response.invalid) {
			loginObj.inValid();
		}
			
		// save the blueprint into the memory
		pageObj.pageJson = response;
		
		// if there is no previous version of this blueprint, save this one now
		if (pageObj.pageJsonOld['id'] == undefined) {
			pageObj.pageJsonOld = pageObj.pageJson;
		}
		
		// save back to local storage
		pageObj.saveBluePrintLocal(thisPage);
		
		// next stage
		if (callback) {
			eval('(' + callback + ')');
		}
	
	},
	
	
	saveBluePrintLocal: function (page) {
	
		// if no support for local, no luck.
		if (!supports_html5_storage()) {
			return;
		}
	
		// save the page's set-up
		localStorage.setItem(page,JSON.stringify(pageObj.pageJson));
		localStorage.setItem(page + '_mod',pageObj.lastmod);
		
	},

	

}