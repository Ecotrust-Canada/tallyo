'use strict';


angular.module('scanthisApp.factories', [])

.factory('DatabaseServices', function($http) {

  var databaseurl = globalurl;
     
  var factory = {};

  /*creates new row in database*/
  factory.DatabaseEntry = function(table, entry, func){
    $http.post(databaseurl + table, entry).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

  /*creates a new row in the database and returns the result*/
  factory.DatabaseEntryReturn = function(table, entry, func){
    $http.post(databaseurl + table, entry, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      func(response);
    }, function(response){
      alert(response.statusText);
    });
  };

  /*sends a patch to the database and returns the result*/
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

  factory.PatchEntryNoAlert = function(table, patch, querystring, func){
    $http.patch(databaseurl + table + querystring, patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      if (response.data.length >0){
        func(response);
      }
    }, function(response){
      alert(response.statusText);
    });
  };

/*deletes from the database*/
  factory.RemoveEntry = function(table, querystring, func){
    $http.delete(databaseurl + table + querystring).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

/*sends a get request, alerts if nothign matching query*/
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

  factory.GetEntryNoAlert = function(table, func, querystring){
    var url = databaseurl + table + querystring;
    $http.get(url).then(function(response){
      if (response.data.length >0){
        func(response);
      }
    }, function(response){
      alert(response.status);
    });
  };

/*sends a get request with or without a query*/
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
