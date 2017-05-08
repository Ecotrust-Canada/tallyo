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
var db = pgp("postgres://" + the_db.user + ":" + the_db.password + "@" + the_db.host + ":5432/" + the_db.database);



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

// because of non-ideal database and application design this overly complicated increment function is
// required for case/box numbers
app.get('/increment', function(req, res, next){
  // only increment from box numbers that have this system's case_label
  var label = req.query.label;
  if (!label) {
      // a missing label will make the query match any non-null case_number
      label = '';
  }

  var query = "select b.case_number, b.weight, b.pieces, inc.to_increment " +
              "from box as b, increment_case as inc " +
              "where b.case_number LIKE '" + label + "%' " +
              "order by b.timestamp desc " +
              "limit 1";

  db.any(query)
      .then(function (data) {
          // remove prefix from case_number
          console.log('increment db query results: ' + JSON.stringify(data));

          // default case_number to account for empty query, and non-parsable query results - very unlikely
          var case_num = 0;

          if(data.length > 0) {
              // use the latest box number to check and prevent rogue increment_case table values which happen because of
              // unintended, multiple or arbitrary calls to /increment
              var prev_case_num = parseInt(data[0].case_number.match(/\d+$/));

              // if prev_case_num did not parse, to_increment will be used by default
              if (prev_case_num) {
                  // we want prev_case_num to take precedence so the customer is more likely to see sequential box numbers
                  case_num = prev_case_num;
              } else {
                  var incr_num = parseInt(data[0].to_increment);
                  // just a final check for final failure mode/corner case where a db integer does not parse, yeah right
                  if (incr_num) {
                      case_num = incr_num;
                  }
              }
          }

          // worst-case scenario is the db is empty or parseInt all failed so we'd be starting from 0
          var new_num;

          if (case_num < 99999) {
              new_num = case_num + 1;
          } else {
              new_num = 1;
          }

          // this must send a String or else downstream code will not see the new case number
          // e.g. res.status(200).send(new_num) will not work
          res.status(200).send(String(new_num));

          var query = 'update increment_case set to_increment = ' + new_num + ' where serial_id = 1';
          db.any(query).then(function (data) { });
      })
      .catch(function (error) {
          res.status(500).send(error);
          console.error('get /increment error: ' + error);
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
  else if (type === 'box'){
    query = "SELECT lot_number, station_code, sum(weight) AS weight_1, grade, size, sum(pieces) AS pieces, count(box_number) AS boxes FROM box WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code, grade, size";
  }
  else if (type === 'box_in'){
    query = "SELECT lot_in as lot_number, station_code, sum(weight) AS weight_1, grade, size, sum(pieces) AS pieces, count(box_number) AS boxes FROM box WHERE lot_in = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_in, station_code, grade, size";
  }
  else if (type === 'box_scanned'){
    query = "SELECT box.lot_number, scan.station_code, sum(box.weight) AS weight_1, box.grade, box.size, sum(box.pieces) AS pieces, count(box.box_number) AS boxes FROM box inner join ( SELECT scan_1.box_number, scan_1.station_code FROM scan scan_1 GROUP BY scan_1.box_number, scan_1.station_code) scan on box.box_number = scan.box_number WHERE box.lot_number = '" + lot_number + "' and scan.station_code = '" + station_code + "' GROUP BY box.lot_number, scan.station_code, box.grade, box.size";
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
  else if (type === 'box'){
    query = "select lot_number, station_code, sum(pieces) AS pieces, sum(weight) AS weight_1, count(box_number) AS boxes FROM box WHERE lot_number = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_number, station_code";
  }
  else if (type === 'box_in'){
    query = "select lot_in as lot_number, station_code, sum(pieces) AS pieces, sum(weight) AS weight_1, count(box_number) AS boxes FROM box WHERE lot_in = '" + lot_number + "' and station_code = '" + station_code + "' GROUP BY lot_in, station_code";
  }
  else if (type === 'box_scanned'){
    query = "SELECT box.lot_number, scan.station_code, sum(box.weight) AS weight_1, sum(box.pieces) AS pieces, count(box.box_number) AS boxes FROM box inner join ( SELECT scan_1.box_number, scan_1.station_code FROM scan scan_1 GROUP BY scan_1.box_number, scan_1.station_code) scan on box.box_number = scan.box_number WHERE box.lot_number = '" + lot_number + "' and scan.station_code = '" + station_code + "' GROUP BY box.lot_number, scan.station_code";
  }
  return query;
};

var make_timeframe_query = function(start_timeframe, end_timeframe, station_code, type){
  var query;
  if (type === 'scan'){
    query = "SELECT count(distinct scan.lot_number), scan.station_code, sum(pieces) AS pieces, sum(weight_1) AS weight_1 FROM scan inner join lot on scan.lot_number = lot.lot_number WHERE lot.end_date  >= '" + start_timeframe + "' and lot.start_date <= '" + end_timeframe + "' and scan.station_code = '" + station_code + "' AND scan.weight_1 IS NOT NULL GROUP BY scan.station_code";
  }
  else if (type === 'loin_grade' || type === 'loin'){
    query = "SELECT count(distinct loin.lot_number), loin.station_code, count(loin.loin_number) AS pieces, sum(weight_1) AS weight_1 FROM loin inner join lot on loin.lot_number = lot.lot_number WHERE lot.end_date  >= '" + start_timeframe + "' and lot.start_date <= '" + end_timeframe + "' and loin.station_code = '" + station_code + "' AND loin.weight_1 IS NOT NULL GROUP BY loin.station_code";
  }
  else if (type === 'box'){
    query = "SELECT count(distinct box.lot_number), box.station_code, count(box.box_number) AS boxes, sum(weight) AS weight_1 FROM box inner join lot on box.lot_number = lot.lot_number WHERE lot.end_date  >= '" + start_timeframe + "' and lot.start_date <= '" + end_timeframe + "' and box.station_code = '" + station_code + "' AND box.weight IS NOT NULL GROUP BY box.station_code";
  }
  else if (type === 'box_in'){
    query = "SELECT count(distinct box.lot_in), box.station_code, count(box.box_number) AS boxes, sum(weight) AS weight_1 FROM box inner join lot on box.lot_in = lot.lot_number WHERE lot.end_date  >= '" + start_timeframe + "' and lot.start_date <= '" + end_timeframe + "' and box.station_code = '" + station_code + "' AND box.weight IS NOT NULL GROUP BY box.station_code";
  }
  else if (type === 'box_scanned'){
    query = "SELECT count(distinct box.lot_number), scan.station_code, count(box.box_number) AS boxes, sum(weight) AS weight_1 FROM box inner join ( SELECT scan_1.box_number, scan_1.station_code FROM scan scan_1 GROUP BY scan_1.box_number, scan_1.station_code) scan on box.box_number = scan.box_number inner join lot on box.lot_number = lot.lot_number WHERE lot.end_date  >= '" + start_timeframe + "' and lot.start_date <= '" + end_timeframe + "' and scan.station_code = '" + station_code + "' AND box.weight IS NOT NULL GROUP BY scan.station_code";
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

var send_the_timeframe_query = function(item, callback, req, res, results_array){
  var query = make_timeframe_query(req.body.start_timeframe, req.body.end_timeframe, item.stn, item.type);
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

app.post('/timeframe_summary', function(req, res, next){
  var results_array = [];
  async.eachSeries(station_config, function iteratee(item, callback) {
    send_the_timeframe_query(item, callback, req, res, results_array);
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
