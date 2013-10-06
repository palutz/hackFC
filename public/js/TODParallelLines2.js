// Parallel Polylines
//
// Original Google Maps V2 awesome code by: Bill Chadwick March 2008
// Released as Free for any use @ http://wtp2.appspot.com/ParallelLines.htm
//
// Modified for use with GMaps V3 by: Matthew Schwartz (schwartz.matthew@schwartzlink.net)
// Also released as free for any use

function BDCCParallelLines(weight, opacity, gapPx, segments, routes) {

	this.gapPx = gapPx;
	this.weight = weight;
	this.opacity = opacity;
	this.prj = null;

	this.zoomListener = null;
	// custom
	this.segments = segments;
	this.routes = routes;
	this.routeTokens = new Array();
	this.polylines = [];
	this.stopMarkers = [];

}

BDCCParallelLines.prototype = new google.maps.OverlayView();

// BDCCParallelLines implements the OverlayView interface
// Methods that need to be implemented in GMaps 3 = onAdd(), draw(), and
// onRemove()

BDCCParallelLines.prototype.onAdd = function() {
	this.setProjection();
	var foo = this;
	var zoomRecalc = function() {
		foo.onRemove();
		foo.setProjection();
	};

	this.zoomListener = google.maps.event.addListener(map, 'zoom_changed', zoomRecalc);

};

BDCCParallelLines.prototype.setProjection = function() {
	this.map = this.getMap();
	var overlay = new google.maps.OverlayView();
	overlay.draw = function() {
	};
	overlay.setMap(map);
	this.prj = overlay.getProjection();
};

BDCCParallelLines.prototype.updateData = function(segments, routes) {
	this.segments = null;
	this.routes = null;
	this.routes = routes;
	this.segments = segments;
};

BDCCParallelLines.prototype.setOpacity = function(opacities) {
	console.log("Buster setOpacity");
	console.log(this.polylines.length);
	for (var routeId in this.polylines) {
		console.log(routeId, opacities[routeId]);
		var opt = {strokeOpacity: opacities[routeId]};
		this.polylines[routeId].setOptions(opt);
	}
};

BDCCParallelLines.prototype.highlight = function(route) {
	console.log("Buster highlight");
	console.log(this.polylines.length);
	for ( var routeId in this.polylines) {
		var opt = (route == -1 || route == routeId) ? {
			strokeOpacity : 0.8
		} : {
			strokeOpacity : 0.2
		};
		this.polylines[routeId].setOptions(opt);
	}
};

// TODO debug
BDCCParallelLines.prototype.highlightDebug = function(route, panel) {
	for ( var routeId in this.polylines) {
		var opt = (route == -1 || route == routeId) ? {
			strokeOpacity : 0.8
		} : {
			strokeOpacity : 0.2
		};
		this.polylines[routeId].setOptions(opt);
	}
	if (route > 0) {
		var path = this.polylines[route].getPath();
		var result = "";
		panel.val(result);
		for ( var i = 0; i < path.getLength(); i++) {
			var pos = path.getAt(i);
			result += "{lat:" + pos.lat() + ",lon:" + pos.lng() + "},";
			//result += "{" + pos+ "},\n";
		}
		var stopStart = this.routes[route].stop_sequence;
		panel.val("Sequence: "+stopStart+"\ntot: "+path.getLength()+"\nrouteId:"+route+"\n\n\n["+result+"]");
	}
};

BDCCParallelLines.prototype.onRemove = function() {
	for ( var routeId in this.polylines) {
		this.polylines[routeId].setMap(null);
		this.polylines[routeId] = null;
	}
	this.polylines = null;
	this.polylines = new Array();

	for ( var i = 0; i < this.stopMarkers.length; i++) {
		this.stopMarkers[i].setMap(null);
		this.stopMarkers[i] = null;
	}
	this.stopMarkers = null;
	this.stopMarkers = [];

	this.routeTokens = null;

	if (this.prj) {
		this.prj = null;
	}
	if (this.zoomListener != null) {
		google.maps.event.removeListener(this.zoomListener);
	}
};
BDCCParallelLines.prototype.draw = function(map) {
	for ( var routeId in this.polylines) {
		this.polylines[routeId].setMap(null);
		this.polylines[routeId] = null;
	}
	this.polylines = null;
	this.polylines = new Array();

	for ( var i = 0; i < this.stopMarkers.length; i++) {
		this.stopMarkers[i].setMap(null);
		this.stopMarkers[i] = null;
	}
	this.stopMarkers = null;
	this.stopMarkers = [];

	this.routeTokens = null;
	this.routeTokens = new Array();

	this.recalc();
	return;
};

