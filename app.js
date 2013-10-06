var http = require('http');
var express = require('express');

var app = express();

app.configure(function () {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});


var eventTime = require('./routes/eventsTime');

app.get('/', function(req, res, next) {
    var fs = require('fs');
	fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            // handle error
        }
        res.writeHead(200);
        // return file contents to client
        res.end(data);
    });
});

app.get('/api/findAggregate/:datestart/:dateend',eventTime.findAggregate);
app.get('/api/eventsTime/:datestart/:dateend', eventTime.findByDate);
app.get('/api/eventsType/:type/:datestart/:dateend', eventTime.findByTypeDate);
var port = process.env.PORT || 5000;
//var port = 3000;
app.listen(port);