Config.echonest = {
    apiKey: 'MXNBGHMQLSOTLCNWW'
};
Config.yahoo = {
    appId: 'CktiHV70',
    temperatureUnit: 'c'
};

var Search = function() {
    // Constructor
};

Search.prototype.load = function(options, callback) {
    var artistLocation  = 'netherlands';
    var mood            = 'happy;'
    var mood_potency    = 2;
    var moods           = [ 'happy', 'angry', 'sad', 'relaxing', 'excited' ];
    var url             = 'http://developer.echonest.com/api/v4/artist/search';
    $.ajax({
        url: url,
        dataType: 'json',
        data: {
            api_key: Config.echonest.apiKey,
            artist_location: artistLocation,
            //style: ,
            // max_familiarity: ,
            // min_familiarity: ,
            // max_hotttnesss: ,
            // min_hotttnesss: ,
            mood: mood + '^' + mood_potency,
            format: 'json',
            results: 50,
            start: 0
        },
        success: function(data) {
            //console.debug(data);
            var url = 'http://developer.echonest.com/api/v4/song/search?bucket=tracks&bucket=id:spotify-WW';

            $.ajax({
                url: url,
                dataType: 'json',
                data: {
                    api_key: Config.echonest.apiKey,
                    artist_id: data.response.artists[0].id,
                    //style: ,
                    //max_danceability: ,
                    //min_danceability: ,
                    //bucket: 'id:spotify-WW',
                    //bucket: 'tracks',
                    //mood: mood + '^' + mood_potency,
                    format: 'json',
                    results: 50,
                    start: 0
                },
                success: function(data) {
                    callback(data.response.songs);
                }
            });
        }
    });
};

Search.prototype.location = function(latitude, longitude, callback) {
    var geoAPI = 'http://where.yahooapis.com/geocode?location=' + latitude + ',' + longitude + '&flags=J&gflags=R&appid=' + Config.yahoo.appId;
    $.getJSON(geoAPI, function(response) {
        var result = false;
        if (response.ResultSet.Found == 1) {
            result = response.ResultSet.Results[0];
        }
        callback(result);
    });
};

Search.prototype.weather = function(location, callback) {
    var wsql = 'select * from weather.forecast where woeid=' + location.woeid + ' and u="' + Config.yahoo.temperatureUnit  + '"',
        weatherYQL = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(wsql) + '&format=json&callback=?';

    $.getJSON(weatherYQL, function(response) {
        var result = false;
        if (response.query && response.query.count == 1) {
            result = response.query.results.channel.item.condition
        }
        callback(result);
    });
};


var search = new Search();
search.load({
    location: 'netherlands'
}, function(data) {
    console.log(data);
});

search.location(52.37, 4.89, function(location) {
    console.log(location);

    search.weather(location, function(weather) {
        console.log(weather);
    });
});
