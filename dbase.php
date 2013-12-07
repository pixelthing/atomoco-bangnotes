<?php

## CLASS

class mtDb {

	var $_connectionID;
	var $dbhost;	
	var $dbuser;
	var $dbpass;
	var $dbname;
	var $ErrorMsg;
	
	function Connect($dbhost,$dbuser,$dbpass,$dbname) {
	
		$this->_connectionID = @mysql_connect($dbhost, $dbuser, $dbpass);
		mysql_select_db($dbname);
		if (!$this->_connectionID) {;
			$this->ErrorMsg = 'Error: database connection failed';
			//echo 'ERROR: connection to database failed. host:'.$dbhost.' ; user:'.$dbuser.' ; pass:'.$dbpass.' ; name:'.$dbname.' ; ';
		} else {
			return $this->_connectionID;
		}
	
	}
	
	function GetAssoc($sql) {
	
		$result = @mysql_query($sql,$this->_connectionID);
		if (!$result) {
			$this->ErrorMsg = 'Error: GetAssoc() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
			//echo 'Error: GetAssoc() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
			return false;
		} elseif (mysql_num_rows($result)<1) {
			return false;
		} else {
		
			$result_size = sizeof(mysql_fetch_assoc($result));
			
			//mt_print($sql.'<br>'.sizeof(mysql_fetch_assoc($result)));
			//mt_print($result_size);
			//mt_print_r(mysql_fetch_assoc($result));
			# if there are only one field looked up, return a non-assoc two dimensional array
			if ($result_size==1) {
			
				# rewind
				mysql_data_seek ($result,0);
				# find the field names
				$field1 = mysql_fetch_field($result,0);
				$field1 = $field1->name;
				# loop
				while ($row = mysql_fetch_assoc($result)) {
					$return[] = $row[$field1];
				}
				
			# if there are only two fields looked up, return an assoc two dimensional array
			} elseif ($result_size==2) {
			
				# rewind
				mysql_data_seek ($result,0);
				# find the field names
				$field1 = mysql_fetch_field($result,0);
				$field1 = $field1->name;
				$field2 = mysql_fetch_field($result,1);
				$field2 = $field2->name;
				# loop
				while ($row = mysql_fetch_assoc($result)) {
					$return[$row[$field1]] = $row[$field2];
				}
				
			
			# if there are more than one field looked up, return a 3 dimensional array
			} else {
			
				# rewind
				mysql_data_seek ($result,0);
				
				# use the first field retrieved as the primary
				$temp = mysql_fetch_field($result,0);
				$primary = $temp->name;
				# loop
				while ($row = mysql_fetch_assoc($result)) {
					# set key
					if ($primary) {
						$key = $row[$primary];
					} else {
						$key = $counter;
					}
					$return[$row[$primary]] = $row;
				}
			}
			return $return;
		}
		
	
	}
	
	function GetRow($sql) {
	
		$result = @mysql_query($sql,$this->_connectionID);
		if (!$result) {
			$this->ErrorMsg = 'Error: GetRow() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
			//echo 'Error: GetRow() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
			return false;
		} elseif (mysql_num_rows($result)<1) {
			return false;
		} else {
			return mysql_fetch_assoc($result);
		}
	
	}
	
	function Execute($sql) {
	
		$result = @mysql_query($sql,$this->_connectionID);
		if (!$result) {
			$this->ErrorMsg = 'Error: Execute() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
			//echo 'Error: Execute() failed: '.mysql_error().'<br /><pre>'.$sql.'</pre>';
		} elseif (strtolower(substr(trim($sql),0,6))=='insert') {
			return mysql_insert_id();
		} elseif (strtolower(substr(trim($sql),0,6))=='delete' OR strtolower(substr(trim($sql),0,6))=='update') {
			return mysql_affected_rows();
		} elseif (mysql_num_rows($result)<1) {
			return false;
		} else {
			# if we're replying with just a single stat (eg COUNT(*)), just reply with that
			$return = mysql_fetch_assoc($result);
			if (sizeof($return)==1 AND !is_array(current($return))) {
				return current($return);	
			} else {
				return $return;
			}
		}
	
	}
	
	function Close() {
		mysql_close($this->_connectionID);
	}

}






	
	
