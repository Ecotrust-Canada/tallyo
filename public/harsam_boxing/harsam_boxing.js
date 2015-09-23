'use strict';

angular.module('scanthisApp.harsam_boxing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_boxing', {
    templateUrl: 'harsam_boxing/harsam_boxing.html',
  });
}])

.controller('harsamBoxingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.boxentry = {'ft_box_num':'','size':'', 'grade':'', 'lot_number':''};
  $scope.includedentries = [];

  $scope.makebox = function(form, labels){
    for (var key in form){
      $scope.boxentry[key] = form[key]; 
    }
    $scope.boxentry.packing_date = moment(new Date()).format();
    $scope.boxentry.best_before_date = moment(new Date()).add(2, 'years').format();
    /*need to set header in order to return created entry*/
    $http.post('http://10.10.50.30:3000/box', $scope.boxentry, {headers: {'Prefer': 'return=representation'}}
       ).then(function(response){
      $scope.box = response.data;
      $scope.box_weight = 0;
      $scope.includedentries = [];
      $scope.form = null;
    }, function(response){
    });
  };

  $scope.addLoin = function(entry_id){
    if (idNotInArray($scope.includedentries, entry_id)){
      async.series([
        function(callback){
          $http.get('http://10.10.50.30:3000/entry?id=eq.' + entry_id).then(function(response){
            $scope.box_weight += response.data[0].weight_1;
            $scope.latest_lot_number = response.data[0].lot_number;/*for now just set box lot_number to most recent loin*/
            callback(null, null);
          }, function(response){
          });
        },
        function(callback){
          $http.patch('http://10.10.50.30:3000/entry?id=eq.' + entry_id, {'box_id': $scope.box.id}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
            $scope.entry_id = null;
            $scope.includedentries.push(response.data[0]);
          }, function(response){          
          });
        }
      ],
      function(err, results){
      });
    }
  };

  $scope.done = function(){
    //todo: add packing date and best before date
    $http.patch('http://10.10.50.30:3000/box?id=eq.' + $scope.box.id, {'weight': $scope.box_weight, 'lot_number': $scope.latest_lot_number}, {headers: {
       'Prefer': 'return=representation'}
    }).then(function(response){
      $scope.box = response.data[0];
    }, function(response){
        
    });
  };

  $scope.remove = function(entry_id){
    $http.patch('http://10.10.50.30:3000/entry?id=eq.' + entry_id, {'box_id': null}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
          $scope.includedentries = removeFromArray($scope.includedentries, entry_id);
        }, function(response){          
        });
  };

});//end controller
