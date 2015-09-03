'use strict';

var HarsamApp = angular.module('HarsamApp', ['ngRoute', 'scanthisControllers']);

HarsamApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'home.html'
      }).
      when('/harsam',{
        templateUrl: 'harsam.html'
      }).
      when('/harsam_admin', {
        templateUrl: 'harsam_admin.html'
      }).
      when('/harsam2', {
        templateUrl: 'harsam2.html',
        controller: 'SelectLotCtrl'
      }).
      when('/harsam1', {
        templateUrl: 'harsam1.html',
        controller: 'ReceivingCtrl'
      }).
      when('/amanda',{
        templateUrl: 'amanda.html'
      }).
      when('/amanda_admin', {
        templateUrl: 'amanda_admin.html'
      }).
      when('/amanda2', {
        templateUrl: 'amanda2.html',
        controller: 'SelectLotCtrl'
      }).
      when('/amanda1', {
        templateUrl: 'amanda1.html',
        controller: 'ReceivingCtrl'
      }).
      otherwise({
        redirectTo: '/home'
      });

  }]);



