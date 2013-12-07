<?php

	//echo '<pre>';

	include('dbase.php');
	include('functions.php');
	
	$page = $_REQUEST['page'];
	$prot = $_REQUEST['prot'];
	$host = $_REQUEST['host'];
	$port = $_REQUEST['port'];
	$token = $_REQUEST['token'];
	
	# check the user is valid
	valid ($token,$host,$prot,$port);
	
	# get the page info
	$sql = "SELECT * FROM bn_pages,bn_sites 
	WHERE p_ref='$page' 
		AND bn_pages.p_site = bn_sites.id_sites
	LIMIT 0,1";
	$pages = sql2single($sql);
	$pages_id = $pages['id_pages'];
	
	
	//echo $sql.'<hr>';
	//print_r($scribbles);
	
	# organise the output
	$output = array(
	
		'id' => $pages_id,
		'ref' => $page,
		'datum' => ($pages['p_datum']?$pages['p_datum']:$pages['s_datum']),
		'minz' => $pages['p_minz']
	
	);
	
	## add notes and scribbles
	
	$output['notes'] = get_notes(true,$pages_id);
	
	$response = json_encode($output);
	echo $response;
	
	/*
	echo "<hr>\n";
	print_r($output);
	echo '</pre>';
	//*/
?>