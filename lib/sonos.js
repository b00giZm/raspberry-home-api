var crypto = require('crypto');
var sonos  = require('sonos');
var lodash = require('lodash');
var Q      = require('q');

var devices = {};

function deviceId(serialNumber) {
  return crypto
    .createHash('sha1')
    .update(serialNumber)
    .digest('hex')
    .substring(0, 8)
  ;
}

function transform(done) {
  done = done || lodash.noop;

  return function(dev, model) {
    var device = new sonos.Sonos(dev.host, dev.port);

    return Q
      .all([
        Q.ninvoke(device, 'getZoneInfo'),
        Q.ninvoke(device, 'getZoneAttrs'),
      ])
      .then(function(results) {
        return done(null, {
          id           : deviceId(results[0].SerialNumber),
          model        : model,
          name         : results[1].CurrentZoneName,
          serialNumber : results[0].SerialNumber,
          macAddress   : results[0].MACAddress,
          ipAddress    : results[0].IPAddress,
          port         : dev.port,
          version      : results[0].SoftwareVersion
        });
      }, function(err) {
        return done(err);
      })
    ;
  };
}

var searchNetwork = module.exports.searchNetwork = function() {
  sonos.search(transform(function(err, device) {
    if (err) {
      throw err;
    }

    devices[device.id] = device;
  }));
};

var all = module.exports.all= function() {
  return lodash
    .keys(devices)
    .map(function(key) {
      return devices[key];
    })
  ;
};

var byId = module.exports.byId = function(deviceId) {
  return devices[deviceId] || null;
};

var nativebyId = module.exports.nativebyId = function(deviceId) {
  var device = byId(deviceId);
  return device ? new sonos.Sonos(device.ipAddress, device.port) : null;
};
