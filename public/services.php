<?php


// Configuration
$mongo_host = 'localhost';
$mongo_db = 'FCH';

$m = new MongoClient("mongodb://$mongo_host");
$sm = $m->$mongo_db;
$events = $sm->events;
$reply = array();

if(isset($_GET['a']) && $_GET['a'] == 'date_range'){
	$ts_start = $_GET['ts'];
	$ts_end = $_GET['te'];

	$cursor = $events->find(array(
		"ts" => array('$gt' => (double)$ts_start,'$lt' => (double)$ts_end),
	));
	//die(print_r($cursor));

	foreach ($cursor as $document) {
	    $reply[] = array(
	    	"lat" => $document['loc']['coordinates'][1],
	    	"lon" => $document['loc']['coordinates'][0],
	    	"type" => $document['ev_type']
	    	);
	}	

}else{
	$lat = (float)$_GET['lat'];
	$lon = (float)$_GET['lon'];

	$cursor = $events->find(array(
			"loc" => array('$nearSphere' => array($lon,$lat)) 
			));

	$reply = array();
	foreach ($cursor as $document) {
	    $reply[] = array(
	    	"lat" => $document['loc']['coordinates'][1],
	    	"lon" => $document['loc']['coordinates'][0],
	    	"type" => $document['ev_type']
	    	);
	}	
}






echo json_encode($reply);



?>