app.controller('BaseController', function($scope, $routeParams) {
    $scope.include = $routeParams.controller + '/' + $routeParams.action;
});
