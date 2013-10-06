var map;
var marker;
var infowindow = new google.maps.InfoWindow({
	content : ''
});
var radius;
var buster;
var geocoder = new google.maps.Geocoder();
var isClosed = true;
var thisMoment;
var updateIntervalId;
var startPos;
var markers = [];
var markerCluster = null;
var markerSpiderfier = null;

jQuery.browser = {};
jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

$(document).ready(function() {
	// browser detection
	if ($.browser.webkit) {
		$("#buu").remove();
		console.log("ready");
		console.log(window.screenTop);
		console.log(window.innerHeight);
		console.log(window.pageYOffset);
		showWait();
		$("#info").hide();
		$("#intermediateInfo").hide();
		initialize();
		$("#stops").bind('click', function(event) {
			if (!isClosed) {
				$("#options").css('bottom', '-18em');
				isClosed = true;
			}
			getPaths();
		});
		$("#openclose").bind('click', function(event) {
			openClose(event);
		});
		//$("#address-btn").bind('click', getCoord);
		//$("#locate").bind('click', locate);
	} else {
		$("#buu").remove();
		loadMap(false);
	}
	//display_timeline();
	
});

function openClose(event) {
	if (isClosed) {
		$("#options").css('bottom', '-32em');
		isClosed = false;
	} else {
		$("#options").css('bottom', '-28em');
		isClosed = true;
	}

}

function loadMap(interactive) {
	var stylez = [ {
		featureType : "road",
		elementType : "all",
		stylers : [ {
			visibility : "simplified"
		}, {
			saturation : -100
		}, {
			lightness : 31
		} ]
	}, {
		featureType : "road.arterial",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : -100
		}, {
			lightness : 30
		} ]
	}, {
		featureType : "road.local",
		elementType : "all",
		stylers : [ {
			visibility : "simplified"
		}, {
			saturation : -100
		}, {
			lightness : 50
		} ]
	}, {
		featureType : "landscape",
		elementType : "all",
		stylers : [ {
			visibility : "simplified"
		}, {
			saturation : -100
		}, {
			lightness : 31
		} ]
	}, {
		featureType : "transit",
		elementType : "all",
		stylers : [ {
			visibility : "off"
		}, {
			saturation : -100
		}, {
			lightness : 31
		} ]
	}, {
		featureType : "poi.attraction",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		} ]
	}, {
		featureType : "poi.park",
		elementType : "labels",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		} ]
	}, {
		featureType : "poi.medical",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		}, {
			hue : "#ff0000"
		} ]
	}, {
		featureType : "poi.government",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		} ]
	}, {
		featureType : "poi.place_of_worship",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		}, {
			hue : "#91219E"
		} ]
	}, {
		featureType : "poi.sports_complex",
		elementType : "all",
		stylers : [ {
			visibility : "on"
		}, {
			saturation : 92
		}, {
			hue : "#0011ff"
		} ]
	} ];


	startPos = new google.maps.LatLng(51.5100406,-0.1407178);
	map = new google.maps.Map(document.getElementById("map_canvas"));
	marker = new google.maps.Marker();

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			//startPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			// console.log(startPos);
			marker.setPosition(startPos);
			// marker.setMap(map);
			map.setCenter(startPos);
			if (interactive) {
				showWait();
				getPaths();
			}
		}, function() {
//			startPos = new google.maps.LatLng(45.07905789227244, 7.676254902191204);
			if (interactive) {
				showWait();
				getPaths();
			}			
		});
	} else {
//		startpos = new google.maps.LatLng(45.07905789227244, 7.676254902191204);
			if (interactive) {
				showWait();
				getPaths();
			}
	}

	var myOptions = {
		zoom : 13,
		center : startPos,
		panControl : false,
		zoomControl : true,
		zoomControlOptions : {
			style : google.maps.ZoomControlStyle.SMALL
		},
		scaleControl : true,
		streetViewControl : false,
		mapTypeControl : false,
		scrollwheel : false
	};

	map.setOptions(myOptions);
	var styledMapOptions = {
		name : "stile"
	};
	var jayzMapType = new google.maps.StyledMapType(stylez, styledMapOptions);
	map.mapTypes.set('stile', jayzMapType);
	map.setMapTypeId('stile');
	
	return startPos;
}

