Config.world = {
	country: {
		stroke: '#222222',
		fill: '#0a0a0a'
	}
};

Raphael('worldMap', 1000, 400, function () {
	var r = this;
	var over = function () {
		this.c = this.c || this.attr("fill");
		this.stop().animate({fill: "#555"}, 500);
	};
	var out = function () {
		this.stop().animate({fill: this.c}, 500);
	};
	r.setStart();
	var hue = Math.random();
	for (var country in worldmap.shapes) {
		r.path(worldmap.shapes[country]).attr(Config.world.country);
	}
	var world = r.setFinish();
	world.hover(over, out);
	world.click(function(event) {
        var xy = world.XY(event); 
		var x = xy.x,
			y = xy.y,
			latLon = world.getLatLon(x, y);

		window.App.newLocation(latLon.lat, latLon.lon, x, y);
	});
    world.XY = function (evt) {
      var el = evt.target,
          x = y = 0;

      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }

      x = evt.clientX - x;
      y = evt.clientY - y;

      return { x: x, y: y };
    }
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
});
