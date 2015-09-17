"use strict";

var app = angular.module('scanthisApp.shared', []);


app.factory('EntryManager', ['$http', '$q', 'Entry', function($http, $q, Entry) {
  var EntryManager = {
    _pool: {},
    _url: 'http://10.10.50.30:3000/entry',

    // Private Functions
    _retrieveInstance(entryId, entryData) {
      var instance = this._pool[entryId];

      if (instance) {
        instance.setData(entryData);
      }
      else {
        instance = new Entry(entryData);
        this._pool[entryId] = instance;
      }

      return instance;
    },

    _search(entryId) {
      return this._pool[entryId];
    },

    _load(entryId, deferred) {
      var self = this;

      $http.get(self._url + '?id=eq.' + entryId)
        .success(function(entryData) {
          var entry = self._retrieveInstance(entryData.id, entryData);
          deferred.resolve(entry);
        })
        .error(function() {
          deferred.reject();
        });
    },

    // Public Functions
    getEntry(entryId) {
      var deferred = $q.defer();
      var entry = this._search(entryId);

      if (entry) {
        deferred.resolve(entry);
      }
      else {
        this._load(entryId, deferred);
      }
      return deferred.promise;
    },

    loadAllEntries() {
      var deferred = $q.defer();
      var self = this;
      $http.get(this._url)
        .success(function(entriesArray) {
          var entries = [];
          entriesArray.forEach(function(entryData) {
            var entry = self._retrieveInstance(entryData.id, entryData);
            entries.push(entry);
          });

          deferred.resolve(entries);
        })
        .error(function() {
          deferred.reject();
        });
      return deferred.promise;
    },
  };

  return EntryManager;
}]);

app.factory('Entry', ['$http', function($http) {
  class Entry {
    constructor(entryData, url) {
      this.setData(entryData);
      this.url = 'http://10.10.50.30:3000/entry?id=eq.';
    }

    setData(entryData) {
      angular.extend(this, entryData);
    }

    delete() {
      $http.delete(this.url + this.id);
    }

    update() {
      $http.put(this.url + this.id, this);
    }
  }
  return Entry;
}]);

