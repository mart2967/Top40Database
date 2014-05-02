/**
 * Created by mart2967 on 4/11/14.
 */
var Song = require('../schemas').Song;

exports.search = function(req, res){
    //console.log(req);
    var query = req.query.term;
    console.log(query);
    var result = runSearch(query, function(result){
        res.send(result);
    });
}


var runSearch = function(input, callback){
    var flags = 'i';
    input = regexEscape(input);
    var regex = new RegExp(input, flags);
    console.log(regex);
    var tenYears = new Date();
    tenYears.setTime(tenYears.valueOf() - 10 * 365 * 24 * 60 * 60 * 1000);
    Song.find( { $or:[ { artist: regex }, { title: regex } ], 'weeksAndRanks.week': {$gt: tenYears} }, {/* FIELDS, all */}, { limit: 12 }, function(error, result) {
        //console.log(result);
        callback(result);
    } );
}

var regexEscape = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}