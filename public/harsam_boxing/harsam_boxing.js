'use strict';

angular.module('scanthisApp.harsam_boxing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_boxing', {
    templateUrl: 'harsam_boxing/harsam_boxing.html',
  });
}])

.controller('harsamBoxingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.box_entry = {'ft_box_num':'','size':'', 'grade':'', 'lot_number':''};
  $scope.includeditems = [];

  $scope.makebox = function(form){
    $scope.MakeBoxEntry(form);
    $scope.DatabaseBox();
  };

  $scope.addLoin = function(item_id){
    if (idNotInArray($scope.includeditems, item_id)){
      async.series([
        function(callback){
          $scope.GetItem(item_id, callback);
        },
        function(callback){
          $scope.PatchItemWithBox(item_id, callback);
        }
      ],
      function(err, results){
      });
    }
  };

  $scope.done = function(){
    $scope.PatchBox();
  };

  $scope.remove = function(item_id){
    $scope.PatchItemRemoveBox(item_id);
  };

});//end controller
