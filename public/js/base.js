'use strict';

var HarsamApp = angular.module('HarsamApp', ['ngRoute', 'scanthisControllers']);

HarsamApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'home.html'
      }).
      when('/harsam2', {
        templateUrl: 'harsam2.html',
        controller: 'SelectLotCtrl'
      }).
      when('/harsam1', {
        templateUrl: 'harsam1.html',
        controller: 'ReceivingCtrl'
      }).      
      otherwise({
        redirectTo: '/home'
      });

  }]);
