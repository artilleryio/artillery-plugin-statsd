'use strict';

var Lynx = require('lynx');
var l = require('lodash');
var debug = require('debug')('plugins:statsd');

module.exports = StatsDPlugin;

function StatsDPlugin(config, ee) {
  var self = this;
  self._report = [];

  debug('StatsD Configuration: '+JSON.stringify(config.plugins.statsd));

  var host = config.plugins.statsd.host || 'localhost';
  var port = config.plugins.statsd.port || 8125;
  var globalPrefix = config.plugins.statsd.prefix || 'artillery';
  var closingTimeout = config.plugins.statsd.timeout || 0;
  var defaultValue = config.plugins.statsd.default || 0;
  var skipList = ['timestamp', 'latencies']; //always skip these
  // Add any values passed in by the user
  if (l.isString(config.plugins.statsd.skipList)){
    skipList = skipList.concat(config.plugins.statsd.skipList.split(','));
  }
  // This is used for testing the plugin interface
  var enableUselessReporting = config.plugins.statsd.enableUselessReporting;

  var metrics = new Lynx(host, port);

  ee.on('stats', function(statsObject) {
    var stats = statsObject.report()
    debug('Stats Report from Artillery: '+JSON.stringify(stats));

    if (enableUselessReporting) {
      self._report.push({ timestamp: stats.timestamp, value: 'test' });
    }

    // Kick off gauging function using the globalPrefix
    gaugeStats(globalPrefix, stats);

    // Parses the stats object and sub objects to gauge stats
    function gaugeStats(name, value){
      // Skip logic
      if(l.contains(skipList, name.replace(globalPrefix+'.', ''))){
        debug(name+' skipped');
        return;
      }

      // Recursively loop through objects with sub values such as latency/errors
      if(l.size(value) > 0){
        l.each(value, function(subValue, subName) {
          gaugeStats(name+'.'+subName, subValue);
        });
      }
      // Hey, it is an actual stat!
      else if(l.isFinite(value)){
        metrics.gauge(name, value);
      }
      // Artillery is sending null or NaN.
      else if(l.isNaN(value) || l.isNull(value)){
        metrics.gauge(name, defaultValue);
      }
      // Empty object such as 'errors' when there are not actually errors
      else{
        debug(name+' has nothing to report');
        // no-op
      }
    }
  });

  ee.on('done', function(stats) {
    debug('done');
    if (closingTimeout > 0) {
      setTimeout(function () {
        metrics.close();
      }, closingTimeout);
    } else {
      metrics.close();
    }
  });

  return this;
}

StatsDPlugin.prototype.report = function report() {
  if (this._report.length === 0) {
    return null;
  } else {
    this._report.push({
      timestamp: 'aggregate',
      value: {test: 'aggregate test'}
    });
    return this._report;
  }
};