BDCCParallelLines.prototype.redraw = function(force) {
	return; // do nothing
};

BDCCParallelLines.prototype.recalc = function() {

	var zoom = this.map.getZoom();
	var o = (this.gapPx + this.weight) / 2;

	for ( var segmentKey in this.segments) {
		//console.log("--------------------- Ciclo esterno");
		console.log("SegmentKey: " + segmentKey);
		// routes that share this segments
		var segmentRoutes = this.segments[segmentKey].routes;
		//console.log("Segmentroutes : " + segmentRoutes);

		// start and end coords of the segment
		var start = new google.maps.LatLng(this.segments[segmentKey].l1, this.segments[segmentKey].g1);
		var end = new google.maps.LatLng(this.segments[segmentKey].l2, this.segments[segmentKey].g2);

		var segmentPoints = {
			t : false,
			s : start,
			e : end
		};

		if (!this.routeTokens[segmentRoutes[0][0]] || this.routeTokens[segmentRoutes[0][0]] == undefined) {
			//this is AWFUL
			this.routeTokens[segmentRoutes[0][0]] = new Array(this.routes[segmentRoutes[0][0]].path.length-1);
			console.log("route:"+segmentRoutes[0][0]+", bus:"+this.routes[segmentRoutes[0][0]].route_short_name+",length:"+this.routes[segmentRoutes[0][0]].path.length);
		}
		
		this.routeTokens[segmentRoutes[0][0]].splice(segmentRoutes[0][1], 1, segmentPoints);
		for ( var k = 1; k < segmentRoutes.length; k++) {
			//console.log("++++++++++++++++++++Ciclo interno");
			console.log("Route shot name: " + this.routes[segmentRoutes[k][0]].route_short_name);
			var pts1 = {
				t : true
			};// left side of center
			var p2l; // left
			//console.log("Segmentpoints " + segmentPoints);
			var p1lm1;
			var p2lm1;
			var thetam1;
			var p1 = this.prj.fromLatLngToContainerPixel(segmentPoints.s);
			var p2 = this.prj.fromLatLngToContainerPixel(segmentPoints.e);
			//console.log("p1:" + p1 + ",p2:" + p2);
			var theta = Math.atan2(p1.x - p2.x, p1.y - p2.y) + (Math.PI / 2);
			var dl = Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y)));
			if (theta > Math.PI)
				theta -= Math.PI * 2;
			var dx = Math.round(o * Math.sin(theta));
			var dy = Math.round(o * Math.cos(theta));
			var p1l = new google.maps.Point(p1.x + dx, p1.y + dy);
			p2l = new google.maps.Point(p2.x + dx, p2.y + dy);

			pts1.s = this.prj.fromContainerPixelToLatLng(p1l);

			p1lm1 = p1l;
			p2lm1 = p2l;
			thetam1 = theta;

			pts1.e = this.prj.fromContainerPixelToLatLng(p2l);// final	
			// point
			if (!this.routeTokens[segmentRoutes[k][0]] || this.routeTokens[segmentRoutes[k][0]] == undefined) {
				//this is AWFUL too
				this.routeTokens[segmentRoutes[k][0]] = new Array(this.routes[segmentRoutes[k][0]].path.length-1);
				console.log("route:"+segmentRoutes[k][0]+", bus:"+this.routes[segmentRoutes[k][0]].route_short_name+",length:"+this.routes[segmentRoutes[k][0]].path.length);
			}
			
			this.routeTokens[segmentRoutes[k][0]].splice(segmentRoutes[k][1], 1, pts1);
			segmentPoints = pts1;
		}
		// }
	}
	
	//console.log(this.routeTokens);

	for ( var routeId in this.routes) {
		
		// get the segments of the route
		var routePoints = this.routeTokens[routeId];

		var path = [];
		/* console.log("rp ");
		for (rp in routePoints){
			console.log(rp);
			console.log(routePoints[rp]);
		} */
		if (routePoints != undefined) {
			console.log("Creating path for routename: " + routeId+", bus:"+this.routes[routeId].route_short_name+", length:"+routePoints.length);
			console.log("RPS"+routePoints);
			var os = new google.maps.LatLng(0, 0);
			var oe = new google.maps.LatLng(0, 0);
			var ot = false;
			for ( var z = 0; z < routePoints.length; z++) {
				console.log("RP"+routePoints[z]);
				var c = (!ot && !routePoints[z].t || !ot && routePoints[z].t) ? routePoints[z].s : oe;

				path.push(c);
				// path.push(routePoints[z][1]);
				var size = (this.gapPx + this.weight) / 2;
				size = 20;
				var m;
				if (z == 0) {
					m = this.createCircle(c, size, "#00ff00", this.routes[routeId], true, z);
					
				} else {
					m = this.createCircle(c, size, "#00ff00", this.routes[routeId], false, z);
				}
				
				this.stopMarkers.push(m);
				
				os = routePoints[z].s;
				oe = routePoints[z].e;
				ot = routePoints[z].t;
			}

			path.push(routePoints[routePoints.length - 1].e);
			
			var poly = new google.maps.Polyline({
				path : path,
				map : this.map,
				strokeColor : this.routes[routeId].color,
				strokeOpacity : 1,
				strokeWeight : this.weight
			});
			this.polylines[routeId] = poly;
			
			var m = this.createCircle(routePoints[routePoints.length - 1].e, size, "#ff0000", this.routes[routeId], false, z);
			this.stopMarkers.push(m);
		}

	}

};

