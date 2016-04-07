'use strict';

/**
 * Defines what to when the database API call returns an error.
 */
var handleDbError = function(response) {
  console.log(response);
  alert(response.statusText);
}
/**
 * Wraps a callback function with a non-zero length check. Alert in the case of a zero lenght argument is passed.
 */
, nonzeroLengthCheck = function(cb, onErr) {
  return function(response) {
    if (response.data.length > 0) {
      cb(response);
    } else {
      (onErr || alert)('empty response.');
    }
  }
}
, patchHeaders = {headers: {'Prefer': 'return=representation'}};

var limitHeaders = {};
limitHeaders.fifty = {headers: {'range': '0-49'}};
limitHeaders.hundred = {headers: {'range': '0-99'}};

angular.module('scanthisApp.factories', [])

.factory('DatabaseServices', function($http) {

  var databaseurl = globalurl;

  var db_service = {};
  /**
   * Creates new row in database
   */
  db_service.DatabaseEntry = function(table, entry, func){
    var url = databaseurl + table;
    $http.post(url, entry).then(func, handleDbError);
  };

  /**
   * Creates a new row in the database and returns the result.
   */
  db_service.DatabaseEntryReturn = function(table, entry, func){
    var url = databaseurl + table;
    $http.post(url, entry, patchHeaders).then(func, handleDbError);
  };

  /**
   * Sends a patch to the database and returns the result.
   */
  db_service.PatchEntry = function(table, patch, querystring, func, onErr){
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.patch(url, patch, patchHeaders).then(nonzeroLengthCheck(func, onErr), handleDbError);
  };

  /**
   * Deletes a record from the database.
   */
  db_service.RemoveEntry = function(table, querystring, func){
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.delete(url).then(func, handleDbError);
  };

  /**
   * Fetch a DB record
   * @param onErr - called if nothing matching query
   */
  db_service.GetEntry = function(table, func, querystring, onErr, range){
    var url = databaseurl + table + cleanQueryString(querystring);
    if (range){
      $http.get(url, limitHeaders[range]).then(nonzeroLengthCheck(func, onErr), handleDbError);
    }else{
      $http.get(url).then(nonzeroLengthCheck(func, onErr), handleDbError);
    }    
  };
  
  /**
   * Get a record from the DB, quietly.
   */
  db_service.GetEntryNoAlert = function(table, func, querystring, range){
    var url = databaseurl + table + cleanQueryString(querystring);
    
    if (range){
      $http.get(url, limitHeaders[range]).then(func, handleDbError);
    }else{
      $http.get(url).then(func, handleDbError);
    }  
  };

  /**
   * Fetch multiple records from the DB.
   */
  db_service.GetEntries = function(table, func, querystring, range){
    var url;
    if (querystring){
      url = databaseurl + table + cleanQueryString(querystring);
    } 
    else {
      url = databaseurl + table;
    }
    if (range){
      $http.get(url, limitHeaders[range]).then(func, handleDbError);
    }else{
      $http.get(url).then(func, handleDbError);
    }  
  };

  var CreateCode = function(table, processor_code, func, onErr){
    return function(response){
      var table_info = tableInfo(table);
      var id = response.data.serial_id;
      var querystring = '?serial_id=eq.' + id;
      var url = databaseurl + table + cleanQueryString(querystring);
      var id36 = (parseInt(id)).toString(36).toUpperCase();
      var newid = table_info.letter + '-' + processor_code + '-' + padz(id36, 4);
      var patch = {};
      patch[table_info.field] = newid;
      $http.patch(url, patch, patchHeaders).then(nonzeroLengthCheck(func), handleDbError);
    };
  };

  db_service.DatabaseEntryCreateCode = function(table, entry, processor_code, func){
    var url = databaseurl + table;
    if (isInArray(table, ['box', 'lot', 'loin', 'shipping_unit', 'harvester'])){
      $http.post(url, entry, patchHeaders).then(CreateCode(table, processor_code, func), handleDbError);
    }
    else{
      $http.post(url, entry, patchHeaders).then(func, handleDbError);
    }
  };


  return db_service;
});
