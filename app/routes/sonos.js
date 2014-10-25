var express = require('express');
var Sonos = require('sonos').Sonos;
var search = require('sonos').search;

var router = express.Router();

var sonosDevices = [];
search(function(device, model) {
  console.log(device, model);
});

router.get('/', function(req, res, next) {
  return res.json({ hello: 'world' });
});

module.exports = router;