var InProductionCtrl = function($scope, $http) {
  $http.get('http://10.10.50.30:3000/all_receiving').then(function(response) {
    var array = response.data;
    for (var i=0;i<array.length;i++){
      array[i].start_date = new Date(array[i].start_date);
      array[i].end_date = new Date(array[i].end_date);
    }
    $scope.receiving = array;
  }, function(response){
    alert(response.status);
  });

  $scope.processToday = function(lot_num) {
    console.log("has been clicked");
    var change = {'in_prod': 'true'};
    $http.patch('http://10.10.50.30:3000/receiving_lots?lot_number=eq.' + lot_num, change).then(function(response){}, 
        function(response){
          alert(response.status);
        });
  };


  /*TODO: add code so can not keep clicking same in one day, visually show if in production*/
  /*if true - 'in processing' if false - 'process today'*/
  /*TODO: add code so can not keep clicking same in one day*/

};

var SupplierEditCtrl = function($scope, $http) {
  $http.get('http://10.10.50.30:3000/supplier').then(function(response){
      $scope.suppliers = response.data;
  }, function(response){
    alert(response.status);
  });


};
