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

.directive('harsamscan', function() { return { templateUrl: 'htmlpartials/harsamscan.html' }; })

.directive('scansummary', function() { return { templateUrl: 'htmlpartials/scansummary.html' }; })

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
