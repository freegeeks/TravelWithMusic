Config.echonest = {
    apiKey: 'MXNBGHMQLSOTLCNWW'
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


var search = new Search();
search.load({
    location: 'netherlands'
}, function(data) {
    console.log(data);
});
