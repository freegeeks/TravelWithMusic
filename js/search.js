var apiKey = 'FILDTEOIK2HBORODV';
var url = 'http://developer.echonest.com/api/v4/artist/reviews';
$.ajax({
	url: url,
	dataType: 'json',
	data: {
		api_key: apiKey,
		id: 'ARH6W4X1187B99274F',
		format: 'json',
		results: 1,
		start: 0
	},
	success: function(data) {
		console.debug(data);
	}
});
