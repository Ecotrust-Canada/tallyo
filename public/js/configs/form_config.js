'use strict';

var formconfigs = 
[
  { //box, HS0-004 
    id: 0, 
    hide: "Create Case", 
    fields:[
      {"type":"text", "fieldname":"case_number", "title":"Case Number", "value":""}, 
      {"type": "select", "fieldname":"size", "title":"Size", "value":[{"name":"3"}, {"name":"3-5"}, {"name":">5"}]}, 
      {"type": "select", "fieldname":"grade", "title":"Grade", "value":[{"name":"A"}, {"name":"AA"}, {"name":"AAA"}]}
    ]
  },
  {//box, AM2-001
    id: 1, 
    fields:[
      {"type":"text", "fieldname":"size", "title":"Size", "value":""}, 
      {"type":"text", "fieldname":"grade", "title":"Grade", "value":""}, 
      {"type":"text", "fieldname":"pieces", "title":"Pieces", "value":""}, 
      {"type":"text", "fieldname":"weight", "title":"Weight", "value":""}, 
      {"type":"text", "fieldname":"case_number", "title":"Case Number", "value":""}
    ]
  },
  {//harvester, HS0-ADM
    id: 2,
    hide: "Add New Supplier",  
    fields:[
      {"fieldname":"species_common","id":"0","title":"Species (Common)","type":"text", "value":"Yellowfin Tuna"},
      {"value":"Thunnus abacares","fieldname":"species_latin","id":"1","title":"Species (Latin)","type":"text"},
      {"value":"Fresh","fieldname":"state","id":"2","title":"State","type":"text"}, 
      {"value":"Loined","fieldname":"handling","id":"3","title":"Handling","type":"text"},
      {"value":"dboptions","fieldname":"supplier_group","id":"4","title":"Supplier Group","type":"select"},
      {"value":"dboptions","fieldname":"supplier","id":"5","title":"Supplier","type":"select"},
      {"value":"dboptions","fieldname":"fleet_vessel","id":"6","title":"Fleet/Vessel","type":"select"},
      {"value":"dboptions","fieldname":"fishing_area","id":"7","title":"Fishing Area","type":"select"},
      {"value":"Handline","fieldname":"fishing_method","id":"8","title":"Fishing Method","type":"text"},
      {"value":"dboptions","fieldname":"landing_location","id":"9","title":"Landing Location","type":"select"},
      {"value":"Indonesia","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"text"},
      {"value":"Indonesia","fieldname":"country_production","id":"11","title":"Country of Production","type":"text"},
      {"value":"dboptions","fieldname":"ft_fa_code","id":"12","title":"FT FA Code","type":"select"},
      {"value":[{"val":"true","label":"Yes"},{"val":"false","label":"No"}],"fieldname":"fair_trade","id":"13","title":"Fair Trade","type":"radio"}
    ], 
    dboptions: 'harvester'
  },
  {//harvester, AM2-011
    id: 3,
    hide: "Add Harvesting Info",  
    fields:[
      {"value":"","fieldname":"species_common","id":"0","title":"Species (Common)","type":"text"},
      {"value":"","fieldname":"species_latin","id":"1","title":"Species (Latin)","type":"text"},
      {"value":"","fieldname":"state","id":"2","title":"State","type":"text"},
      {"value":"","fieldname":"handling","id":"3","title":"Handling","type":"text"},
      {"value":"","fieldname":"fleet_vessel","id":"6","title":"Fleet/Vessel","type":"text"},
      {"value":"","fieldname":"fishing_area","id":"7","title":"Fishing Area","type":"text"},
      {"value":"","fieldname":"fishing_method","id":"8","title":"Fishing Method","type":"text"},
      {"value":"","fieldname":"landing_location","id":"9","title":"Landing Location","type":"text"},
      {"value":"","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"text"},
      {"value":"","fieldname":"country_production","id":"11","title":"Country of Production","type":"text"},
    ]
  },
  {//shipping_unit, HS0-005
    id: 4, 
    hide: "Create Shipping Entry", 
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""}, 
      {"type":"text", "fieldname":"customer", "title":"Customer", "value":"Amanda"},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""}
    ]
  },
  {//shipping_unit, AM2-001
    id: 5, 
    hide: "Create Shipping Entry", 
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""}, 
      {"type":"text", "fieldname":"received_from", "title":"Received From", "value":"HarSam Ambon"}, 
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""}
    ]
  },
  {//shipping_unit, AM2-011
    id: 6,  
    hide: "Add receiving info",  
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""},  
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""},
      {"fieldname": "split"},
      {"value":"","fieldname":"species_common","id":"0","title":"Species (Common)","type":"text"},
      {"value":"","fieldname":"species_latin","id":"1","title":"Species (Latin)","type":"text"},
      {"value":"","fieldname":"state","id":"2","title":"State","type":"text"},
      {"value":"","fieldname":"handling","id":"3","title":"Handling","type":"text"},
      {"value":"","fieldname":"fleet_vessel","id":"6","title":"Fleet/Vessel","type":"text"},
      {"value":"","fieldname":"fishing_area","id":"7","title":"Fishing Area","type":"text"},
      {"value":"","fieldname":"fishing_method","id":"8","title":"Fishing Method","type":"text"},
      {"value":"","fieldname":"landing_location","id":"9","title":"Landing Location","type":"text"},
      {"value":"","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"text"},
      {"value":"","fieldname":"country_production","id":"11","title":"Country of Production","type":"text"},
    ]
  },
  { //scan, HS0-001
    id: 7, 
    startpolling: "weight_1",
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Plastic (kg)","type":"number", "pollarg": "weight_2"},
      {"value":"","fieldname":"weight_2","id":"1","title":"No Plastic","type":"number", "pollarg": "stop"},
      {"value":[{"val":"Dirty","label":"Dirty"},{"val":"Clean","label":"Clean"}],"fieldname":"state","id":"2","title":"State","type":"radio", "stay": "true"}
    ]
  },
  {//scan. HS0-002, 003
    id: 8, 
    startpolling: "weight_1",
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number", "pollarg": "stop"},
      {"value":[{"val":"A","label":"A"},{"val":"B","label":"B"},{"val":"C","label":"C"},{"val":"D","label":"D"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio"}
    ]
  },
  {//scan, AM2-003
    id: 9, 
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number"},
      {"value":[{"val":"A","label":"A"},{"val":"AA","label":"AA"},{"val":"AAA","label":"AAA"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio"}
    ]
  },
  { //lot, amanda internal receiving 
    id: 10, 
    hide: "Start New Lot", 
    fields:[
      {"type":"text", "fieldname":"internal_lot_code", "title":"Lot code", "value":""}
    ]
  },
  {//label, AM2-003
    id: 11, 
    fields:[
      //{"type": "select", "fieldname":"lot_number", "title":"Lot Code", "value": {"list": "list1", "name": "internal_lot_code", "val":"lot_number"}},
      {"type": "select", "fieldname":"product_code", "title":"Product Type", "value": {"list": "list2", "name": "product_type", "val":"product_code", "table": "product"}},
      {"value":"dboptions","fieldname":"trade_unit","id":"0","title":"Trade Unit","type":"select"}      
    ], 
    dboptions: 'label'
  },
  {//product, AM2-003
    id: 12, 
    hide: "Add Product", 
    fields:[
      {"type":"text", "fieldname":"product_type", "title":"Type", "value":""}, 
      {"type":"text", "fieldname":"handling", "title":"Handling", "value":""}, 
      {"type":"text", "fieldname":"state", "title":"State", "value":""},
      {"type":"text", "fieldname":"sap_item_code", "title":"SAP Item Code", "value":""},
      {"type":"number", "fieldname":"best_before", "title":"Best Before Interval (years)", "value":""}
    ], 
  },
  {//shipping_unit, AM2-006
    id: 13, 
    hide: "Create Shipping Entry", 
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""}, 
      {"type":"text", "fieldname":"customer", "title":"Customer", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""}
    ]
  },
  {//box, AM2-006
    id: 14, 
    fields:[
      {"type":"number", "fieldname":"num_boxes", "title":"Number of boxes to print", "value":""}
    ]
  },

];


var packingconfigs = [
  {
    id: 0, 
    sectiontitle: "Add Loins", 
    scantitle: "Scan Loin", 
    completetitle: "Complete Box/Print Label"    
  },
  {
    id: 1, 
    sectiontitle: "Add Cases", 
    scantitle: "Box ID", 
    completetitle: "Complete Shipment"   
  },
  {
    id: 2, 
    sectiontitle: "Add Boxes", 
    scantitle: "Scan Box", 
    completetitle: "Complete Lot"   
  }


];
