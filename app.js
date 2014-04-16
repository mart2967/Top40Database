
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var parser = require('./parser');
var Song = require('./schemas').Song;
var api = require('./routes/search');

var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/KUMMdb', function(){
    Song.count(function(error, size){
        if(error){
            console.log(error);
        } else {
            console.log('database size: %d songs', size);
            if(size == 0){
                console.log('database empty, populating...');
                parser.parseData();
            }
        }
    });
});

// all environments
app.set('port', process.env.PORT || 3005);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', api.search);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
