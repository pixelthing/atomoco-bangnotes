<?php

	# return the basic notes data for one or many notes

	function get_notes ($scribbles=false,$page_id=false,$note_ids=false,$status=5) {
	
		# if $page_id is given and no $note_ids, find all the notes for that page
		# if $note_ids is given (either as a single id, or an array of ids), return just those notes
		# only including scribbles if $scribbles=true
		# $status returns a certain status of notes. set to false it returns everything.
			
		if (!$page_id AND !$note_ids) {
			return;
		}
	
		# set up status query
		if ($status!==false) {
			$subquery = "AND t_status='$status'";
		}
	
		# pull out the notes by note id
		if ($note_ids!==false) {
			$notes_keys = explode(',',$note_ids);
		}

		# get the last actions for all notes in one query
		$sql = "SELECT * 
		FROM bn_actions
			INNER JOIN (SELECT MAX(id_actions) AS id_actions FROM bn_actions GROUP BY t_note) bn_groups 
				ON bn_actions.id_actions = bn_groups.id_actions
			STRAIGHT_JOIN bn_notes
				ON bn_actions.t_note = bn_notes.id_notes
		WHERE 
			t_page='$page_id' 
			".($notes_keys?"AND t_note IN ('".implode("','",$notes_keys)."')":'')."
			".($status?"AND t_status='$status'":'')."
		ORDER BY t_note";
		
		$notes = sql2array($sql,'t_note');
		$notes_keys = array_keys($notes);
		
		//echo mysql_error().'<br>';print_r($notes);exit;
		
		$output['sql'] = $sql;
		$output['sql_error'] = mysql_error();
		
		foreach ($notes AS $note_key => $note_val) {

			# get the last token used by this person
			$token = sqlexecute("SELECT t_token FROM bn_tokens WHERE t_user='" . $note_val['n_who_id'] . "' ORDER BY id_tokens DESC LIMIT 1");

			$output[$note_key] = array(
				'id' => $note_key,
				'status' => $note_val['t_status'],
				'mod_id' => $note_val['id_actions'],
				'created' => $note_val['n_created'],
				'modified' => $note_val['t_date'],
				'who_id' => $note_val['n_who_id'],
				'who_name' => $note_val['n_who_name'],
				'who_token' => $token,
				'order' => $note_val['t_order'],
				'posx' => $note_val['t_posleft'],
				'posy' => $note_val['t_postop'],
				'sizex' => $note_val['t_width'],
				'sizey' => $note_val['t_height'],
				'min' => $note_val['t_min'],
				'scribble_list' => $note_val['t_scribble']
			);
			$note_scribbles[$note_key] = $note_val['t_scribble'];
		
		}
		
		// pull out the scribbles for all the notes in one query
		if ($scribbles) {
		
			$scribbles = get_scribbles(false,$note_scribbles);
			
			foreach ($scribbles AS $note_key => $note_scribbles) {
			
				$output[$note_key]['scribbles'] = $note_scribbles;
			
			}
			
		
		}
		
		return $output;
	
	}
	
	
	
	
	
	# get the scribbles for either (one note id or an array of note ids) OR (a string of comma delimited scribble ids or an array of such strings)
	
	function get_scribbles ($note_ids,$action_scribbles) {
	
		if (!$note_ids AND !$action_scribbles) {
			return;
		}

		# if we're getting the scribbles linked to the notes database
		if ($note_ids) {
		
			# sort out any single IDs that aren't in an array
			if (!is_array($note_ids)) {
				$note_ids = array($note_ids);
			}
			
			# get the list of scribbles that are part of these notes
			$sql = "SELECT * FROM bn_scribbles WHERE s_note IN ('".implode("','",$note_ids)."') ORDER BY s_note,s_order,id_scribbles";
			$scribbles = sql2array($sql);
			
		# if we're getting the scribbles linked to the actions database
		} else {
		
			# sort out any strings of scribble ids that aren't in an array
			if (!is_array($action_scribbles)) {
				$action_scribbles = array($action_scribbles);
			}
			
			# stick the list of scribbles together
			$scribble_ids = array();
			foreach ($action_scribbles AS $val) {
				$temp = explode(',',$val);
				$scribble_ids = array_merge($scribble_ids,$temp);
			}
			# clean up
			$scribble_ids = array_unique($scribble_ids);
			foreach ($scribble_ids AS $key => $val) {
				if (strlen(trim($val))<1) {
					unset($scribble_ids[$key]);
				}
			}
			
			# get the list of scribbles that are listed in these ids
			$sql = "SELECT * FROM bn_scribbles WHERE id_scribbles IN ('".implode("','",$scribble_ids)."') ORDER BY s_note,s_order,id_scribbles";
			$scribbles = sql2array($sql);
		
		}
		
		$output['sql'] = $sql;
		
		foreach ($scribbles AS $scrib_key => $scrib_val) {
			
			$output[$scrib_val['s_note']][$scrib_key] = array(
				'id' => $scrib_val['id_scribbles'],
				'created' => $scrib_val['s_created'],
				'who_id' => $scrib_val['s_who_id'],
				'who_name' => $scrib_val['s_who_name'],
				'message' => nl2br($scrib_val['s_message'])
			);
			
		}
		
		return $output;
	
	}

	function rand_alphanumeric() {
		$subsets[0] = array('min' => 48, 'max' => 57); // ascii digits
		$subsets[1] = array('min' => 65, 'max' => 90); // ascii lowercase English letters
		$subsets[2] = array('min' => 97, 'max' => 122); // ascii uppercase English letters
		
		// random choice between lowercase, uppercase, and digits
		$s = rand(0, 2);
		$ascii_code = rand($subsets[$s]['min'], $subsets[$s]['max']);
   
		return chr( $ascii_code );
	}
     
	function make_token() {
		$str = "";
		for ($i=0; $i<8; $i++) $str = rand_alphanumeric();
		return $str . md5($str . SECRET);
	}

	function validate_token($str) {
		$rs = substr($str, 0, 8);
		return $str == $rs . substr(md5($rs . SECRET), ord($str[7])-65, 8);
	}


	function valid ($token,$host,$prot=false,$port=false) {
	
		$output = false;
		if (!$prot) {
			$prot = 'http:';
		}
	
		if (!$token) {
			$error = 'No token.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		if (!$host) {
			$error = 'No host.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
	
		# find the secret for this site
		$sql = "SELECT * FROM bn_sites WHERE 
				(s_host1_prot = '$prot'
				AND s_host1_host = '$host'
				AND s_host1_port = '$port')";
		$site_result = sqlexecute($sql);
		$secret = $site_result['s_secret'];
		if (!$secret) {
			$error = 'Token not found.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		
		# check the token
		define('SECRET', $secret);
		$success = validate_token($token);
		
		# look up the token
		$sql = "SELECT * FROM bn_tokens,bn_accounts,bn_users WHERE 
				bn_tokens.t_account = bn_accounts.id_accounts
				AND bn_tokens.t_user = bn_users.id_users
				AND t_token = '$token'";
		$token_result = sql2single($sql);
				
		# is the token valid?
		if ($token_result['t_status'] < 5) {
			$error = 'Token has been turned off.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		# has it timed out?
		if (strtotime($token_result['t_timeout']) < time()) {
			$error = 'Token has timed out.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		# is the account valid?
		if ($token_result['a_status'] < 5) {
			$error = 'Account switched off.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		# is the user valid?
		if ($token_result['u_status'] < 5) {
			$error = 'User switched off.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		# does the site match the account?
		if ($token_result['t_account'] != $site_result['s_account']) {
			$error = 'Site not linked to this account.';
			valid_response($token,$host,$prot,$port,$error);
			return;
		}
		
		define('USER', $token_result['t_user']);
		define('ACCOUNT', $token_result['t_account']);
	
	}
	
	function valid_response ($token,$host,$prot,$port,$error) {
		
		$output = array();
		
		# turn off the token so it can't be re-used.
		sqlupdate('tokens','t_token',$token,array('status'=>0));
	
		# respond
		$output['invalid'] = true;
		$output['error'] = $error;
		$output['prot'] = $prot;
		$output['host'] = $host;
		$output['port'] = $port;
		$response = json_encode($output);
		echo $response;
		exit;
	
	}

?>