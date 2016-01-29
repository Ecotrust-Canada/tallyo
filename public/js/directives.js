'use strict';


angular.module('scanthisApp.directives', [])


/*table with suppliers with button to set as current*/
.directive('supplierlist', function() { return { templateUrl: 'htmlpartials/supplierlist.html' }; })

.directive('currentlot', function() { return { templateUrl: 'htmlpartials/currentlot.html' }; })

.directive('formoptionedit', function() { return { templateUrl: 'htmlpartials/formoptionedit.html' }; })

.directive('loadcurrentcollection', function() { return { templateUrl: 'htmlpartials/loadcurrentcollection.html' }; })

.directive('selectfromcurrentlots', function() { return { templateUrl: 'htmlpartials/selectfromcurrentlots.html' }; })

.directive('selectsamedaylot', function() { return { templateUrl: 'htmlpartials/selectsamedaylot.html' }; })

.directive('adminmanagelots', function() { return { templateUrl: 'htmlpartials/adminmanagelots.html' }; })

.directive('shipmenttotals', function() { return { templateUrl: 'htmlpartials/shipmenttotals.html' }; })

.directive('inventory', function() { return { templateUrl: 'htmlpartials/inventory.html' }; })

.directive('setshipmentinfo', function() { return { templateUrl: 'htmlpartials/setshipmentinfo.html' }; })

.directive('setharvesterinfo', function() { return { templateUrl: 'htmlpartials/setharvesterinfo.html' }; })

.directive('searchtext', function() { return { templateUrl: 'htmlpartials/searchtext.html' }; })

.directive('display', function() { return { 
  scope: {config: '=',
          obj: '='},
  templateUrl: 'htmlpartials/display.html' }; })

.directive('list', function() { return { 
  scope: { itemlist: '=',  
           config: '=' , 
           filterstring: '=', 
           istotal: '=', 
           updateFn: '&'},
  controller: 'ListCtrl',
  templateUrl: 'htmlpartials/list.html' }; })

.directive('expandedlist', function() { return { 
  scope: { itemlist: '=', 
           displaycfg: '=', 
           config: '=' , 
           filterstring: '=',  
           updateFn: '&',
           hideFn: '&'},
  controller: 'ListCtrl',
  templateUrl: 'htmlpartials/expandedlist.html' }; })

.directive('dropdown', function() { return { 
  scope: { itemlist: '=',  
           cfg: '=', 
           selectedoption: '=', 
           changeFn: '&' },
  templateUrl: 'htmlpartials/dropdown.html' }; })

.directive('entryform', function() { return { 
  scope: {table: '=',  
          config: '=', 
          form: '=',  
          formchange: '=',
          list1: '=', 
          list2: '=', 
          submitFn: '&',
          pollFn: '&'},
  controller: 'entryformCtrl', 
  templateUrl: 'htmlpartials/entryform.html' }; })

.directive('fieldsetrepeat', function() { return { 
  scope: { config: '=' , 
           submitFn: '&'},
  controller: 'FieldsetCtrl',
  templateUrl: 'htmlpartials/fieldsetrepeat.html' }; })
;