function initialize() {
	startpos = loadMap(true);
	/*
	 * var myOptions = { zoom : 14, center : startpos, mapTypeControlOptions : {
	 * mapTypeIds : [ google.maps.MapTypeId.ROADMAP, 'stile' ] } };
	 */

	// getAddress();

	var markerOptions = {
		position : startpos,
		visible : false
	};
	marker.setOptions(markerOptions);

	marker.setMap(map);

	google.maps.event.addListener(map, 'click', function(event) {
		placeMarker(event.latLng);
		if (radius) {
			radius.setMap(null);
		}
		// getAddress();
	});
}


function placeMarker(point) {
	marker.setMap(null);
	marker.setPosition(point);
	marker.setMap(map);
	
}

function getPaths() {
	var lat = marker.getPosition().lat();
	var lon = marker.getPosition().lng();
	map.panTo(marker.getPosition());
	thisMoment = new Date();

	pastMoment = new Date();
	pastMoment.setFullYear(thisMoment.getFullYear() - 2)
	// thisMoment = new Date("2001", "03", "07", "19", "03", "00");
	thisMoment.setSeconds(thisMoment.getSeconds() + 20);

	showWait();
	emptyIntermediateInfo();
	emptyStopInfo();
	// $("#buscontainer").children().each(function() {
	$.ajax({
		type : 'GET',
		//url : 'timeline.php?a=date_range&ts=' + pastMoment.getTime() + '&te=' + thisMoment.getTime(),
		url : 'http://hackfc.azurewebsites.net/api/findAggregate/'+pastMoment.getTime()+'/'+ thisMoment.getTime(),
		dataType : 'json',
		success : function(data) {
			display_timeline(data);

		},
		error : function(xhr, type) {
			alert("Errore ajax " + type);
			hideWait();
		}
	})
	
	$.ajax({
		type : 'GET',
		//url : 'services.php?lat=' + lat + '&lon=' + lon ,
		url : 'http://hackfc.azurewebsites.net/api/eventsTime/'+pastMoment.getTime()+'/'+ thisMoment.getTime(),
		dataType : 'json',
		success : function(data) {
			loadData(data);
		},
		error : function(xhr, type) {
			alert("Errore ajax " + type);
			hideWait();
		}
	});
}

function loadData(data) {
	console.log("loadData");

	if (data != undefined ) {

		if(markerCluster != undefined){
			markerCluster.clearMarkers();
		}
		
		for (var i = 0; i < markers.length; i++ ) {
    		markers[i].setMap(null);
  		}
		markers = [];
		data.forEach(function(v){
			console.log(v);	
			var marker = new google.maps.Marker();

			icon = "imgs/letter_b.png"
			if(v.ev_type == 'vomit')
				icon = "imgs/letter_v.png"
			if(v.ev_type == 'huf')
				icon = "imgs/letter_f.png"
			if(v.ev_type == 'duf')
				icon = "imgs/letter_f.png"
			if(v.ev_type == 'blood')
				icon = "imgs/letter_b.png"
			if(v.ev_type == 'grf')
				icon = "imgs/letter_g.png"
			if(v.ev_type == 'urine')
				icon = "imgs/letter_u.png"

			

			var markerOptions = {
				position : new google.maps.LatLng(v.loc.coordinates[1],v.loc.coordinates[0]),
				//position : new google.maps.LatLng(v.lat,v.lon),
				visible : true,
				icon: icon
			};
			marker.setOptions(markerOptions);
			// marker.setMap(map);
			markers.push(marker);


		});
		var clusterStyles = [
			  {
			    textColor: 'white',
			    url: 'imgs/pie_chart_32.png',
			    height: 32,
			    width: 32,
			    anchor: [6,8]
			  },
			 {
			    textColor: 'white',
			    url: 'imgs/pie_chart_48.png',
			    height: 48,
			    width: 48,
			    anchor: [12,10]
			  },
			 {
			    textColor: 'white',
			    url: 'imgs/pie_chart_64.png',
			    height: 64,
			    width: 64,
			    anchor: [16,10]
			  }
			];
		 var mcOptions = {
            gridSize: 50,
            styles: clusterStyles,
            maxZoom: 15
            };



		markerCluster = new MarkerClusterer(map, markers, mcOptions);
		hideWait();
	} else {
		alert("No routes!");
		hideWait();
	}
}

function emptyStopInfo() {
	$("#info").hide();
	$("#info").removeClass("bar");
	$("#info").removeClass();
	$("#info").removeClass();
	$("#info").removeClass();
	$("#info").removeClass();
	$("#info").children().each(function() {
		buster.highlight(-1);
		$(this).remove();
	});
}

