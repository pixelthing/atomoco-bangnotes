scribbleObj = {
	
	buildScribble: function (scribbleJson,noteId) {
	
		var scribbleHtml = document.createElement('div');
		scribbleHtml.id = 'bnote_note' + noteId + '_scribble' + scribbleJson.id;
		scribbleHtml.className = 'bnote_note_scribble';
		
		// scribble title
		var noteScribbleTitle = document.createElement('h3');
		
		// scribble title content
		noteScribbleTitle.innerHTML += scribbleJson.who_name;
		scribbleHtml.appendChild(noteScribbleTitle);
		
		// scribble text
		var noteScribbleText = document.createElement('span');
		noteScribbleText.className = 'bnote_note_txt';
		noteScribbleText.innerHTML = scribbleJson.message;
		scribbleHtml.appendChild(noteScribbleText);
		
		// scribble meta/date
		var noteScribbleMeta = document.createElement('small');
		scribbleDateFormatted = '??';
		var scribbleDate = humanDate(scribbleJson.created);
		noteScribbleMeta.innerHTML = scribbleDate;
		scribbleHtml.appendChild(noteScribbleMeta);
		
		return scribbleHtml;
			
	}
}