var express = require('express');
var Sonos   = require('sonos').Sonos;
var request = require('request');
var sonos   = require('../lib/sonos');

sonos.searchNetwork();

var router = express.Router();

router.get('/', function(req, res, next) {
  return res.json(sonos.all());
});

router.post('/pause', function(req, res, next) {
  sonos.pauseAll().then(function() {
    return res.end();
  });
});

router.post('/stop', function(req, res, next) {
  sonos.stopAll().then(function() {
    return res.end();
  });
});

router.post('/resume', function(req, res, next) {
  sonos.resumeAll().then(function() {
    return res.end();
  });
});

router.get('/:id', function(req, res, next) {
  var deviceInfo = sonos.byId(req.params.id);
  if (!deviceInfo) {
    return res.status(404).json({ error: 'No device found for id ' + req.params.id });
  }

  return res.json(deviceInfo);
});

router.get('/:id/current_track', function(req, res, next) {
  var device = sonos.nativeById(req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'No device found for id ' + req.params.id });
  }

  device.currentTrack(function(err, trackInfo) {
    if (err) {
      console.log(err);

      return res.status(500).json({ error: 'Internal error' });
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
