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
		$("#address-btn").bind('click', getCoord);
		$("#locate").bind('click', locate);
	} else {
		loadMap(false);
		$("#info").hide();
		$("#options").hide();
		$("#intermediateInfo").hide();
		$("#wait").hide();
		$("#buu").show();
	}
});

function openClose(event) {
	if (isClosed) {
		$("#options").css('bottom', '-2em');
		isClosed = false;
	} else {
		$("#options").css('bottom', '-18em');
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
	startPos = new google.maps.LatLng(45.06954,7.6897);
	map = new google.maps.Map(document.getElementById("map_canvas"));
	marker = new google.maps.Marker();

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			startPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			// console.log(startPos);
			marker.setPosition(startPos);
			marker.setMap(map);
			map.setCenter(startPos);
			if (interactive) {
				hideWait();
				//getPaths();
			}
		}, function() {
//			startPos = new google.maps.LatLng(45.07905789227244, 7.676254902191204);
			if (interactive) {
				hideWait();
				//getPaths();
			}			
		});
	} else {
//		startpos = new google.maps.LatLng(45.07905789227244, 7.676254902191204);
			if (interactive) {
				showWait();
				hidePaths();
			}
	}

	var myOptions = {
		zoom : 14,
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

	getAddress();

	var markerOptions = {
		position : startpos,
		visible : true
	};
	marker.setOptions(markerOptions);

	marker.setMap(map);

	google.maps.event.addListener(map, 'click', function(event) {
		placeMarker(event.latLng);
		if (radius) {
			radius.setMap(null);
		}
		getAddress();
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
	// thisMoment = new Date("2001", "03", "07", "19", "03", "00");
	thisMoment.setSeconds(thisMoment.getSeconds() + 20);
	var fd = thisMoment.getFullYear() + "-" + (thisMoment.getMonth() + 1) + "-" + thisMoment.getDate() + " " + thisMoment.getHours() + ":" + thisMoment.getMinutes() + ":"
			+ thisMoment.getSeconds();
	var distance = $("#distance").val();
	distance = distance / 1000 / 1.609344;
	var time = $("#time").val();
	// console.log("Data:");
	// console.log(fd);

	
    drawRadius();
	
	if (buster) {
		buster.setMap(null);
	}

	if (updateIntervalId) {
		clearInterval(updateIntervalId);
	}

	infowindow.setContent("");
	infowindow.close();
	showWait();
	emptyIntermediateInfo();
	emptyStopInfo();
	$("#buscontainer").children().each(function() {
		$(this).remove();
	});

    fd = "2011-4-17 12:58:07";
	$.ajax({
		type : 'GET',
		url : 'data/getSegments.php?lat=' + lat + '&lon=' + lon + '&datetime=' + fd + '&distance=' + distance + '&time=' + time,
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

	if (data != undefined && data.segments != undefined) {
		var routes = data.line;
		var segments = data.segments;
		$(".routeInfo").remove();
		var liList = new Array();
		var opacities = new Array();
		for ( var routeId in routes) {
			//console.log("ciclo");
			// var hr = routes[routeId].departure_time.split(":");
			// var d1 = new Date();
			// var d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDay(),
			// hr[0],hr[1],hr[2]);
			// var minute = 1000*60;
			// var diff = Math.ceil((d2.getTime()-d1.getTime())/(minute));
			//			
			var diff = getDiffTime(routes[routeId].departure_time);

			var opacity;
			if (diff >= 0 && diff <= 60) {
				opacity = 1;
			} else if (diff > 60 && diff <= 360) {
				opacity = 0.6;
			} else if (diff > 360 && diff <= 600) {
				opacity = 0.4;
			} else {
				opacity = 0.2;
			}
			opacities[routeId] = opacity;
			var showTime = displayTime(diff);

			var v = getBusInfoElement(routes[routeId].color, routes[routeId].route_short_name, showTime, routeId, routes[routeId], diff, opacity);
			console.log("V ", v);

			/*
			 * var h = $('<input type="hidden" value="' + routeId + '"></input>');
			 * var v = $("<div>" + routes[routeId].route_short_name + "</div>");
			 * v.addClass("routeInfo"); v.css("background-color",
			 * routes[routeId].color);
			 * 
			 * var hr = routes[routeId].departure_time.split(":"); var d1 = new
			 * Date(); var d2 = new Date(d1.getFullYear(), d1.getMonth(),
			 * d1.getDay(), hr[0],hr[1],hr[2]); var minute = 1000*60; var diff =
			 * Math.ceil((d2.getTime()-d1.getTime())/(minute));
			 * 
			 * var showTime = displayTime(routes[routeId].departure_time);
			 * 
			 * var p = $("<p>" + showTime + "</p>");
			 * p.addClass("routeTime"); v.append(p); v.append(h);
			 * 
			 * v.bind('click', function(event, r) { return function() {
			 * emptyStopInfo(); emptyIntermediateInfo(); showStopInfo(r);
			 * buster.highlight($(this).children("input").val()); //debug info
			 * //buster.highlightDebug($(this).children("input").val(),$('#debuginfo'));
			 * 
			 * $("#resetLines").remove(); var ror = $('<div
			 * id="resetLines">Clear</div>'); ror.addClass("routeInfo");
			 * $("#routeBox").append(ror); ror.bind('click', function() {
			 * buster.highlight(-1); emptyStopInfo(); $(this).remove(); }); }
			 * }(event, routes[routeId])); //CLOSURE!!!!
			 * 
			 */
			liList.push(v);
			// $("#buscontainer").append(v);
		}

		function sortByTime(a, b) {
			var t1 = $(a).children("input").last().val();
			var t2 = $(b).children("input").last().val();
			return t1 - t2;
		}

		liList.sort(sortByTime);

		for ( var i = 0; i < liList.length; i++) {
			$("#buscontainer").append(liList[i]);
		}
		// calculate the segments position
		if (buster == undefined) {
			buster = new BDCCParallelLines(4, 0.8, 6, segments, routes);
		} else {
			buster.setMap(null);
			buster.updateData(segments, routes);
		}

		buster.setMap(map);
		buster.setOpacity(opacities);

		updateIntervalId = setInterval(updateTimes, 60000);

		hideWait();

	} else {
		alert("No routes!");
		hideWait();
	}
}

function drawRadius() {
	if (radius) {
		radius.setMap(null);
	}
	
	var pos = marker.getPosition();
	console.log("pos");
	console.log(pos);
	radius = new google.maps.Circle({
		center : pos,
		map : map,
		radius : parseInt($("#distance").val()),
		strokeColor : "#cccccc",
		fillColor : "#cccccc",
		opacity : 0.3,
		zIndex:400
	});
}

function getCoord() {
	var address = $("#address").val();
	if (address.toLowerCase().indexOf("torino") == -1) {
		address += ", torino";
	}
	// console.log(address);
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'address' : address
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.panTo(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location);
			getPaths();
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

function getAddress() {
	geocoder.geocode({
		'latLng' : marker.getPosition()
	}, function(result, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var tot = result.length;
			$("#address").val(result[0].formatted_address);
		}
		;
	});
}

function locate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var yourPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			// console.log(yourPos);
			marker.setPosition(yourPos);
			marker.setMap(map);
			map.panTo(yourPos);
		}, function() {
			alert("No GPS available");
		});
	} else {
		alert("No GPS available");
	}
}

