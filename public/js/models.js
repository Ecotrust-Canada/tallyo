"use strict";

var app = angular.module('scanthisApp.shared', []);

app.factory('getManager', ['ModelManager', function(ModelManager) {
  var _managerList = {};
  var getManager = function(Model) {
    let name = Model.name;
    if (!_managerList[name]) {
      _managerList[name] = new ModelManager(Model);
    }
    return _managerList[name];
  };
  return getManager;
}]);

app.service('ModelManager', ['$http', '$q', function($http, $q) {

  class ModelManager {
    constructor(Model) {
      this.Model = Model;
      this.url = Model.url();
    }

    _createModelsList(array) {
      var entries = [];
      var self = this;
      array.forEach(function(data) {
        var entry = new self.Model(data);
        entries.push(entry);
      });
      return entries;
    }

    all() {
      var deferred = $q.defer();
      var self = this;
      $http.get(this.url)
        .success(function(list) {
          deferred.resolve(self._createModelsList(list));
        })
        .error(function() {
          deferred.reject();
        });
      return deferred.promise;
    }

    filter(queryset) {
      var deferred = $q.defer();
      var self = this;
      $http.get(this.url + queryset) 
        .success(function(list) {
          deferred.resolve(self._createModelsList(list));
        })
        .error(function() {
          deferred.reject();
        });
      return deferred.promise;
    }
  }

  return ModelManager;
}]);

app.service('BaseModel', ['$http', '$q', 'getManager', function($http, $q, getManager) {
  class BaseModel {
    constructor(data) {
      this.setData(data);
      this.url = this.constructor.url();
    }

    setData(data) {
      angular.extend(this, data);
    }
  
    delete() {
      $http.delete(this.url + '?id=eq.' + this.id);
    }
  
    update() {
      $http.put(this.url + '?id=eq.' + this.id, this);
    }
  
    save() {
      $http.post(this.url, this);
    }

    static objects() {
      var Model = this.prototype.constructor;
      return getManager(Model);
    }

    static url() {
      throw "You need to define static url() method in your model";
    }
  }
  return BaseModel;
}]);

app.factory('Item', ['BaseModel', function(BaseModel) {
  class Item extends BaseModel {
    static url() {
      return "http://10.10.50.30:3000/item";
    }
  }

  return Item;
}]);

app.factory('Lot', ['BaseModel', function(BaseModel) {
  class Lot extends BaseModel {
    static url() {
      return "http://10.10.50.30:3000/lot";
    }
  }

  return Lot;
}]);
