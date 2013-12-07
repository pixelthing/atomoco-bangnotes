loginObj = {

	passwordInit : function() {
	
	
		var toolBar = document.getElementById('bnote_tools_bar');
		
		// clean out the toolbar 
		toolBar.innerHTML = '';
		
		// form
		var loginHTMLContainer = document.createElement('div');
		loginHTMLContainer.id = 'bnote_login_container';
		
		// username
		var loginHTMLUser = document.createElement('input');
		loginHTMLUser.type = 'text';
		loginHTMLUser.id = 'bnote_login_user';
		loginHTMLUser.name = 'bnote_login_user';
		loginHTMLContainer.appendChild(loginHTMLUser);
		
		// password
		var loginHTMLPass = document.createElement('input');
		loginHTMLPass.type = 'password';
		loginHTMLPass.id = 'bnote_login_pass';
		loginHTMLPass.name = 'bnote_login_pass';
		loginHTMLContainer.appendChild(loginHTMLPass);
		
		// button
		var loginHTMLBut = document.createElement('input');
		loginHTMLBut.type = 'submit';
		loginHTMLBut.id = 'bnote_login_submit';
		loginHTMLBut.value = 'log-in';
		addEventSimple(loginHTMLBut,'mousedown',loginObj.passwordSubmit1);
		loginHTMLContainer.appendChild(loginHTMLBut);
		
		// add the form to the page
		toolBar.appendChild(loginHTMLContainer);
	
	},

	passwordSubmit1 : function() {
	
		var thisUser = document.getElementById('bnote_login_user').value;
		var thisPass = document.getElementById('bnote_login_pass').value;
		
		// validate login creds
		if (thisUser == undefined || thisPass == undefined || thisUser.length < 1 || thisPass.length < 1) {
			alert('Sorry, you didn\'t enter your username or password');
			return;
		}
	
		// 
		var url = urlToServer + 'notes_login.php';
		var data = 'user=' + thisUser + '&pass=' + thisPass + loginObj.tokenUrl();
	
		debugLog('- passwordSubmit1() DATA: ' + data);
		
		sendRequest(url,loginObj.passwordSubmit2,data);
	
	},

	passwordSubmit2 : function(req) {
	
		debugLog('- passwordSubmit2()');
		
		var response = eval('(' + req.responseText + ')');
		if (response.success) {
			debugLog('- passwordSubmit2(): **LOGGED IN**');
			createCookie('bnote_token',response.token,31);
			pageObj.init();
		} else {
			debugLog('- passwordSubmit2(): **FAILED TO LOG IN**');
			debugLog(req.responseText);
			debugLog('');
			alert(response.error + ' Please try again or contact the people who gave you your password.');
		}
	
	},
	
	inValid : function () {
		
		eraseCookie('bnote_token');
		alert('You\'ll need to re-login to see the notes again.');
		loginObj.passwordInit();
		return false;
			
	},
	
	tokenUrl : function () {
		
		var token = readCookie('bnote_token');
		var prot = document.location.protocol;
		var host = document.location.hostname;
		var port = document.location.port;
		
		var url = '&token=' + token + '&host=' + host + '&prot=' + prot + '&port=' + port;
		
		return url;
		
	},
	
	logOut : function () {
	
		eraseCookie('bnote_token');
		pageObj.init();
	
	}

}