function showIntermediateInfo(data) {

	$("#intermediateInfo").show();
	$("#intermediateInfo").append("<p>" + data.stop_name + "</p>");
	$("#intermediateInfo").append("<p>" + data.stop_desc + "</p>");
	var diff = getDiffTime(data.departure_time);
	var time = displayTime(diff);
	$("#intermediateInfo").append("<p>" + time + "</p>");
	var a = $("<span>Chiudi</span>");
	$("#intermediateInfo").append(a);
	$(a).bind('click', emptyIntermediateInfo);
}

function emptyIntermediateInfo() {
	$("#intermediateInfo").hide();
	if (buster) {
		buster.highlight(-1);
	}
	$("#intermediateInfo").children().each(function() {
		$(this).remove();
	});
}




function range_map(){
	var ts = Math.round($('#map_container').attr('data-ts'));
	var te = Math.round($('#map_container').attr('data-te'));
	$.ajax({
		type : 'GET',
		//url : 'services.php?a=date_range&ts=' + ts + '&te=' + te ,
		url : 'http://hackfc.azurewebsites.net/api/eventsTime/'+ts+'/'+te,
		dataType : 'json',
		success : function(data) {
			loadData(data);
		},
		error : function(xhr, type) {
			alert("Errore ajax " + type);
			hideWait();
		}
	});
}



function display_timeline(d){
		//var d = [[1185453600000, 0],[1196463600000, 0], [1196550000000, 0], [1196636400000, 0], [1196722800000, 77], [1196809200000, 3636], [1196895600000, 3575], [1196982000000, 2736], [1197068400000, 1086], [1197154800000, 676], [1197241200000, 1205], [1197327600000, 906], [1197414000000, 710], [1197500400000, 639], [1197586800000, 540], [1197673200000, 435], [1197759600000, 301], [1197846000000, 575], [1197932400000, 481], [1198018800000, 591], [1198105200000, 608], [1198191600000, 459], [1198278000000, 234], [1198364400000, 1352], [1198450800000, 686], [1198537200000, 279], [1198623600000, 449], [1198710000000, 468], [1198796400000, 392], [1198882800000, 282], [1198969200000, 208], [1199055600000, 229], [1199142000000, 177], [1199228400000, 374], [1199314800000, 436], [1199401200000, 404], [1199487600000, 253], [1199574000000, 218], [1199660400000, 476], [1199746800000, 462], [1199833200000, 448], [1199919600000, 442], [1200006000000, 403], [1200092400000, 204], [1200178800000, 194], [1200265200000, 327], [1200351600000, 374], [1200438000000, 507], [1200524400000, 546], [1200610800000, 482], [1200697200000, 283], [1200783600000, 221], [1200870000000, 483], [1200956400000, 523], [1201042800000, 528], [1201129200000, 483], [1201215600000, 452], [1201302000000, 270], [1201388400000, 222], [1201474800000, 439], [1201561200000, 559], [1201647600000, 521], [1201734000000, 477], [1201820400000, 442], [1201906800000, 252], [1201993200000, 236], [1202079600000, 525], [1202166000000, 477], [1202252400000, 386], [1202338800000, 409], [1202425200000, 408], [1202511600000, 237], [1202598000000, 193], [1202684400000, 357], [1202770800000, 414], [1202857200000, 393], [1202943600000, 353], [1203030000000, 364], [1203116400000, 215], [1203202800000, 214], [1203289200000, 356], [1203375600000, 399], [1203462000000, 334], [1203548400000, 348], [1203634800000, 243], [1203721200000, 126], [1203807600000, 157], [1203894000000, 288]];
		// first correct the timestamps - they are recorded as the daily
		// midnights in UTC+0100, but Flot always displays dates in UTC
		// so we have to add one hour to hit the midnights in the plot

		for (var i = 0; i < d.length; ++i) {
			d[i][0] += 60 * 60 * 1000;
		}

		var maxT = d[d.length-1][0]
		var minT = d[0][0]


		// helper for returning the weekends in a period

		function weekendAreas(axes) {
			var markings = [], d = new Date(axes.xaxis.min);
			//var markings = [], d = new Date(minT);
			// go to the first Saturday
			d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
			d.setUTCSeconds(0);
			d.setUTCMinutes(0);
			d.setUTCHours(0);

			var i = d.getTime();
			// when we don't set yaxis, the rectangle automatically
			// extends to infinity upwards and downwards
			do {
				markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
				i += 7 * 24 * 60 * 60 * 1000;
			} while (i < axes.xaxis.max);
			return markings;
		}

		var options = {
			xaxis: {
				mode: "time",
				tickLength: 5,
				timeformat: "%Y %m.%d"
			},
			selection: {
				mode: "x"
			},
			grid: {
				markings: weekendAreas
			}
		};

		var plot = $.plot("#placeholder", [d], options);

		var overview = $.plot("#timeline_canvas", [d], {
			series: {
				lines: {
					show: true,
					lineWidth: 1,

				},
				shadowSize: 0
			},
			colors: ["#222222", "#dba255", "#919733"],
			xaxis: {
				ticks: [],
				mode: "time",
				position: 'top',
				timeformat: "%Y %m"
			},
			yaxis: {
				ticks: [],
				min: 0,
				autoscaleMargin: 0.1,

			},
			selection: {
				mode: "x"
			},
			grid: {
				markings: weekendAreas
			}
		});
		// now connect the two
		$("#placeholder").bind("plotselected", function (event, ranges) {
			// do the zooming
			plot = $.plot("#placeholder", [d], $.extend(true, {}, options, {
				xaxis: {
					min: ranges.xaxis.from,
					max: ranges.xaxis.to
				}
			}));
			$('#map_container').attr('data-ts',ranges.xaxis.from).attr('data-te',ranges.xaxis.to);
			range_map();

			// don't fire event on the overview to prevent eternal loop
			overview.setSelection(ranges, true);
		});

		$("#timeline_canvas").bind("plotselected", function (event, ranges) {
			plot.setSelection(ranges);
		});

}

