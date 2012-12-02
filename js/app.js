var App = function(models) {
    var self = this;
    this.pinTemplate = $('.pin-template').html();
    
    if (typeof models === 'object') {
        this.models = models;

        var listenPlay = function() {
            var uri = self.models.player.track.uri;
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

    // Play
    $('.play').bind('click', function() {
        self.play();
    });

    // Pin
    $(document).on('mouseover mouseout', '.pin', function(event) {
        if (event.type === 'mouseover') {
            $(this).addClass('hover');
        } else {
            $(this).removeClass('hover');
        }
    });

    $(document).on('mouseover', '.pin-over', function(event) {
        $('.pin-over-big').removeClass('pin-over-big').addClass('pin-over');

        $(this).addClass('pin-over-big');
    });

    $(document).on('mouseout', '.pin-over-big', function(event) {
        $(this).removeClass('pin-over-big').addClass('pin-over');
    });

    $(document).on('click', '.pin-over-big', function(event) {
        var inner = $(this).find('> .pin-over-inner'),
            matchesOpt = inner.attr('class').match(/opt-([0-9]+)/),
            matchesName = inner.parent().attr('class').match(/pin-over-([a-z]+)/),
            name = matchesName[1],
            current = parseInt(matchesOpt[1], 10),
            next = current + 1;

        if (next > 4) {
            next = 1;
        }

        var newLocation = inner.parents('.pin').data('location');
        newLocation[name] = next;
        inner.parents('.pin').data('location', newLocation);

        inner.removeClass('opt-' + current).addClass('opt-' + next);
    });

    $(document).on('keydown', function(event) {
        if (event.which === 68) {
            $('.pin:not(.pin-green)').remove();
        }
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
                mood: (weather.mood == 'sad') ? 1 : 3
            };

            var first = ($('.pin').length === 0);
            var pin = $('<div />');
            pin.addClass('pin');
            if (!first) {
                pin.addClass('pin-green');
            } else {
                pin.addClass('hover');
            }
            pin.css('top', y - 30);
            pin.css('left', x - 21);
            pin.html(self.pinTemplate);
            pin.data('location', data);

            pin.find('.pin-over-mood .pin-over-inner').addClass('opt-' + data.mood);
            pin.find('.pin-over-frequency .pin-over-inner').addClass('opt-' + data.frequency);
            pin.find('.pin-over-dance .pin-over-inner').addClass('opt-' + data.dance);

            $('#worldMap').append(pin);
        });
    });
};

App.prototype.play = function() {
    var self = this;
    var locations = [];
    var mapping = [0, 0, 0.33, 0.66, 1];
    $('.pin').each(function() {
        var node = $(this),
            location = $(this).data('location');

        var other = {
            mood: (location.mood <= 2) ? 'happy' : 'sad',
            frequency: location.frequency,
            dance: mapping[location.dance],
            name: location.name
        };

        locations.push(other);
    });

    var query = {
        themes: this.themes(),
        locations: locations
    };
    console.log(query);

    this.search(query, function(playlist, mapping) {
        self.mapping = mapping;

        self.models.player.setShuffle(true);
        self.models.player.playContext(playlist);
    });
};

App.prototype.search = function(query, callback) {
    var self = this;

    var search = new Search();
    search.load(query, function(data) {
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

if (typeof require !== 'undefined') {
    require(['$api/models'], function(models) {
        var latitude = 52.37,
            longitude = 4.89,
            y = latitude * -2.6938 + 227.066,
            x = longitude * 2.6938 + 465.4;

        window.App = new App(models);
        window.App.newLocation(latitude, longitude, x, y);
    });
} else {
    $(document).ready(function() {
        window.App = new App();
    });
}
