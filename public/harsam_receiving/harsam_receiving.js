'use strict';

angular.module('scanthisApp.harsam_receiving', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_receiving', {
    templateUrl: 'harsam_receiving/harsam_receiving.html',
  });
}])

.controller('sharedCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});
  $scope.stage_id = 2;

  /*checks if there is an existing lot matching query, if not creates new one (calls newlot)*/
  $scope.CreateLot = function(queryString, date){
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length > 0){
        $scope.currentlot = response.data[0].lot_number;
      }//end if
      else{
        var lot_number = createLotNum($scope.stage_id, date);
        $scope.MakeLotEntry(date, lot_number);
        $scope.DatabaseLot(lot_number);     
      }
    }, function(response){
      alert(response.status);
    });//end get lot
  };

  $scope.LotFromSupplier = function(){
    $http.get('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id).then(function(response){
      var supplier_id = response.data[0].current_supplier_id;
      var date = new Date();
      var queryString = LotQuery({'supplier_id': supplier_id, 'date': date});
      $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': ''};
      $scope.CreateLot(queryString, date);
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.LotFromSupplier();

})

.controller('harsamReceivingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.InitItemAdd(2, 1, ['weight_1','weight_2']);
  InitShowSummary($scope);
 
})

.controller('harsamTrimmingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.InitItemAdd(2, 2, ['weight_1','grade']);
  InitShowSummary($scope);
 
});
