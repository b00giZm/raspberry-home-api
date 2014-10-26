var express = require('express');
var sonos = require('../lib/sonos');

sonos.searchNetwork();

var router = express.Router();

router.get('/', function(req, res, next) {
  return res.json(sonos.all());
});

router.get('/:id', function() {
  var device = sonos.byId(req.params.id);
  if (!device) {
    return res.json(404, {
      error: 'No device found for id ' + req.params.id
    });
  }

  return res.json(device);
});

module.exports = router;