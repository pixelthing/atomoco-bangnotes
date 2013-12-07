<?php

	include('dbase.php');
	include('functions.php');
	
	$page = $_REQUEST['page'];
	$note = $_REQUEST['note'];
	$user = $_REQUEST['user'];
	$msg = stripslashes($_REQUEST['msg']);
	$timestamp = date('Y-m-d H:i:s');
	
	//id of this page from the ref
	$sql = "SELECT id_pages FROM bn_pages WHERE p_ref='$page'";
	$page_id = sqlexecute($sql);
	
	//user
	//$sql = "SELECT user FROM notes WHERE id_notes='$note'";
	//$last_mod = sql2single($sql);
	
	// update scribbles dbase
	$dbase_msg = array(
		's_status' => 5,
		's_note' => $note,
		's_order' => 500,
		's_who_name' => 'Craig Morey',
		's_who_id' => $user,
		's_created' => $timestamp,
		's_message' => $msg
	);
	$dbase_msg = magicish_quotes($dbase_msg);
	$success1 = sqlinsert('bn_scribbles',$dbase_msg);
	$error1 = mysql_error();

	// existing values of this note
	$props_old = get_notes(false,$page_id,$note);
	$props_old = $props_old[$note];
	
	// merge the new values (add the new scribble id to the note actions)
	$props_new = $props_old;
	$props_new_array = explode(',',$props_new);
	array_push($props_new_array,$success1);
	$props_new['scribble_list'] .= implode(',',$props_new_array);
	
	// update transaction dbase
	$timestamp = date('Y-m-d H:i:s');
	$error2 = false;
	$dbase = array(
		't_date' => $timestamp,
		't_who_id' => $user,
		't_who_name' => 'Craig Morey',
		't_page' => $page_id,
		't_note' => $note,
		
		't_status' => $props_new['status'],
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
		$error2 .= '[scribble] '.mysql_error().' ';	
	}
	
	// report
	$output = array(
		'success' => $success1,
		'time' => $timestamp,
		'msg' => $dbase_msg
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