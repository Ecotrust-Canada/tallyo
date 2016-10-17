"use strict";

var http = require('http');
var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var app = express();
var TraceabilityProvider = require('./lib/traceability_provider');
var configpath = './public/js/configs/'+(process.argv[2] || 'app_config');
var config = require(configpath+"_local");

app.use(cookieParser());

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public' )));

app.get('/config', function(req, res, next){
  fs.readFile(configpath + '_local.js', function(err, localdata){
    if (err){
      throw err;
    }
    fs.readFile(configpath + '.js', function(err, data){
      if (err){
        throw err;
      }
      res.send(localdata + data);
    });
  });
});

app.get('/server_time', function(req, res, next) {
 res.status(200).send({
   timestamp: new Date(),
   timezone: -(new Date().getTimezoneOffset())
 });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send('error', {
    message: err.message,
    error: {}
  });
});

//console.log(process.argv);
module.exports = app;

app.listen(config.port);
console.log('Server running on port', config.port);
TraceabilityProvider.start(); // WIP
