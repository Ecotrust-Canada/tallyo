'use strict';

/**
 * Defines what to when the database API call returns an error.
 */

/**
 * Wraps a callback function with a non-zero length check. Alert in the case of a zero lenght argument is passed.
 */
var nonzeroLengthCheck = function(cb, onErr) {
  return function(response) {
    if (response.data.length > 0) {
      cb(response);
    } else {
      (onErr || alert)('empty response.');
    }
  }
}
, patchHeaders = {headers: {'Prefer': 'return=representation'}};

var ForceUpper = function(entry){
  for (var key in entry){
    if (key === 'case_number' || key === 'internal_lot_code' || key === 'ft_fa_code' || key === 'size' || 
        key === 'received_from' || key =='grade'){
        if (entry[key]) entry[key] = entry[key].toUpperCase();
    }    
  }
  return entry;
};

var limitHeaders = {};
limitHeaders.fifty = {headers: {'Range-Unit': 'items', 'range': '0-49'}};
limitHeaders.hundred = {headers: {'Range-Unit': 'items', 'range': '0-99'}};
limitHeaders.twenty = {headers: {'Range-Unit': 'items', 'range': '0-19'}};

angular.module('scanthisApp.factories', [])

.factory('DatabaseServices', function($http, toastr) {

  var databaseurl = globalurl;

  var db_service = {};
  /**
   * Creates new row in database
   */
  db_service.DatabaseEntry = function(table, entry, func, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table;
    $http.post(url, ForceUpper(entry)).then(func, on_error);
  };

  /**
   * Creates a new row in the database and returns the result.
   */
  db_service.DatabaseEntryReturn = function(table, entry, func, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table;
    $http.post(url, ForceUpper(entry), patchHeaders).then(func, on_error);
  };

  /**
   * Sends a patch to the database and returns the result.
   */
  db_service.PatchEntry = function(table, patch, querystring, func, onErr, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.patch(url, ForceUpper(patch), patchHeaders).then(nonzeroLengthCheck(func, onErr), on_error);
  };

  /**
   * Deletes a record from the database.
   */
  db_service.RemoveEntry = function(table, querystring, func, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.delete(url).then(func, on_error);
  };

  /**
   * Fetch a DB record
   * @param onErr - called if nothing matching query
   */
  db_service.GetEntry = function(table, func, querystring, onErr, range, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table + cleanQueryString(querystring);
    if (range){
      $http.get(url, limitHeaders[range]).then(nonzeroLengthCheck(func, onErr), on_error);
    }else{
      $http.get(url).then(nonzeroLengthCheck(func, onErr), on_error);
    }    
  };
  
  /**
   * Get a record from the DB, quietly.
   */
  db_service.GetEntryNoAlert = function(table, func, querystring, range, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table + cleanQueryString(querystring);
    
    if (range){
      $http.get(url, limitHeaders[range]).then(func, on_error);
    }else{
      $http.get(url).then(func, on_error);
    }  
  };

  /**
   * Fetch multiple records from the DB.
   */
  db_service.GetEntries = function(table, func, querystring, range, err_func){
    var on_error = err_func || handleDbError;
    var url;
    if (querystring){
      url = databaseurl + table + cleanQueryString(querystring);
    } 
    else {
      url = databaseurl + table;
    }
    if (range){
      $http.get(url, limitHeaders[range]).then(func, on_error);
    }else{
      $http.get(url).then(func, on_error);
    }  
  };

  var CreateCode = function(table, processor_code, func, onErr, err_func){
    var on_error = err_func || handleDbError;
    return function(response){
      var table_info = tableInfo(table);
      var id = response.data.serial_id;
      var querystring = '?serial_id=eq.' + id;
      var url = databaseurl + table + cleanQueryString(querystring);
      var id36 = (parseInt(id)).toString(36).toUpperCase();
      var newid = table_info.letter + '-' + processor_code + '-' + padz(id36, 4);
      var patch = {};
      patch[table_info.field] = newid;
      $http.patch(url, patch, patchHeaders).then(nonzeroLengthCheck(func, onErr), on_error);
    };
  };

  var handleDbError = function(response) {
    console.log(response);
    toastr.error('Error: ' + (response.statusText || 'no Database Connection'));
  };

  db_service.DatabaseEntryCreateCode = function(table, entry, processor_code, func, err_func){
    var on_error = err_func || handleDbError;
    var url = databaseurl + table;
    if (isInArray(table, ['box', 'lot', 'loin', 'shipping_unit', 'harvester', 'supplier'])){
      $http.post(url, ForceUpper(entry), patchHeaders).then(CreateCode(table, processor_code, func), on_error);
    }
    else{
      $http.post(url, ForceUpper(entry), patchHeaders).then(func, on_error);
    }
  };

  


  return db_service;
});
