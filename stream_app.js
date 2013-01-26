var express = require('express'),
    app = express(),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    Converter = require('./lib/converter'),
    Track = require('./lib/track')
    ;

app.configure(function () {
    app.use(express.methodOverride());
    app.use(express.logger({
        'format':':date :method :url :status - :response-time ms'
    }))
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler())
});

app.get('/stream/:track_id', function (request, response) {
    var track = Track.create({id:request.params['track_id']}),
        converter = Converter.create();

    response.contentType('application/ogg');
    response.header('Access-Control-Allow-Origin', '*');

    track.stream(function (err, trackStream) {
        if (err) throw(err);
        trackStream.pipe(converter.process.stdin);
        converter.process.stdout.pipe(response);
    });

    request.on('close', function () {
        track.stopStream()
        converter.kill()
    })
})

app.listen(3000)
console.log(new Date, 'Canvas.fm starting')