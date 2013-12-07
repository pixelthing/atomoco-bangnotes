<?php

	include('dbase.php');
	
	$page = $_REQUEST['page'];
	$token = $_REQUEST['token'];
	
	// update transaction dbase with new note info
	$timestamp = date('Y-m-d H:i:s');
	
	//id of this page from the ref
	$sql = "SELECT id_pages FROM bn_pages WHERE p_ref='$page'";
	$page_id = sqlexecute($sql);

	//id of this user from the token
	$sql = "SELECT t_user,u_name_first,u_name_last FROM bn_tokens,bn_users WHERE bn_tokens.t_user = bn_users.id_users AND t_token='$token'";
	$user = sql2single($sql);
	$user_id = $user['t_user'];
	$user_name_first = $user['u_name_first'];
	$user_name_last = $user['u_name_last'];
	
	//get the biggest z-index of a note on the page
	$sql = "SELECT t_order FROM bn_actions WHERE t_page='$page_id' GROUP BY t_note ORDER BY t_order DESC LIMIT 0,1";
	$n_order = sqlexecute($sql);
	$n_order++;
	
	// new note properties
	$properties = array(
		'n_page' => $page_id,
		'n_who_id' => $user_id,
		'n_who_name' => $user_name_first . ' ' . $user_name_last,
		'n_created' => $timestamp,
	);
	
	// update notes dbase
	$properties = magicish_quotes($properties);
	$note = sqlinsert('bn_notes',$properties);
	$error1 = mysql_error();
	
	// add to actions
	$error2 = false;
	$dbase = array(
		't_date' => $timestamp,
		't_who_id' => $user_id,
		't_who_name' => $user_name_first . ' ' . $user_name_last,
		't_page' => $page_id,
		't_note' => $note,
		't_status' => 5,
		't_order' => $n_order,
		't_posleft' => 100,
		't_postop' => 100,
		't_width' => 200,
		't_height' => 200,
		't_min' => 0
	);
	$dbase = magicish_quotes($dbase);
	$success2 = sqlinsert('bn_actions',$dbase);
	
	// report
	$output = array(
		'note' => $note,
		'note' => $n_order,
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
	}
	
	$response = json_encode($output);
	echo $response;

?>