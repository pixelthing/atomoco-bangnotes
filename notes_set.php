<?php

	// echo '<pre>';

	include('dbase.php');
	include('functions.php');
	
	$page = $_REQUEST['page'];
	$note = $_REQUEST['note'];
	$user = $_REQUEST['user'];
	$p = stripslashes($_REQUEST['p']);
	$props_add = json_decode($p,true);
	
	// id of this page from the ref
	$sql = "SELECT id_pages FROM bn_pages WHERE p_ref='$page'";
	$page_id = sqlexecute($sql);
	
	// existing values of this note
	$props_old = get_notes(false,$page_id,$note);
	$props_old = $props_old[$note];
	
	// merge the new values
	if (is_array($props_old)) {
		$props_new = array_merge($props_old,$props_add);
	} else {
		$props_new = $props_add;
	}
	
	// update transaction dbase
	$timestamp = date('Y-m-d H:i:s');
	$error2 = false;
	$dbase = array(
		't_date' => $timestamp,
		't_who_id' => $user,
		't_who_name' => 'Craig Morey',
		't_page' => $page_id,
		't_note' => $note,
		
		't_status' => $props_old['status'],
		't_order' => $props_new['order'],
		't_posleft' => $props_new['posx'],
		't_postop' => $props_new['posy'],
		't_width' => $props_new['sizex'],
		't_height' => $props_new['sizey'],
		't_min' => $props_new['min'],
		't_scribble' => $props_new['scribble_list']
	);
	$dbase = magicish_quotes($dbase);
	$success2 = sqlinsert('bn_actions',$dbase);
	if (mysql_error()) {
		$error2 .= '['.$key.'] '.mysql_error().' ';	
	}
	
	// report
	$output = array(
		'success' => $success2,
		'time' => $timestamp
	);
	// if there are errors, add them in
	if (!$success) {
		$output['error1'] = $error1;
		$output['error2'] = $error2;
		$output['page'] = $page;
		$output['page_id'] = $page_id;
		$output['note'] = $note;
		$output['properties'] = $properties;
		$output['check'] = $check;
	}
	
	$response = json_encode($output);
	echo $response;

?>