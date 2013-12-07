
/* diveintohtml5.org */
function supports_html5_storage() 
{ 
	try { 
		return 'localStorage' in window && window['localStorage'] !== null; 
	} catch (e) { 
		return false; 
	} 
}

/* quirksmode.org */
function addEventSimple(obj,evt,fn) 
{
	if (obj.addEventListener)
		obj.addEventListener(evt,fn,false);
	else if (obj.attachEvent)
		obj.attachEvent('on'+evt,fn);
}

/* quirksmode.org */
function removeEventSimple(obj,evt,fn) 
{
	if (obj.removeEventListener)
		obj.removeEventListener(evt,fn,false);
	else if (obj.detachEvent)
		obj.detachEvent('on'+evt,fn);
}


/* quirksmode.org - tweaked with callbackArgs  */
function sendRequest(url,callback,postData,callbackArgs) 
{
	var req = createXMLHTTPObject();
	if (!req) return;
	var method = (postData) ? "POST" : "GET";
	req.open(method,url,true);
	//req.setRequestHeader('User-Agent','XMLHTTP/1.0');
	if (postData)
		req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
			alert( "Sorry - there was a problem with notes.\nHTTP error " + req.status + " - url not found:\n" + url );
			return;
		}
		callback(req,callbackArgs);
	}
	if (req.readyState == 4) return;
	req.send(postData);
}

/* quirksmode.org */
var XMLHttpFactories = [
	function () {return new XMLHttpRequest()},
	function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

/* quirksmode.org */
function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}

/* quirksmode.org */
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

/* quirksmode.org */
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/* quirksmode.org */
function eraseCookie(name) {
	createCookie(name,"",-1);
}



// check we're on a network, connected to the net and the servers are running
function checkOnline (pageRef,callback) 
{
	// not even connected to a network
	if (!navigator.onLine) {
		pageObj.online = -10;
		alert("Sorry - there was a problem with notes.\nYou don't appear to be connected to a network");
		debugLog('- checkOnline2(): ##OFFLINE## browser not on network');
	// if the browser is connected to the network, thats no guarantee that the network is connected to the net
	} else {
		// send a ping to the atomoco servers (responds with the app version of notes in the cloud)
		var url = urlToServer + 'notes_ping.php';
		var data = 'page=' + pageRef;
		var success = sendRequest(url,checkOnline2,data,callback);
	}

}
function checkOnline2 (req,callback)
{
		
		debugLog('- checkOnline2(): ping received: ' + req.responseText + (callback ? ' - callback: ' + callback : ''));
		
		// a correct response should be an array in JSON form
		if (req.responseText.indexOf('"v":')>=0) {
		
			// parse json
			responseArray = eval('(' + req.responseText + ')')
			var version = responseArray.v;
			var mod = responseArray.m;
			pageObj.online = 1;
			pageObj.version = version;
			pageObj.lastmod = mod;
			
			if (callback) {
				
				debugLog('- checkOnline2(): **ONLINE** running callback: ' + callback);
			
				eval('(' + callback + ')');
			}
		
		// if it's not an array, it's an error message
		} else {
			
			debugLog('- checkOnline2(): ##OFFLINE## response from server received but not correct');
			alert("Sorry - there was a problem with notes.\nThe response from the ping server was '" + req.responseText + "'");
			pageObj.online = -5;
			
		}
		
		
}

function humanDate (dateStr,format) {

	if (!dateStr) {
		return;
	}
	
	var m_names = new Array("Jan", "Feb", "Mar", 
		"Apr", "May", "Jun", "Jul", "Aug", "Sep", 
		"Oct", "Nov", "Dec");
	
	var thisYear = dateStr.substr(0,4);
	var thisMonth = parseInt(dateStr.substr(5,2));
	var thisDate = dateStr.substr(8,2);
	var thisHour = dateStr.substr(11,2);
	var thisMin = dateStr.substr(14,2);
	var thisSec = dateStr.substr(17,2);
	var thisDateFormatted = thisDate + m_names[thisMonth] + thisYear;
	var thisTimeFormatted = thisHour + ':' + thisMin;
	
	return thisDateFormatted + ' ' + thisTimeFormatted;

}

/* console log */

function debugLog (msg)
{
	//return;
	if(this.console && pageObj.debug==1){
		console.log( msg );
	}
};

function supports_input_placeholder() {
	var i = document.createElement('input');
	return 'placeholder' in i;
}

/* CSS class manipulation */

function hasClass(el,cls) {
	return el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(el,cls) {
	if (!this.hasClass(el,cls)) el.className += " "+cls;
}
function removeClass(el,cls) {
	if (hasClass(el,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		el.className=el.className.replace(reg,' ');
	}
}