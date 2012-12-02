var App = function(models) {
    this.models = models;
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
                themes: [ ],
                locations: [
                    {
                        name: location.country,
                        dance: 0,
                        frequency: 4,
                        mood: 'happy'
                    },
                    {
                        name: 'italy',
                        mood: 'happy'
                    }
                ]
            }, callback);
        });
    });
};

require(['$api/models'], function(models) {
    window.App = new App(models);
    window.App.search(52.37, 4.89, function(playlist, mapping) {
        models.player.setShuffle(true);
        models.player.playContext(playlist);

        console.log(mapping);
    });
});
