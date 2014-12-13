var express = require('express');
var Sonos   = require('sonos').Sonos;
var request = require('request');
var sonos   = require('../lib/sonos');

sonos.searchNetwork();

var router = express.Router();

router.get('/', function(req, res, next) {
  return res.json(sonos.all());
});

router.get('/:id', function(req, res, next) {
  var deviceInfo = sonos.byId(req.params.id);
  if (!deviceInfo) {
    return res.json(404, {
      error: 'No device found for id ' + req.params.id
    });
  }

  return res.json(deviceInfo);
});

router.get('/:id/current_track', function(req, res, next) {
  var deviceInfo = sonos.byId(req.params.id);
  if (!deviceInfo) {
    return res.json(404, {
      error: 'No device found for id ' + req.params.id
    });
  }

  var sonosDevice = new Sonos(deviceInfo.ipAddress, deviceInfo.port);
  sonosDevice.currentTrack(function(err, trackInfo) {
    if (err) {
      console.log(err);
      return res.json(500, {
        error: 'Internal error'
      });
    }

    return res.json(trackInfo);
  });
});

router.get('/:id/current_track/album_art.jpg', function(req, res, next) {
  var deviceInfo = sonos.byId(req.params.id);
  if (!deviceInfo) {
    return res.status(404).end();
  }

  var sonosDevice = new Sonos(deviceInfo.ipAddress, deviceInfo.port);
  sonosDevice.currentTrack(function(err, trackInfo) {
    if (err || !trackInfo || !trackInfo.albumArtURI) {
      return res.status(404).end();
    }

    var url = 'http://' + deviceInfo.ipAddress + ':' + deviceInfo.port + trackInfo.albumArtURI;

    return request(url)
      .on('response', function(response) {
        console.log(response.statusCode, response.headers);
      })
      .pipe(res)
    ;
  });
});

module.exports = router;