## FUNCTION TO RUN SQL AND GET AN ASSOC ARRAY OF MANY LINES OF DATA
	
	function sql2array($sql,$altkey=false,$usecache=false,$db=false,$inputarr=false,$force_array=false) {
	
		# $usecache is an override for caching db calls and can be 3 settings: 
		#	false (don't override any config setting)
		#	'on' (set caching to be on, no matter what the config is)
		#	'off' (set caching to be off, no matter what the config is)
		# $inputarr (no idea! - look into adodb)
		# $force_array is when you're only asking for two fields to be returned. By default, that would be returned as a 1d array. setting as "true" returns a 2d array
	
		global $config,$dbo;
		
		if (!$sql) {
			echo '[no SQL]';
			return false;
		} else {
			$result_array = $dbo->GetAssoc($sql);
			if ($result_array === false) {
				return array();
				//echo 'sql2array error: '.$db->ErrorMsg.'<br /><pre>'.$sql.'</pre>'; 
			}
			
			# if we're specifying an alternative key or the array
			if ($altkey) {
				$result_array2 = array();
				$counter1=0;
				if (is_array($result_array)) {
					foreach($result_array AS $val) {
						# if only two fields are asked to be returned, return the result as it is.
						if (!is_array($val)) {
							$result_array2 = $result_array;
							break;
						}
						$newkey = $val[$altkey];
						if ($val[$altkey]=='') {
							$newkey = 'e'.zerofill($counter1,5).mt_rand(0,999);
						}
						$result_array2[$newkey] = $val;
						$counter1++;
					}
				}
				$result_array = $result_array2;
			}
			
			return $result_array;
		}
	}
	
	
	
## FUNCTION TO RUN SQL AND GET AN ASSOC ARRAY OF FIRST LINE OF DATA
	
	function sql2single($sql,$usecache=false,$db=false) {
	
		# $usecache is an override for caching db calls and can be 3 settings: 
		#	false (don't override any config setting)
		#	'on' (set caching to be on, no matter what the config is)
		#	'off' (set caching to be off, no matter what the config is)
	
		global $config,$dbo;
		
		if (!$sql) {
			echo '[no SQL]';
			return false;
		} else {
			$result_array = $dbo->GetRow($sql);
			if ($db->ErrorMsg) {
				//echo 'sql2single error: '.$db->ErrorMsg.'<br /><pre>'.$sql.'</pre>'; 
				return false;
			} elseif (!$result_array) {
				//echo 'sql2single error: '.$db->ErrorMsg.'<br /><pre>'.$sql.'</pre>'; 
				return false;
			}
			return $result_array;
		}
	}
	
	
	
	
## FUNCTION TO RUN ANY SQL
	
	function sqlexecute($sql,$usecache=false,$db=false,$showerror=true) {
	
		# $usecache is an override for caching db calls and can be 3 settings: 
		#	false (don't override any config setting)
		#	'on' (set caching to be on, no matter what the config is)
		#	'off' (set caching to be off, no matter what the config is)
	
		global $config,$dbo;
		
		if (!$sql) {
			echo '[no SQL]';
			return false;
		} else {
			$result_array = $dbo->Execute($sql);
			if ($db->ErrorMsg AND $showerror) {
				#echo 'sqlexecute error: '.$db->ErrorMsg.'<br /><pre>'.$sql.'</pre>'; 
			} elseif ($result_array === false AND $showerror) { 
				#echo 'sqlexecute error: '.$db->ErrorMsg().'<br /><pre>'.$sql.'</pre>'; 
			}
			
			# if we're outputting an array, cool
			if (is_array($result_array)) {
				return $result_array;
			# if we're returning an object
			} elseif (is_object($result_array)) {
				# if we're returning ONE item (eg, a total count)
				$output_fields = $result_array->fields;
				if (sizeof($output_fields)==2) {
					return $result_array->fields[0];
				# else we're reporting on the whole object
				} else {
					return $result_array;
				}
			}
			return $result_array;
		}
	}




## FUNCTION TO QUICKLY INSERT AN ITEM