BDCCParallelLines.prototype.intersect = function(p0, p1, p2, p3) {
	// this function computes the intersection of the sent lines p0-p1 and p2-p3
	// and returns the intersection point,

	var a1, b1, c1, // constants of linear equations
	a2, b2, c2, det_inv, // the inverse of the determinant of the coefficient
	// matrix
	m1, m2; // the slopes of each line

	var x0 = p0.x;
	var y0 = p0.y;
	var x1 = p1.x;
	var y1 = p1.y;
	var x2 = p2.x;
	var y2 = p2.y;
	var x3 = p3.x;
	var y3 = p3.y;

	// compute slopes, note the cludge for infinity, however, this will
	// be close enough

	if ((x1 - x0) != 0)
		m1 = (y1 - y0) / (x1 - x0);
	else
		m1 = 1e+10; // close enough to infinity

	if ((x3 - x2) != 0)
		m2 = (y3 - y2) / (x3 - x2);
	else
		m2 = 1e+10; // close enough to infinity

	// compute constants

	a1 = m1;
	a2 = m2;

	b1 = -1;
	b2 = -1;

	c1 = (y0 - m1 * x0);
	c2 = (y2 - m2 * x2);

	// compute the inverse of the determinate

	det_inv = 1 / (a1 * b2 - a2 * b1);

	// use Kramers rule to compute xi and yi

	var xi = ((b1 * c2 - b2 * c1) * det_inv);
	var yi = ((a2 * c1 - a1 * c2) * det_inv);

	return new google.maps.Point(Math.round(xi), Math.round(yi));

};

BDCCParallelLines.prototype.createCircle = function(c, size, color, data, isStart, index) {
	var zerozero = this.prj.fromDivPixelToLatLng(new google.maps.Point(0, 0));
	var zerotre = this.prj.fromDivPixelToLatLng(new google.maps.Point(0, 3));
	
	var offset = Math.abs(zerotre.lat() - zerozero.lat());
	
	var point = new google.maps.LatLng(c.lat() - offset, c.lng());
	
//	var pixel = this.prj.fromLatLngToContainerPixel(c);
//	pixel.y = pixel.y + 3;
//	var point = this.prj.fromDivPixelToLatLng(pixel);
	var m = new google.maps.Marker({
		position : point,
		map : this.map,
		icon: "images/stop.png",
		zIndex : 200
	});
	if (!isStart) {
		google.maps.event.addListener(m, 'click', function(event) {
			showWait();
			emptyIntermediateInfo();
			console.log(data.route_short_name, data.color);
			console.log(data.trip_id);
			console.log(data.stop_sequence);
			console.log(index);
			console.log(data.path[index]);
			var seq = parseInt(data.stop_sequence) + parseInt(index);
			$.ajax( {
				type : 'GET',
				url : 'data/getStopData.php?trip_id=' + data.trip_id + '&stop_sequence=' + seq,
				dataType : 'json',
				success : function(out) {
					console.log(out);
					showIntermediateInfo(out);
					hideWait();
				},
				error : function(xhr, type) {
					alert("Errore ajax " + type);
					hideWait();
				}
			});
		});
	}
	return m;
};