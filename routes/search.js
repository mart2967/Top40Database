/**
 * Created by mart2967 on 4/11/14.
 */
var Song = require('../schemas').Song;

exports.search = function(req, res){
    //console.log(req.query);
    var query = req.query.input;
    console.log(query);
    var result = runSearch(query, function(result){
        res.send(result);
    });
}


runSearch = function(input, callback){
    var flags = 'i';
    input = regexEscape(input);
    var regex = new RegExp(input, flags);
    console.log(regex);
    Song.find( { $or:[ { artist: regex }, { title: regex } ] }, function(error, result) {
        console.log(result);
        callback(result);
    } );
}

filterSongs = function(songs){

}

regexEscape = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}