function showWait() {
	console.log("show");
	$("#wait").show();
}

function hideWait() {
	$("#wait").hide();
}

function getBusInfoElement(color, name, time, id, data, diff, opacity) {
	var size;
	if (name.length == 1) {
		size = "32px";
	}
	if (name.length == 2) {
		size = "24px";
	}
	if (name.length == 3) {
		size = "18px";
	}
	if (name.length == 4) {
		size = "12px";
	}
	var content = "<li";
	console.log("last char", name.substring(name.length - 1));
	if (name.substring(name.length - 1) == "B" || name.substring(name.length - 1) == "/") {
		content += " class=\"bar\"";
	}
	content += ">";
	content += "<p id=\"tripid-" + id + "\" style=\"color:" + color + ";border-color: " + color + ";font-size:" + size + "\">" + name + "</p>";
	content += "<p>" + time + "</p>";
	content += "<input type=\"hidden\" name=\"tripid\" value=\"" + id + "\" />";
	content += "<input type=\"hidden\" name=\"remainingtime\" value=\"" + diff + "\" />";
	content += "</li>";
	console.log(content);
	var li = $(content);
	li.children().first().css("opacity", opacity);
	li.children().first().next().css("opacity", opacity);
	li.bind('click', function() {
		emptyStopInfo();
		showStopInfo(data);
		buster.highlight($(this).children("input").first().val());
	});
	return li;
}

function updateTimes() {
	var containers = $("#buscontainer").children("li");
	var toRemove = new Array();
	if (containers.length <= 0) {
		clearInterval(updateIntervalId);
	}
	for ( var i = 0; i < containers.length; i++) {
		var container = containers[i];
		var time = $(container).children("input").first().next().val();
		time = time - 60;
		if (time > 0) {
			$(container).children("input").first().next().val(time);
			var showtime = displayTime(time);
			$(container).children().first().next().html(showtime);
			var opacity;
			if (time >= 0 && time <= 60) {
				opacity = 1;
			} else if (time > 60 && time <= 360) {
				opacity = 0.6;
			} else if (time > 360 && time <= 600) {
				opacity = 0.4;
			} else {
				opacity = 0.2;
			}
			$(container).children().first().css("opacity", opacity);
			$(container).children().first().next().css("opacity", opacity);
		} else {
			// $(container).anim({opacity: 0}, 20, 'linear', function(c) {
			// $(c).remove();
			// }(container));
			$(container).remove();

		}
		// console.log(toRemove.length);
		// for (var i = 0; i < toRemove.length; i++) {
		// $(toRemove[i]).remove();
		// }
	}
}