function getDiffTime(targetTime) {
	var tt = targetTime.split(":");
	var target = new Date(thisMoment.getFullYear(), thisMoment.getMonth(), thisMoment.getDate(), tt[0], tt[1], tt[2]);

	if (target < thisMoment) {
		target.setDate(target.getDate() + 1);
	}

	var difference = (target.valueOf() - thisMoment.valueOf()) / 1000;
	return difference;
}

function displayTime(difference) {
	var h = ((Math.floor(difference / 3600)) % 24).toString();
	var m = ((Math.floor(difference / 60)) % 60).toString();
	var s = ((Math.floor(difference / 1)) % 60).toString();

	if (m == 0) {
		return "Meno di 1 minuto";
	}

	var suffisso = 'i';
	if (m == 1) {
		suffisso = 'o';
	}

	// if (h.length < 2)
	// h = '0'+h;
	// if (m.length < 2)
	// m = '0'+m;
	// if (s.length < 2)
	// s = '0'+s;

	return m + " minut" + suffisso;
}

function showStopInfo(route) {
	var center = map.getCenter();
	var markerPos = marker.getPosition();
	var infoClass = "";
	if (markerPos.lat() >= center.lat() && markerPos.lng() <= center.lng()) {
		// alto sx
		infoClass = "topleft";
	}
	if (markerPos.lat() > center.lat() && markerPos.lng() > center.lng()) {
		// alto dx
		infoClass = "topright";
	}
	if (markerPos.lat() < center.lat() && markerPos.lng() < center.lng()) {
		// basso sx
		infoClass = "bottomleft";
	}
	if (markerPos.lat() < center.lat() && markerPos.lng() > center.lng()) {
		// basso dx
		infoClass = "bottomright";
	}
	$("#info").addClass(infoClass);
	var divcnt = $("<div id=\"infowindow\"></div>");

	$("#info").append(divcnt);

	console.log(route.trip_id);
	var numero = document.getElementById("tripid-" + route.trip_id).cloneNode(true);
	numero.setAttribute("id", "stopinfo-" + route.trip_id);
	console.log(numero);

	var orig = document.getElementById("tripid-" + route.trip_id);
	if ($(orig).parent().hasClass("bar")) {
		console.log("addclass bar");
		$("#info").addClass("bar");
	}

	divcnt.append(numero);
	divcnt.append("<span>Direzione " + route.trip_headsign + "</span>");
	divcnt.append("<span>" + route.stop_name + "</span>");
	divcnt.append("<span>" + route.stop_desc + "</span>");
	divcnt.append("<span>" + route.departure_time + "</span>");
	var a = $("<span>Chiudi</span>");
	divcnt.append(a);
	$(a).bind('click', emptyStopInfo);
	// $("#info").show();
	console.log("screentop dopo click", window.screenTop);
	console.log(window.innerHeight);
	console.log(window.pageYOffset);

	var cnt = $("<div class=\"info\"></div>");
	if ($(orig).parent().hasClass("bar")) {
		console.log("addclass bar");
		cnt.addClass("bar");
	}
	var insidediv = $("<div id=\"infowindow\"></div>");
	insidediv.append(numero);
	insidediv.append("<span>Direzione " + route.trip_headsign + "</span>");
	insidediv.append("<span>" + route.stop_name + "</span>");
	insidediv.append("<span>" + route.stop_desc + "</span>");
	insidediv.append("<span>" + route.departure_time + "</span>");
	cnt.append(insidediv);

	infowindow.setOptions({
		content : cnt.html(),
		position : new google.maps.LatLng(route.lat, route.lon)
	});
	infowindow.open(map);

	google.maps.event.addListener(infowindow, 'closeclick', function(event) {
		buster.highlight(-1);
		infowindow.setContent("");
		infowindow.close();
	});

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
