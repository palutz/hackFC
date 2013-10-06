/*
 * Control wich info are displayed
 */
var status = {
	// show the parking status
	showParking : false,
	// show the ztl boundaries
	showZtl : false,
	// show the ztl boundaries when ztl is active
	showZtlWhenActive : true,
	// show data about air pollution
	showPollution : false,
	autoreload : true,
	// can be "live" for live data or "history" to see the older data (enable
	// timeline)
	mode : "live"
};

var map;

/*
 * SETUP
 */
$(document).ready(function() {
	initialize();

	// toggle ztl
		$('#ztl').bind('click', function() {
			status.showZtl != showZtl;
		});

		// toggle auto ztl
		$('#autoztl').bind('click', function() {
			status.showZtlWhenActive != showZtlWhenActive;
		});

		// toggle parking
		$('#parking').bind('click', function() {
			status.showParking != showParking;
		});

		// toggle autoreload
		$('#autoreload').bind('click', function() {
			status.autoreload != autoreload;
		});
		
		$(document).everyTime(300000, reloadTraffic, 0);

		// click to duplicate
		// TODO remove and substitute with an onLoad map event
		$('#duplicate').bind('click', function() {
			$('.bckMarker').remove();

			$('.flowMarker').each(function() {
				var $t = $(this);
				var speed = $(this).children('.speedValue').html();
				$t.css("position", "absolute");

				var $clone = $t.clone().insertAfter($t);
				$clone.css('background-image', 'none');
				// TODO hide the rotating cars number
					$clone.removeClass("flowMarker").addClass("bckMarker");

					// $t.html('&nbsp;');

					setInterval(function() {
						var deg = (theta * speed) / 2 * Math.PI * 360;
						$t.css("rotate", deg + "deg");
						// $t.animate({
							// rotate : '+=' + speed + 'deg'
							// });
							theta += 0.01;

						}, 100);

				});
		});
	});

var theta = 0.0;

function reloadTraffic() {
	$.getScript('data/get_traffic_data.php?f=json&m=live', function() {
		drawTraffic(map);
	});
}

function initialize() {
	/**
	 * Map style
	 */
	map = setUpMap();

	/*
	 * Show your location
	 */
	// look if there is your location available
	setCurrentPosition(map);

	/*
	 * Traffic
	 */
	drawTraffic(map);

	/*
	 * Parking place
	 */
	// Draw the parking lots
	drawParking(map);


	/*
	 * Draw the polyline for the ztl datas
	 */
	// check if we are in the ztl time
	var ZTLActive = isZTLActive();
	if (ZTLActive) {
		drawZTL(map);
	}

}

function setUpMap() {
	var map;
	map = new google.maps.Map(document.getElementById("map_canvas"));

	// set map options
	var myOptions = {
		zoom : 12,
		// center : latlng,
		mapTypeControlOptions : {
			mapTypeIds : [ google.maps.MapTypeId.ROADMAP, 'stile' ]
		}
	};

	/*
	 * create map with options
	 */
	var styledMapOptions = {
		name : "stile"
	};
	var jayzMapType = new google.maps.StyledMapType(stylez, styledMapOptions);

	map.mapTypes.set('stile', jayzMapType);
	map.setMapTypeId('stile');

	map.setOptions(myOptions);

	return map;
}

function setCurrentPosition(map) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var yourPos = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);
			new google.maps.Marker( {
				position : yourPos,

				map : map
			});
			map.setCenter(yourPos);
			map.setZoom(17);
		}, function() {
			var latlng = new google.maps.LatLng(45.08252, 7.66632);
			map.setCenter(latlng);
			map.setZoom(12);
		});
	} else {
		var latlng = new google.maps.LatLng(45.08252, 7.66632);
		map.setCenter(latlng);
		map.setZoom(12);
	}
}

function drawTraffic(map) {
	var markers = [];
	for ( var i = 0, traffic; traffic = data.traffic[i]; i++) {
		var latLng = new google.maps.LatLng(traffic.lat, traffic.lng);
		var marker = new google.maps.Marker( {
			position : latLng,
			size : traffic.flow,
			speed : traffic.speed
		});
		markers.push(marker);
	}
	var markerCluster = new MarkerClusterer(map, markers);
}

function isZTLActive() {
	// TODO remove the following line to make it work in the right way
	return true;
	// ------------
	var isZTLActive = false;
	var today = new Date();

	if (today.getDay() != 5 && today.getDay() != 6) {
		var startTime = ztlData.time.start;
		var endTime = ztlData.time.end;

		var startTokens = startTime.split(":");
		var endTokens = endTime.split(":");

		var startDate = new Date(today.getFullYear(), today.getMonth(), today
				.getDate(), startTokens[0], startTokens[1], startTokens[2], 0);
		var endDate = new Date(today.getFullYear(), today.getMonth(), today
				.getDate(), endTokens[0], endTokens[1], endTokens[2], 0);

		if (today >= startDate && today <= endDate) {
			isZTLActive = true;
		}
	}

	return isZTLActive;
}

function drawZTL(map) {
	// get the ztl's perimeter
	var ztlPoints = [];
	for ( var i = 0; i < ztlData.points.length; i++) {
		ztlPoints.push(new google.maps.LatLng(ztlData.points[i].lat,
				ztlData.points[i].lng));
	}

	// draw the ztl's perimeter
	var ztlLine = new google.maps.Polyline( {
		map : map,
		clickable : false,
		path : ztlPoints
	});
	/*
	 * Draw the gates of the ztl
	 */
	for ( var i = 0; i < ztlData.gates.length; i++) {
		var marker = new google.maps.Marker( {
			position : new google.maps.LatLng(ztlData.gates[i].lat,
					ztlData.gates[i].lng),
			title : ztlData.gates[i].name,
			icon : "images/gate.png",
			map : map
		});

		// Draw the gates of the ztl
		for ( var i = 0; i < ztlData.gates.length; i++) {
			var marker = new google.maps.Marker( {
				position : new google.maps.LatLng(ztlData.gates[i].lat,
						ztlData.gates[i].lng),
				title : ztlData.gates[i].name,
				icon : "images/gate.png",
				map : map
			});

		}
	}
}

function drawParking(map) {
	for ( var i = 0; i < pkData.pks.length; i++) {
		var marker = new google.maps.Marker( {
			position : new google.maps.LatLng(pkData.pks[i].lat,
					pkData.pks[i].lng),
			title : pkData.pks[i].name,
			icon : "images/parking.png",
			map : map
		});

	}
}

// google.maps.event.addListener(map, 'zoom_changed', function() {
//		
// });
//
// google.maps.event.addListener(map, 'bounds_changed', function() { //
//		
// });

