"use strict";

var ENABLE_TRACEBLE_PROVIDER = false;
var http = require('http');

class TraceabilityProvider {
  constructor() {
    this.count = 0;
  }

  // public methods
  start() {
    if (ENABLE_TRACEBLE_PROVIDER) {
      console.log('Starting TraceabilityProvider');
      this._checkEvents();
    }
  }

  // private methods
  _checkEvents() {
    var self = this;
    setTimeout(function() {
      self._fetchCompletedEvents(self._submitEvents);
      self._checkEvents();
    }, 1000);
  }

  _fetchCompletedEvents(callback) {
    this.count += 1;
    callback(null, this.count);
  }

  _submitEvents(err, events) {
    if (err)
      return;
  
    console.log("Submitting event:", events);
  }
}

module.exports = new TraceabilityProvider();
