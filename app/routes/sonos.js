var express = require('express');
var Sonos = require('sonos').Sonos;

var router = express.Router();

router.get('/', function(req, res, next) {
  return res.json({ hello: 'world' });
});

module.exports = router;