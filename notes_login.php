<?php

	include('dbase.php');
	include('functions.php');
	
	$user = $_REQUEST['user'];
	$pass = $_REQUEST['pass'];
	$prot = $_REQUEST['prot'];
	$host = $_REQUEST['host'];
	$port = $_REQUEST['port'];
	
	$success = true;
	
	// update transaction dbase with new note info
	$timestamp = date('Y-m-d H:i:s');

	# look up user
	$sql = "SELECT * FROM bn_users,bn_accounts 
	WHERE bn_accounts.id_accounts = bn_users.u_account
		AND u_username = '$user'
		AND u_password = '$pass'"; 
	$user_result = sql2single($sql);
	
	# user not found
	if (!$user_result) {
	
		$output['success'] = false;
		$output['error'] = 'User account not found from that username and password.';
		
	} else {
	
		# user is switched off
		if ($user_result['u_status']<5) {
		
			$output['success'] = false;
			$output['error'] = 'User login disabled.';
			
		# account is switched off
		} elseif ($user_result['a_status']<5) {
		
			$output['success'] = false;
			$output['error'] = 'Account disabled.';
		
		# user found 
		} else {
		
			# check site is live
			$sql = "SELECT * FROM bn_sites 
			WHERE 
				(s_host1_prot = '$prot'
				AND s_host1_host = '$host'
				AND s_host1_port = '$port')"; 
			$site_result = sql2single($sql);
			
			# site is not linked to account
			if ($site_result['s_account'] != $user_result['u_account']) {
		
				$output['success'] = false;
				$output['error'] = 'Account-site unlinked';
			
			# site is swtiched off
			} elseif ($site_result['s_status']<5) {
		
				$output['success'] = false;
				$output['error'] = 'Site disabled.';
			
			# site is good!
			} else {
					
				# create a token
				define('SECRET', $site_result['s_secret']);
				$token = make_token();
						
				# enter the token into the table
				$dbase = array(
					't_token' => $token,
					't_status' => 5,
					't_account' => $user_result['u_account'],
					't_user' => $user_result['id_users'],
					't_ip' => $_SERVER['SERVER_ADDR'],
					't_browser' => $_SERVER['HTTP_USER_AGENT'],
					't_timeout' => date('Y-m-d H:i:s',strtotime('+1 month'))
				);
				sqlinsert('bn_tokens',$dbase);
			
				$output['success'] = true;
				$output['token'] = $token;
		
			}
		
		}
	
	}
	
	# report
	$output['user'] = $user;
	$output['pass'] = ($pass?'yes':'no');
	$output['prot'] = $prot;
	$output['host'] = $host;
	$output['port'] = $port;
	
	$response = json_encode($output);
	echo $response;

?>