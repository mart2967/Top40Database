/**
 * Created by mart2967 on 4/3/14.
 */
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var dateObj = new Date();
var Song = require('./schemas').Song;
var currentYear = dateObj.getFullYear();
var startYear = 2014;
var provider = 'http://www.at40.com';


getMonthsFromYear = function(url, callback){
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var urls = new Array();
            $('#pagtable tr td a').each(function(){
                urls.push(provider + $(this).attr('href'));
            });
            //console.log("the urls: " + urls);

            callback(null, urls);
        } else {
            console.log(error);
        }
    });
}


getWeeksFromMonth = function(url, callback){
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var urls = new Array();
            $('.chartintlist2 a').each(function(){
                var week = new Object();
                week.date = $(this).text();
                week.path = provider + $(this).attr('href');
                urls.push(week);
            });
            callback(null, urls);
        } else {
            console.log(error);
        }
    });
}

getSongsFromWeek = function(week, callback, secondCallbackLOL){
    var url = week.path;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var songs = new Array();
            $('.charttableint tr').each(function(){
                var song = new Object();
                $(this).find('td').each(function(columnIndex){
                    switch(columnIndex){
                        case 0:
                            var rank = $(this).find('span.darkbluebox').text();
                            if (isNaN(rank)){
                                break;
                            }
                            if (rank != undefined){
                                song.rank = parseInt(rank);
                            }
                            break;
                        case 2:
                            var src = $(this).find('img').attr('src');
                            if(src != undefined){
                                song.imageURL = src.trim();
                            }
                            break;

                        case 3:
                            var artistSong = $(this).text().split('\n');

                            if (artistSong != undefined){
                                song.artist = artistSong[0].replace('\r', '');
                                song.title = artistSong[1].trim();
                            }
                            var artistURL = $(this).find('a.chart_song').attr('href');
                            if (artistURL != undefined){
                                song.artistURL = provider + artistURL;
                            }
                            break;
                    }

                });

                if(JSON.stringify(song)!='{}' && !isNaN(song.rank)) {
                    song.week = new Date(Date.parse(week.date)).toString();
                    songs.push(song);
                }
            });
            callback(songs, secondCallbackLOL);
        } else {
            console.log(error);
        }
    });
}

processMonths = function(urls, callback){
    async.mapSeries(urls, getWeeksFromMonth, function(error, result){
        //console.log("map getWeeksFromMonth completed. Error: ", error, " result:\n", result);
        async.eachSeries(result, processWeeks, function(error){
            if(error){
                console.log(error);
            }
            callback();
        });
    });

}

processWeeks = function(weeks, callback){
    async.eachSeries(weeks, function(week, callback){
        getSongsFromWeek(week, saveSongsToDB, callback);
        //callback();
    }, function(error){
        if(error){
            console.log(error);
        }
        callback();
    });

}

saveSongsToDB = function(songs, callback){
    async.eachSeries(songs, function(song, callback){
        Song.count({'title': song.title, 'artist': song.artist}, function(error, count){
            if(count == 0){
                var dbSong = new Song({
                    title: song.title,
                    artist: song.artist,
                    artistURL: song.artistURL,
                    imageURL: song.imageURL
                });
                dbSong.weeksAndRanks.push(new Object({week: song.week, rank: song.rank}));
                dbSong.save(function (err, item, numberAffected) {
                    console.log('new song: %s by %s', item.title, item.artist);
                    callback();
                });
            } else {
                Song.update({title: song.title, artist: song.artist}, {$push: {weeksAndRanks: {week: song.week, rank: song.rank} }}, function(err, numAffected, raw){
                    console.log('song %s by %s updated. %d affected', song.title, song.artist, numAffected);
                    callback();
                });
            }
        });
    }, function(error){
        if(error){
            console.log(error);
        }
        callback();
    });

}

exports.parseData = function(){
    var yearURLs = new Array();

    for(var year = startYear; year <= currentYear; year++){
        yearURLs.push( 'http://www.at40.com/top-40/' + year + '/00' );
    }
    async.mapSeries(yearURLs, getMonthsFromYear, function(error, result){
        console.log("map getMonthsFromYear on all years completed. Error: ", error, " result:\n", result);
        async.eachSeries(result, processMonths, function(error){
            if(error){
                console.log(error);
            }
        });
    });



}

//parseData();

//exports.collateData = function(){
//
//}