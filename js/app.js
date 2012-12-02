var themes = [];
var App = function(models) {
    var self = this;
    
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

    $(document).on('click', 'header nav ul li a', function () {
        self.theme($(this).attr('class'));
    });
};

App.prototype.theme = function (theme) {
    var found = 0;
    for (var i in themes) {
        if (themes[i] == theme) {
            themes[i] = null;
            found = 1;
        }
    }
    if (found === 0) {
        themes.push(theme);
    }
    console.log(themes);
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
                themes: themes,
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
    var pin = $(Config.pinTemplate);
    $('.wrapper').append(pin);

    window.App = new App();
}
