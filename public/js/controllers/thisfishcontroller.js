'use strict';
angular.module('scanthisApp.ThisfishController', [])

.controller('ThisfishSubmitCtrl', function($scope, $http, DatabaseServices, $rootScope) {
  $scope.postHarResponse = function(tf_code, status, data){
    var patch = {'har_response_status': status, 'har_response_data': data};
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){
    };
    DatabaseServices.PatchEntry('thisfish', patch, query, func);
  };

  $scope.postProResponse = function(tf_code, status, data){
    var patch = {'pro_response_status': status, 'pro_response_data': data};
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){
    };
    DatabaseServices.PatchEntry('thisfish', patch, query, func);
  };

  $scope.ThisfishHar = function(lot_number){
    var posturl = '';
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      var harvester_entry = JSON.parse(JSON.stringify(response.data[0]));
      delete harvester_entry.lot_number;
      harvester_entry.entry_unit = $scope.settings.entry_unit;
      harvester_entry.shipped_to_user = $scope.settings.tf_user_id;
      harvester_entry.landing_slip_number = '000000';
      harvester_entry.privacy_display_date = '20';
      harvester_entry.amount = Math.round(harvester_entry.amount);

      for (var key in harvester_entry) {
        if (harvester_entry.hasOwnProperty(key) && tf_har_options[key]) {
          var name = harvester_entry[key];
          var filtered = tf_har_options[key].filter(function(el){
            return el.name === name;
          });
          if(!filtered[0]){
          }
          else{
            var id = filtered[0].id;
            harvester_entry[key] = id;
            if (key === 'user'){
              if (filtered[0].group === 'fleet'){
                posturl = posturl_fleet;
              }
              else if (filtered[0].group === 'fish_harvester'){
                posturl = posturl_harvester;
              }
            }
          }
        }
      }
      console.log(harvester_entry);
      $http.post(posturl, harvester_entry, tfconfig).then
      (function(response){
        console.log(response);
        $scope.postHarResponse(harvester_entry.end_tag, response.status, response.data);
        $scope.ThisfishPro(lot_number);
      }, 
        function(response){
          console.log(response);
          $scope.postHarResponse(harvester_entry.end_tag, response.status, response.data);
        });     
    };
    DatabaseServices.GetEntries('tf_harvester_entry', func, query);
  };


  $scope.ThisfishPro = function(lot_number){
    var query = '?lotnum=eq.' + lot_number;
    var func = function(response){
      var processor_entry = JSON.parse(JSON.stringify(response.data[0]));
      delete processor_entry.lotnum;
      processor_entry.user = $scope.settings.tf_user;
      processor_entry.entry_unit = $scope.settings.entry_unit;
      processor_entry.location = $scope.settings.process_location;
      processor_entry.privacy_display_date = '20';
      processor_entry.amount = Math.round(processor_entry.amount);
      for (var field in $scope.settings.product_info){
        processor_entry[field] = $scope.settings.product_info[field];
      }

      for (var key in processor_entry) {
        if (processor_entry.hasOwnProperty(key) && tf_pro_options[key]) {
          var name = processor_entry[key];
          var filtered = tf_pro_options[key].filter(function(el){
            return el.name === name;
          });
          var id = filtered[0].id;
          processor_entry[key] = id;
        }
      }
      console.log(processor_entry);
      $http.post(posturl_processor, processor_entry, tfconfig)
      .then(function(response){
        console.log(response);
        $scope.postProResponse(processor_entry.end_tag, response.status, response.data);
      }, 
      function(response){
        $scope.postProResponse(processor_entry.end_tag, response.status, response.data);
      });
    };
    DatabaseServices.GetEntries('tf_processor_one_product', func, query);
  };




  $scope.GetTFEvents = function(lot_number){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      //console.log(response.data);
      $scope.code_info = response.data[0];
      $scope.GetFleetEvent(response.data[0].tf_code);
      $scope.tf_lot = lot_number;
    };
    DatabaseServices.GetEntries('incoming_codes', func, query);
  };

  $scope.response = {};

  $scope.GetProcessorEvent = function(tf_code){
    var posturl = posturl_processor + '?start_tag=' + tf_code;
    $http.get(posturl, tfconfig).then
    (function(response){
      if (response.data.results.length === 0){
        alert('error');
      }else{
        $scope.response.tf_pro = response.data.results[0];
        $scope.CreateHarEntry();
      }
    }, 
      function(response){
        console.log(response);
      });     
  };

  $scope.GetHarvesterEvent = function(tf_code){
    var posturl = posturl_harvester + '?start_tag=' + tf_code;
    $http.get(posturl, tfconfig).then
    (function(response){
      if (response.data.results.length === 0){
        alert('error');
      }else{
        $scope.response.tf_har = response.data.results[0];
        $scope.GetProcessorEvent(tf_code);
      }
    }, 
      function(response){
        console.log(response);
      });     
  };

  $scope.GetFleetEvent = function(tf_code){
    var posturl = posturl_fleet + '?start_tag=' + tf_code;
    $http.get(posturl, tfconfig).then
    (function(response){
      if (response.data.results.length === 0){
        $scope.GetHarvesterEvent(tf_code);
      }else{
        $scope.response.tf_fleet = response.data.results[0];
        $scope.GetProcessorEvent(tf_code);
      }      
    }, 
      function(response){
        console.log(response);
      });     
  };


  $scope.CreateHarEntry = function(){
    var posturl;
    var tf_entry = {};
    if ($scope.response.tf_har){
      posturl = posturl_harvester;
      tf_entry = $scope.response.tf_har;
    }else if($scope.response.tf_fleet){
      posturl = posturl_fleet;
      tf_entry = $scope.response.tf_fleet;
    }
    delete tf_entry.description;
    delete tf_entry.end_tag;
    delete tf_entry.id;
    delete tf_entry.start_tag;
    tf_entry.receipt_date = $scope.code_info.start_date;
    tf_entry.ship_date = $scope.code_info.end_date;
    tf_entry.entry_seq_bool = true;
    tf_entry.amount = Math.round($scope.code_info.amount_receive);
    //console.log(tf_entry);
    $http.post(posturl, tf_entry, tfconfig).then
      (function(response){
        console.log(response.data);
        $scope.CreateProEntry(response.data.start_tag);
      }, 
        function(response){
          console.log(response);
        });   
  };

  $scope.CreateProEntry = function(tf_code){
    var tf_entry = $scope.response.tf_pro;
    delete tf_entry.description;
    delete tf_entry.id;
    tf_entry.start_trans = tf_entry.end_trans = tf_entry.start_tag = tf_entry.end_tag = tf_code;
    tf_entry.entry_seq_bool = false;
    tf_entry.receipt_date = tf_entry.trans_date = $scope.code_info.end_date;
    tf_entry.trans_end_date = $scope.code_info.process_date;
    tf_entry.amount = Math.round($scope.code_info.amount_process);
    //console.log(tf_entry);
    $http.post(posturl_processor, tf_entry, tfconfig).then
      (function(response){
        console.log(response.data);
        $scope.ThisfishCurrentPro(tf_code);
      }, 
        function(response){
          console.log(response);
        });   
  };


  $scope.ThisfishCurrentPro = function(prev_code){
    var query = '?lot_number=eq.' + $scope.tf_lot;
    var func = function(response){

      for(var i =0;i<response.data.length;i++){
        var raw_entry = JSON.parse(JSON.stringify(response.data[i]));
        var processor_entry = {};
        processor_entry.amount = Math.round(raw_entry.amount);
        processor_entry.start_trans = processor_entry.end_trans = prev_code;
        processor_entry.start_tag = processor_entry.end_tag = raw_entry.tf_code;
        processor_entry.entry_unit = $scope.settings.entry_unit;
        processor_entry.handling = raw_entry.handling;
        processor_entry.location = $scope.settings.process_location;
        processor_entry.lot_number = raw_entry.internal_lot_code;
        processor_entry.privacy_display_date = '20';
        processor_entry.product_state = raw_entry.state;
        processor_entry.receipt_date = raw_entry.receipt_date;
        processor_entry.received_from_user = raw_entry.received_from;
        processor_entry.trade_unit = raw_entry.trade_unit;

        processor_entry.trans_date = raw_entry.process_start;
        processor_entry.trans_end_date = raw_entry.process_end;

        processor_entry.user = $scope.settings.tf_user;

        for (var key in processor_entry) {
          if (processor_entry.hasOwnProperty(key) && tf_pro_options[key]) {
            var name = processor_entry[key];
            var filtered = tf_pro_options[key].filter(function(el){
              return el.name === name;
            });
            var id = filtered[0].id;
            processor_entry[key] = id;
          }
        }
        //console.log(processor_entry);
        $http.post(posturl_processor, processor_entry, tfcurrentconfig)
        .then(function(response){
          console.log(processor_entry.end_tag);
          $scope.postProResponse(response.data.end_tag, response.status, response.data);
        }, 
        function(response){
          console.log(response);
          $scope.postProResponse(processor_entry.end_tag, response.status, response.data);
        });
      }

    };
    DatabaseServices.GetEntries('tf_processor_many_product', func, query);
  };







  $scope.SubmitLot = function(lot_number, tf_code){
    if (tf_code){
      $scope.ThisfishHar(lot_number);
      //$scope.ThisfishPro(lot_number);
    }
  };

})

;
