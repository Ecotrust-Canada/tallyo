'use strict';

angular.module('scanthisApp.harsam_boxing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_boxing', {
    templateUrl: 'harsam_boxing/harsam_boxing.html',
  });
}])

.controller('harsamBoxingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.box_weight = 0;
  $scope.boxentry = {'ft_box_num':'','size':'', 'grade':'', 'lot_number':''};

  $scope.makebox = function(form, labels){
    for (var key in form){
      $scope.boxentry[key] = form[key]; 
    }

    /*need to set header in order to return created entry*/
    var req = {
     method: 'POST',
     url: 'http://10.10.50.30:3000/box',
     headers: {
       'Prefer': 'return=representation'
     },
     data: $scope.boxentry
    };

    $http(req).then(function(response){
      $scope.box = response.data;
    }, function(response){
    });

  };

  $scope.addLoin = function(entry_id){
    console.log(entry_id);
    async.series([
      function(callback){
        $http.get('http://10.10.50.30:3000/entry?id=eq.' + entry_id).then(function(response){
          $scope.box_weight += response.data[0].weight_1;
          console.log($scope.box_weight);
          console.log(response.data);
          callback(null, null);
        }, function(response){

        });
      },
      function(callback){
        $http.patch('http://10.10.50.30:3000/entry?id=eq.' + entry_id, {'box_id': $scope.box.id}).then(function(response){

        }, function(response){
          
        });
      }
    ],
    function(err, results){
    });

  };

  $scope.done = function(){
    $http.patch('http://10.10.50.30:3000/box?id=eq.' + $scope.box.id, {'weight': $scope.box_weight}, {headers: {
       'Prefer': 'return=representation'}
    }).then(function(response){
      console.log(response);
      $scope.box = response.data[0];
    }, function(response){
        
    });
  };

  $scope.seeData = function(){
    $http.get('http://10.10.50.30:3000/entry?box_id=eq.' + $scope.box.id).then(function(response){
        $scope.includedentries = response.data;
      }, function(response){
        
      });

  };


});//end controller
