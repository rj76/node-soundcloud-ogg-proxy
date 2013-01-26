var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    settings = require('../lib/settings.js')
    ;

var optionsForRequest = function (trackId) {
    return {
        host:'api.soundcloud.com',
        path:'/tracks/' + trackId + '/stream?client_id=' + settings.sc_client_id,
        headers:{
            'User-Agent':'node.js'
        }
    }
};

var optionsFromLocation = function (location) {
    return {
        host:location.host,
        path:location.pathname + location.search,
        headers:{
            'User-Agent':'node.js'
        }
    }
};

var Track = function (attributes) {
    this.attributes = attributes;
    this.duration = 0;
};

Track.create = function (attributes, files) {
    return new Track(attributes, files)
};

Track.prototype = {
    stream:function (fn) {
        var self = this;

        http.get(optionsForRequest(self.id()), function (res) {
            if (!res.headers.location) fn(["No stream url for track", self.id()].join(" "))

            var location = url.parse(res.headers.location)
            self.request = http.get(optionsFromLocation(location), function (res) {
                fn(null, res)
            });
        });
    },

    stopStream:function () {
        this.request && this.request.destroy()
    },

    id:function () {
        return this.attributes.id
    },

    title:function () {
        return this.attributes.title
    },

    artistName:function () {
        return this.attributes.artistName || this.attributes.artist_name
    },

    asJSON:function () {
        return {
            id:this.id(),
            title:this.title(),
            artistName:this.artistName()
        }
    }
}

module.exports = Track
