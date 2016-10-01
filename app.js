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
var station_config = require(configpath).kanban_settings;
var database_json = require('./database.json');
var async = require("async");
var bodyParser = require('body-parser');

var the_db;
if (config.db){
  the_db = database_json[config.db];
}
else{
  the_db = database_json.env;
}

app.use(cookieParser());
app.use(bodyParser.json());

var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://tuna_processor:salmon@" + the_db.host + ":5432/" + the_db.database);



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

var make_totals_query = function(lot_number, station_code, type){
  var query;
  if (type === 'scan'){
    query = "SELECT lot_number,station_code,sum(weight_1) AS weight_1,grade,species,state,sum(pieces) AS pieces FROM scan WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "'GROUP BY lot_number, station_code, grade, species, state";
  }
  else if (type === 'loin_grade'){
    query = "SELECT lot_number,station_code, sum(weight_1) AS weight_1, grade, count(loin_number) AS pieces FROM loin WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code, grade";
  }
  else if (type === 'loin'){
    query = "SELECT lot_number,station_code, sum(weight_1) AS weight_1, grade, state, count(loin_number) AS pieces FROM loin WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code, grade, state";
  }
  else if (type === 'box_grade_size'){
    query = "SELECT lot_number, station_code, sum(weight) AS weight_1, grade, size, sum(pieces) AS pieces, count(box_number) AS boxes FROM box WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code, grade, size";
  }
  return query;
};

var make_summary_query = function(lot_number, station_code, type){
  var query;
  if (type === 'scan'){
    query = "SELECT lot_number, station_code, sum(pieces) AS pieces, sum(weight_1) AS weight_1 FROM scan WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' AND weight_1 IS NOT NULL GROUP BY lot_number, station_code";
  }
  else if (type === 'loin_grade' || type === 'loin'){
    query = "SELECT lot_number, station_code, count(loin_number) AS pieces, sum(weight_1) AS weight_1 FROM loin WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code;";
  }
  else if (type === 'box_grade_size'){
    query = "select lot_number, station_code, sum(pieces) AS pieces, sum(weight) AS weight_1, count(box_number) AS boxes FROM box WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code";
  }
  return query;
};

var send_the_totals_query = function(item, callback, req, res, results_array){
  var query = make_totals_query(req.body.lot_number, item.stn, item.type);
  db.any(query)
      .then(function (data) {
          // success;
          for (var key in data){
            results_array.push(data[key]);
          }
          callback(null, data);
      })
      .catch(function (error) {
          // error;
      });
};

var send_the_summary_query = function(item, callback, req, res, results_array){
  var query = make_summary_query(req.body.lot_number, item.stn, item.type);
  db.any(query)
      .then(function (data) {
          // success;
          for (var key in data){
            results_array.push(data[key]);
          }
          callback(null, data);
      })
      .catch(function (error) {
          // error;
      });
};



app.post('/lot_totals', function(req, res, next){
  var results_array = [];
  async.eachSeries(station_config, function iteratee(item, callback) {
    send_the_totals_query(item, callback, req, res, results_array);
  }, function done() {
    res.send(results_array);
  });

});

app.post('/lot_summary', function(req, res, next){
  var results_array = [];
  async.eachSeries(station_config, function iteratee(item, callback) {
    send_the_summary_query(item, callback, req, res, results_array);
  }, function done() {
    res.send(results_array);
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
