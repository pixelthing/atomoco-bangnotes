// config

urlToServer = 'http://' + location.host + '/test1/8/';
pinBoardObj.refreshCounter = 0;
pinBoardObj.loopGo = 1;				// turns on/off the oldschool 5second ajax refresh
pageObj.debug = 0;					// turns on/off console.log messages
pageObj.noLocal = 1;				// turns off the retrieval from the HTML5 local DB

// report
debugLog('************ BEGIN ************');

// initiate
pageObj.init();
