var App = function(models) {
    var self = this;
    this.pinTemplate = $('.template-pin').html();
    
    if (typeof models === 'object') {
        this.models = models;

        var listenPlay = function() {
            var uri = models.player.track.uri;
            if (typeof self.mapping === 'undefined' || typeof self.mapping[uri] === 'undefined') {
                return true;
            }

            var location = self.mapping[uri];
            var search = new Search();
            search.photos(location.name, function(source) {
                $('.wrapper .background').css('background-image', 'url(' + source + ')');
            });
        };

        // Keep track of current song
        this.models.player.addEventListener('change', listenPlay);
    }

    // Dom events
    this.bindDomEvents();
};

App.prototype.bindDomEvents = function() {
    var tracking = false;
    self = this;

    // World

    // Pin
    $(document).on('mouseover', '.pin-over', function(event) {
        $('.pin-over-big').removeClass('pin-over-big').addClass('pin-over');

        $(this).addClass('pin-over-big');
    });

    $(document).on('mouseout', '.pin-over-big', function(event) {
        $(this).removeClass('pin-over-big').addClass('pin-over');
    });

    $(document).on('click', '.pin-over-big', function(event) {
        var inner = $(this).find('> .pin-over-inner'),
            classes = inner.attr('class'),
            matches = classes.match(/opt-([0-9]+)/),
            current = parseInt(matches[1], 10),
            next = current + 1;

        if (next > 4) {
            next = 1;
        }

        inner.removeClass('opt-' + current).addClass('opt-' + next);
    });

    // Themes
    $(document).on('click', 'header nav ul li a', function () {
        $(this).toggleClass('active');
    });
};

App.prototype.themes = function() {
    var themes = [];
    $('header nav ul li a.active').each(function() {
        themes.push($(this).data('theme'));
    });
    return themes;
};

App.prototype.newLocation = function(latitude, longitude, x, y) {
    var self = this;
    var search = new Search();
    search.locationByGeo(latitude, longitude, function(location) {
        search.weatherByLocation(location, function(weather) {
            var data = {
                name: location.country,
                dance: 1,
                frequency: 4,
                mood: weather.mood
            };

            var first = $('.pin').length === 0;
            var pin = $('<div />');
            pin.addClass(first ? 'pin-green' : 'pin-orange');
            pin.css('top', y - 45);
            pin.css('left', x - 25);

            var pinOver = $('<div />');
            pinOver.addClass('pin');
            pinOver.html(self.pinTemplate);
            pinOver.data('location', data);

            $('#worldMap').append(pin);
            $('#worldMap').append(pinOver);
        });
    });
};

App.prototype.play = function() {
    var self = this;
    var locations = [];
    $('.pin').each(function() {
        var node = $(this),
            location = $(this).data('location');
        locations.push(location);
    });

    console.log(locations);
};

App.prototype.search = function(latitude, longitude, callback) {
    var self = this;

    this._search(latitude, longitude, function(data, mapping) {
        var results = [],
            mapping = {};
        for (var i in data) {
            if (data[i].tracks.length && data[i].tracks[0].foreign_id) {
                var cleanId = data[i].tracks[0].foreign_id.replace('spotify-WW', 'spotify');
                results.push(cleanId);
                mapping[cleanId] = data[i].location;
            }
        }

        var premise = self.models.Playlist.createTemporary('Travel with Music Playlist');
        premise.done(function(playlist) {
            playlist._collections();

            var tries = 0,
                total = results.length;
            for (var i in results) {
                var uri = results[i],
                    track = self.models.Track.fromURI(uri);
                
                track.load([
                    'name', 'playable'
                ]).done(function(track) {
                    if (track.playable) {
                        playlist.tracks.add(track);
                    }
                    
                    if (++tries == total) {
                        callback(playlist, mapping);
                    }
                });
            }
        });
    });
};

App.prototype._search = function(latitude, longitude, callback) {
    var self = this;

    var search = new Search();
    search.locationByGeo(latitude, longitude, function(location) {
        search.weatherByLocation(location, function(weather) {
            search.load({
                themes: self.themes(),
                locations: [
                    {
                        name: location.country,
                        dance: 0,
                        frequency: 4,
                        mood: weather.mood
                    // },
                    // {
                    //     name: 'italy',
                    //     mood: 'happy'
                    }
                ]
            }, callback);
        });
    });
};

if (typeof require !== 'undefined') {
    require(['$api/models'], function(models) {
        window.App = new App(models);
        window.App.search(52.37, 4.89, function(playlist, mapping) {
            models.player.setShuffle(true);
            models.player.playContext(playlist);

            window.App.mapping = mapping;
        });
    });
} else {
    $(document).ready(function() {
        window.App = new App();
    });
}
