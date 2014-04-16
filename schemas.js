/**
 * Created by mart2967 on 4/10/14.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SongSchema = new Schema({
    title: String,
    artist: String,
    imageURL: String,
    artistURL: String,
    week: Date,
    rank: Number
});

var SongRecordSchema = new Schema({
    title: String,
    artist: String,
    imageURL: String,
    artistURL: String,
    weeksAndRanks: [{week: Date, rank: Number}]
});

//var Song = mongoose.model('Song', SongSchema);
var Song = mongoose.model('SongRecord', SongRecordSchema);
module.exports = {
    Song: Song
};