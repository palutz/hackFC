<?php

// Configuration
$mongo_host = 'localhost';
$mongo_db = 'FCH';

$m = new MongoClient("mongodb://$mongo_host");
$sm = $m->$mongo_db;
$events = $sm->events;
$reply = array();

if($_GET['a'] == 'date_range'){
	$ts_start = $_GET['ts'];
	$ts_end = $_GET['te'];
	$ops = array(
		array(
			'$match' => array(
				'ts' => array('$gt' => (double)$ts_start, '$lt' => (double)$ts_end)
			)
		),
		array(
			'$group'=> array(
				'_id' => '$ts',
				'count' => array('$sum' => '$amount')
			)
		),	array(
			'$sort' => array('_id'=>-1) 
		)
	);





// die(print_r($ops));

	$cursor = $events->aggregate($ops);

	//1376866800000
	//1381027913057

	//die(print_r($cursor));

	foreach ($cursor['result'] as $document) {
	    $reply[] = array( $document['_id'],$document['count']);
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



header('Content-type: application/json');
//echo json_encode(array_slice($reply, 0,7));
echo json_encode($reply);



?>