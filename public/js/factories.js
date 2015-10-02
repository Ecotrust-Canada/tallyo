'use strict';


angular.module('scanthisApp.factories', [])

.factory('DatabaseServices', function($http) {

  var databaseurl = 'http://10.10.50.30:3000/';
     
  var factory = {}; 

  factory.DatabaseEntry = function(table, entry, func){
    $http.post(databaseurl + table, entry).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };


  factory.DatabaseEntryReturn = function(table, entry, func){
    $http.post(databaseurl + table, entry, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      func(response);
    }, function(response){
      alert(response.statusText);
    });
  };

  factory.PatchEntry = function(table, patch, querystring, func){
    $http.patch(databaseurl + table + querystring, patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else alert("invalid object");
    }, function(response){
      alert(response.statusText);
    });
  };

  factory.RemoveEntry = function(table, querystring, func){
    $http.delete(databaseurl + table + querystring).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

  

  factory.GetEntriesReturn = function(table, func, querystring){
    var url = databaseurl + table + querystring;
    $http.get(url).then(function(response){
      func(response);
    }, function(response){
      alert(response.status);
    });
  };

  factory.GetEntry = function(table, func, querystring){
    var url = databaseurl + table + querystring;
    $http.get(url).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else alert("invalid object");
    }, function(response){
      alert(response.status);
    });
  };


  factory.GetEntries = function(table, func, querystring){
    var url;
    if (querystring){
      url = databaseurl + table + querystring;
    }
    else{
      url = databaseurl + table;
    }
    $http.get(url).then(function(response){
      func(response);
    }, function(response){
      alert(response.status);
    });
  };


  return factory;
});
