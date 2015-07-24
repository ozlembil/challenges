// node solution for https://github.com/convoynow/code_challenges
// Scott Hasbrouck
// July 23, 2015

// modules
var B = require('bluebird'),
	R = require('ramda'),
	fs = B.promisifyAll(require('fs'));

var PROP_NAMES = [ 'user_id', 'full_name', 'following', 'services' ];

var inputs = process.argv.slice(2),
	user_id_input = inputs[0],
	file_name = 'social_connections.txt';

// utility functions
var sort_by_item = function(n) { return R.sortBy(R.prop(n)); },

	user_with_props = function(users, prop_name, prop_value) {
		if (!prop_value) { return null; }
		var user = R.find(R.propEq(prop_name, prop_value))(users);
		if (!user) { return null; }
		return R.find(R.propEq(prop_name, prop_value))(users);
	},

	followings_of_user_from_users = function(users) {
		return R.map(function(following_user) {
			if (!following_user) { return null; }
			return user_with_props(users, 'full_name', following_user);
		});
	},

	counted_services_from_followings = function(followings, limit) {
		var counted_services = function() {
			return R.toPairs(R.countBy(R.trim)(R.flatten(R.map(function(following) {
				if (!following || !following.services) { return [ ]; }
				return following.services;
			})(followings))));
		};

		// sort alphabetically
		var alpha_sorted = R.reverse(sort_by_item(0)(counted_services()));

		//sort by count
		var count_sorted = R.reverse(sort_by_item(1)(alpha_sorted));

		// flatten
		var flattened_sorted = R.pluck(0)(count_sorted)

		// optional limit
		if (limit) { return R.slice(0, limit, flattened_sorted) }
		else { return flattened_sorted }
	},

	proces_user_string = function(user_string) {
		user_prop_list = user_string.split(':');
		var user = R.zipObj(PROP_NAMES, user_prop_list);
		user['following'] = user['following'] && user['following'].split(',') || null;
		user['services'] = user['services'] && user['services'].split(',');
		return user;
	};

// read file
fs.readFileAsync(file_name, 'utf8').then(function(contents) {
	var user_strings = contents.split('\n');
	return R.map(proces_user_string)(user_strings);
})

// find user and get services of followings
.then(function(users) {
	if (!user_id_input) { throw new Error('no user id specified!'); }
	var user = user_with_props(users, 'user_id', user_id_input);
	if (!user) { throw new Error('no user found with that user id!'); }

	var followings = followings_of_user_from_users(users)(user.following);

	console.log(counted_services_from_followings(followings, 4));
})

//catch errors
.catch(function(err) {
	console.log('Something went wrong: ', err);
});

