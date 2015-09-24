'use strict';

angular.module('scanthisApp.harsam_boxing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_boxing', {
    templateUrl: 'harsam_boxing/harsam_boxing.html',
  });
}])

.controller('harsamBoxingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.boxentry = {'ft_box_num':'','size':'', 'grade':'', 'lot_number':''};
  $scope.includedentries = [];

  $scope.makebox = function(form){
    $scope.MakeBoxEntry(form);
    $scope.DatabaseBox();
  };

  $scope.addLoin = function(entry_id){
    if (idNotInArray($scope.includedentries, entry_id)){
      async.series([
        function(callback){
          $scope.GetItem(entry_id, callback);
        },
        function(callback){
          $scope.PatchItemWithBox(entry_id, callback);
        }
      ],
      function(err, results){
      });
    }
  };

  $scope.done = function(){
    $scope.PatchBox();
  };

  $scope.remove = function(entry_id){
    $scope.PatchItemRemoveBox(entry_id);
  };

});//end controller