function sqlinsert($table,$args) {
	
	global $config,$dbo;
	
	if (!$table) {
		echo 'sqlinsert missing $table:'.$table;
		return false;
	}
	
	$sql = "INSERT INTO $table 
			(";
			
	$counter1=0;
	foreach($args AS $key => $val) {
	
		$sql .= "
			$key";
		$counter1++;
		if ($counter1<sizeof($args)) {
			$sql .= ",";
		}
	}
	
	$sql .= ")			
			VALUES			
			(";
			
	$counter1=0;
	foreach($args AS $key => $val) {
	
		$sql .= "
			'$val'";
		$counter1++;
		if ($counter1<sizeof($args)) {
			$sql .= ",";
		}
	}
	
	$sql .= "
			)";
	sqlexecute($sql);

	$id = mysql_insert_id();
	
	return $id;
}





## FUNCTION TO QUICKLY UPDATE AN ITEM

function sqlupdate($table,$primary,$id,$args,$andsql=false) {

	global $config,$dbo;
	
	if (!$table) {
		echo 'sqlupdate missing $table:'.$table.' (primary: '.$primary.')';
		return false;
	}
	if (!$primary) {
		echo 'sqlupdate missing $primary:'.$primary.' (table: '.$table.')';
		return false;
	}
	if (!$id) {
		echo 'sqlupdate missing $id:'.$id.' (table: '.$table.')';
		return false;
	}
	
	$sql = "UPDATE $table SET";
			
	$counter1=0;
	foreach($args AS $key => $val) {
		//if ($key === 'page_cache') { $counter1++; continue; }
	
		$sql .= "
			$key='$val'";
		$counter1++;
		if ($counter1<sizeof($args)) {
			$sql .= ",";
		}
	}
	
	$sql .= "
			WHERE $primary='$id'";
			
	# extra condition
	if ($andsql) {
		$sql .= "
			AND ".$andsql;
	}
	$rows = sqlexecute($sql);

	return $rows;
}


function diebug ($what) {
	echo "<pre>$what</pre>";
	echo '<pre>'.print_r(debug_backtrace(),true).'</pre>';
	exit();
}


## FUNCTION TO QUICKLY DELETE ONE OR SEVERAL IDs
 
function sqldelete($table,$primary,$ids,$andsql=false) {

	global $config,$dbo;
	
	if (!$table) {
		diebug('sqldelete missing $table:'.$table);
		return false;
	}
	if (!$primary) {
		echo 'sqldelete missing $primary:'.$primary.' (table: '.$table.')';
		return false;
	}
	if (!$ids) {
		echo 'sqldelete missing $ids:'.$ids.' (table: '.$table.')';
		return false;
	}
	
	$todelete_array = explode(',',$ids);
	if (sizeof($todelete_array)>1) {
		$sql = "DELETE FROM $table WHERE $primary IN ($ids)";
	} else {
		$sql = "DELETE FROM $table WHERE $primary = '$ids'";
	}
	
	# extra condition
	if ($andsql) {
		$sql .= "
			AND ".$andsql;
	}
	$rows = sqlexecute($sql);
	
	return $rows;
}




## FUNCTION TO CHECK IF A TABLE EXISTS

function sqltablecheck($table) {

	global $config,$dbo;
	
	if (!$table) {
		diebug('sqltablecheck missing $table:'.$table);
		return false;
	}
//	$sql = "SELECT count(1) FROM $table LIMIT 0,1";
	$sql = "SHOW tables";
	
	$success = sql2array($sql);
	
	if (in_array($table, $success)) {
		$success = true;
	} else {
		$success = false;
	}
	
	return $success;
}



## MAGICISH QUOTES

# cleans data from quotes etc before entry into database/file (ie, like magic quotes)
function magicish_quotes($input) {

	//mt_print(sizeof($input),0,'#99f');
	
	if (is_array($input)) {
		$input2 = $input;
	} else {
		$input2 = array($input);
	}
	$output_array = array();
	
	# takes in a string OR takes in a key => val array of fields and their contents
	# then determines if magicquotes are on and if they aren't, escapes them with the most
	# appropriate method. (ps - I would use version_compare, but it doesn't work below PHP4.1)
	
	//mt_print_r($input2,0,'#600');
	# first turn off magicquotes
	if (get_magic_quotes_gpc()) {
		if (!function_exists(stripslashes_deep)) {
			function stripslashes_deep($value) {
				if(is_array($value)) {
					$value = array_map('stripslashes_deep', $value);
				} else {					
					if (is_string($value)) {
						$value = stripslashes($value);
					}
				}
				return $value;
			}
		}
		$input2 = array_map('stripslashes_deep', $input2);
	}
	//mt_print_r($input2,0,'#600');
	
		
	$v2 = preg_replace("/[^0-9\.]+/","",phpversion()); ##4.3.1015
	$v=$v2-0; ## 4.3
	$v2=substr($v2,strlen($v."")+1); ##1015
		
	if ($v>=4.3) {
		foreach ($input2 AS $key => $val) {
			if ($key===false) {
				continue;
			}
			if (is_string($val)) {
				$output_array[$key] = mysql_real_escape_string($val);
			} else {
				$output_array[$key] = $val;
			}
		}
	} else {
		foreach ($input2 AS $key => $val) {
			if (!$key) {
				continue;
			}
			if (is_string($val)) {
				$output_array[$key] = addslashes($val);
			} else {
				$output_array[$key] = $val;
			}
		}
	}
	if (is_array($input)) {
	
		# put the new value into the global
		foreach ($output_array AS $key => $val) {
			global $$key;
			$$key = $val;
		}
		return $output_array;
	} else {
		return $output_array[0];
	}
}








## CREATE DATABASE OBJECT
	$dbo = new mtDb;
	
	$dbhost = '0.0.0.0';
	$dbuser = 'root';
	$dbpass = 'root';
	$dbname = 'atomoco_notes2';
	
	
## CONNECT

	if (!@$dbo->Connect($dbhost, $dbuser, $dbpass, $dbname)) {
	
		// what to do if offline
		return false;
		
	}


	

?>