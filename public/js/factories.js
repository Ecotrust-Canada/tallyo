'use strict';


angular.module('scanthisApp.factories', [])

.factory('DatabaseServices', function($http) {

  var databaseurl = globalurl;
     
  var db_service = {};

  /*creates new row in database*/
  db_service.DatabaseEntry = function(table, entry, func){
    $http.post(databaseurl + table, entry).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

  /*creates a new row in the database and returns the result*/
  db_service.DatabaseEntryReturn = function(table, entry, func){
    $http.post(databaseurl + table, entry, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      func(response);
    }, function(response){
      alert(response.statusText);
    });
  };

  /*sends a patch to the database and returns the result*/
  db_service.PatchEntry = function(table, patch, querystring, func){
    $http.patch(databaseurl + table + cleanQueryString(querystring), patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else alert("invalid object");
    }, function(response){
      alert(response.statusText);
    });
  };

  /*sends a patch to the database and returns the result calls onErr on failure*/
  db_service.PatchEntryPlusError = function(table, patch, querystring, func, onErr){
    $http.patch(databaseurl + table + cleanQueryString(querystring), patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else onErr();
    }, function(response){
      alert(response.statusText);
    });
  };

  db_service.PatchEntryNoAlert = function(table, patch, querystring, func){
    $http.patch(databaseurl + table + cleanQueryString(querystring), patch, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      if (response.data.length >0){
        func(response);
      }
    }, function(response){
      alert(response.statusText);
    });
  };

/*deletes from the database*/
  db_service.RemoveEntry = function(table, querystring, func){
    $http.delete(databaseurl + table + cleanQueryString(querystring)).then(function(response){
      func();
    }, function(response){
      alert(response.statusText);
    });
  };

/*sends a get request, alerts if nothign matching query*/
  db_service.GetEntry = function(table, func, querystring){
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.get(url).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else alert("invalid object");
    }, function(response){
      alert(response.status);
    });
  };

/*sends a get request, calls onErr if nothign matching query*/
  db_service.GetEntryPlusError = function(table, func, querystring, onErr){
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.get(url).then(function(response){
      if (response.data.length >0){
        func(response);
      }
      else onErr();
    }, function(response){
      alert(response.status);
    });
  };

  db_service.GetEntryNoAlert = function(table, func, querystring){
    var url = databaseurl + table + cleanQueryString(querystring);
    $http.get(url).then(function(response){
      if (response.data.length >0){
        func(response);
      }
    }, function(response){
      alert(response.status);
    });
  };

/*sends a get request with or without a query*/
  db_service.GetEntries = function(table, func, querystring){
    var url;
    if (querystring){
      url = databaseurl + table + cleanQueryString(querystring);
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


  return db_service;
})


;
