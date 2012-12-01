var Config = {};
Config.world = {
	rectFill: '0-#9bb7cb-#adc8da'
};

Raphael(10, 10, 1000, 400, function () {
	var r = this;
	r.rect(0, 0, 1000, 400, 10).attr({
		stroke: "none",
		fill: Config.world.rectFill
	});
	var over = function () {
		this.c = this.c || this.attr("fill");
		this.stop().animate({fill: "#bacabd"}, 500);
	},
		out = function () {
			this.stop().animate({fill: this.c}, 500);
		};
	r.setStart();
	var hue = Math.random();
	for (var country in worldmap.shapes) {
		// var c = Raphael.hsb(Math.random(), .5, .75);
		// var c = Raphael.hsb(.11, .5, Math.random() * .25 - .25 + .75);
		r.path(worldmap.shapes[country]).attr({stroke: "#ccc6ae", fill: "#f0efeb", "stroke-opacity": 0.25});
	}
	var world = r.setFinish();
	world.hover(over, out);
	// world.animate({fill: "#666", stroke: "#666"}, 2000);
	world.getXY = function (lat, lon) {
		return {
			cx: lon * 2.6938 + 465.4,
			cy: lat * -2.6938 + 227.066
		};
	};
	world.getLatLon = function (x, y) {
		return {
			lat: (y - 227.066) / -2.6938,
			lon: (x - 465.4) / 2.6938
		};
	};
	var latlonrg = /(\d+(?:\.\d+)?)[\xb0\s]?\s*(?:(\d+(?:\.\d+)?)['\u2019\u2032\s])?\s*(?:(\d+(?:\.\d+)?)["\u201d\u2033\s])?\s*([SNEW])?/i;
	world.parseLatLon = function (latlon) {
		var m = String(latlon).split(latlonrg),
			lat = m && +m[1] + (m[2] || 0) / 60 + (m[3] || 0) / 3600;
		if (m[4].toUpperCase() == "S") {
			lat = -lat;
		}
		var lon = m && +m[6] + (m[7] || 0) / 60 + (m[8] || 0) / 3600;
		if (m[9].toUpperCase() == "W") {
			lon = -lon;
		}
		return this.getXY(lat, lon);
	};

	var setLocation = function(latitude, longitude) {
		r.circle().attr({fill: "none", stroke: "#f00", r: 5}).attr(world.getXY(latitude, longitude));
	};

	if (typeof require == 'function') {
		require(['$api/location'], function($location) {
			var geoPosition = $location.Location.query();
			geoPosition.load(['latitude', 'longitude']).done(function(geoPosition) {
				setLocation(geoPosition.latitude, geoPosition.longitude);
			});
		});
	} else {
		setLocation(52.37, 4.89);
	}
});