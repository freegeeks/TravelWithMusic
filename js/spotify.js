// require(['$api/models'], function(models) {
// 	var user = models.User.fromURI('spotify:user:renan.saddam')
// 		.load()
// 		.done(function(user) {
// 			var keys = [
// 				'currentUser',
// 				'identifier',
// 				'image',
// 				'name',
// 				'uri',
// 				'username'
// 			];
// 			var parsed = {};
// 			for (var i in keys) {
// 				var key = keys[i],
// 					value = user[key];

// 				parsed[key] = value;
// 			}
// 			console.log(user);
// 			console.log(parsed);
// 		}
// 	);
// 	console.debug(user);
// });
