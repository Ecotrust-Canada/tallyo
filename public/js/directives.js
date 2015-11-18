'use strict';


angular.module('scanthisApp.directives', [])


/*select lot from dropdown*/
.directive('selectlot', function() { return { templateUrl: 'htmlpartials/selectlot.html' }; })

/*form with submit button*/
.directive('createform', function() { return { templateUrl: 'htmlpartials/createform.html' }; })

/*table with suppliers with button to set as current*/
.directive('supplierlist', function() { return { templateUrl: 'htmlpartials/supplierlist.html' }; })

/**/
.directive('loinlist', function() { return { templateUrl: 'htmlpartials/loinlist.html' }; })

.directive('boxsummary', function() { return { templateUrl: 'htmlpartials/boxsummary.html' }; })

.directive('scansummary', function() { return { templateUrl: 'htmlpartials/scansummary.html' }; })

.directive('loinscansummary', function() { return { templateUrl: 'htmlpartials/loinscansummary.html' }; })

.directive('currentlot', function() { return { templateUrl: 'htmlpartials/currentlot.html' }; })

.directive('clearsubmit', function() { return { templateUrl: 'htmlpartials/clearsubmit.html' }; })

.directive('mostrecentscan', function() { return { templateUrl: 'htmlpartials/mostrecentscan.html' }; })

.directive('mostrecentloin', function() { return { templateUrl: 'htmlpartials/mostrecentloin.html' }; })

.directive('scantotals', function() { return { templateUrl: 'htmlpartials/scantotals.html' }; })

/**/
.directive('boxinfo', function() { return { 
  scope: { box: '=' },
  templateUrl: 'htmlpartials/boxinfo.html' }; })

.directive('shipinfo', function() { return { 
  scope: { ship: '=' },
  templateUrl: 'htmlpartials/shipinfo.html' }; })

.directive('qrscan', function() { return { 
  scope: { thedata: '=' },
  templateUrl: 'htmlpartials/qrscan.html' }; })

/*Creates a searchable table of items in order to reprint labels*/
.directive('reprint', function() { return { templateUrl: 'htmlpartials/reprint.html'}; })


;
