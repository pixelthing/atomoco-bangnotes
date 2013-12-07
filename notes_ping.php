<?php

	include('dbase.php');
	if ($dbo -> ErrorMsg) {
		echo 'Database is offline or busy';
		exit;
	}
	
	# get the version of the clientside code running
	
	# get the last modified date for this page
	$page = $_REQUEST['page'];
	$sql = "SELECT t_date
	FROM bn_actions,bn_pages 
	WHERE bn_actions.t_page = bn_pages.id_pages
		AND p_ref='$page'
	ORDER BY t_date DESC
	LIMIT 0,1";
	$last_mod = sqlexecute($sql);
	
	$response['v'] = 0.1;
	$response['m'] = $last_mod;
	$response = json_encode($response);
	
	echo $response;
?>