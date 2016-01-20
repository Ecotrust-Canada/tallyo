'use strict';

var formconfigs = 
[
  { //box, HS0-004 
    id: 0, 
    hide: "Create Case", 
    fields:[
      {"type":"text", "fieldname":"case_number", "title":"Case Number", "value":""}, 
      {"type": "select", "fieldname":"size", "title":"Size", "value":[{"name":"3 lb"}, {"name":"3-5 lb"}, {"name":"5-up lb"}]}, 
      {"type": "select", "fieldname":"grade", "title":"Grade", "value":[{"name":"A"}, {"name":"AA"}, {"name":"AAA"}]}
    ]
  },
  {//box, AM2-011
    id: 1, 
    fields:[
      {"value":[{"name":"A"},{"name":"AA"},{"name":"AAA"},{"name":"B"},{"name":"AB"}],"fieldname":"grade","id":"0","title":"grade:","type":"select"}, 
      {"value":[{"name":"1-3 lb"},{"name":"3-5 lb"}, {"name":"5-8 lb"},{"name":"8-up lb"},{"name":"3-4 lb"}, {"name":"4-8 lb"}],"fieldname":"size","id":"1","title":"size:","type":"select"},
      {"value":[{"name":"25"},{"name":"30"}],"fieldname":"weight","id":"2","title":"weight:","type":"select"},
      {"type":"number", "fieldname":"num_boxes", "placeholder":"number of boxes", "value":""}
    ],
    title: "Print Box Labels"
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
    dboptions: 'harvester',
    editinform: true
  },
  {//harvester, AM2-011
    id: 3,
    hide: "Add New Origin",  
    fields:[
      {"value":"dboptions","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"select"},
      {"value":"dboptions","fieldname":"supplier","id":"5","title":"Name","type":"select"},
      {"fieldname":"species_common","id":"0","title":"Species (Common)","type":"text", "value":"Yellowfin Tuna"},
    ],
    dboptions: 'harvester',
    editinform: true
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
    hide: "Create New Shipment",  
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""},  
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""},
      {"type":"select", "fieldname":"received_from", "title":"Supplier", "value":"dboptions"},
    ],
    dboptions: 'shipping_unit',
    editinform: true
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
    startpolling: "weight_1",
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number", "pollarg": "stop"},
      {"value":[{"val":"A","label":"A"},{"val":"AA","label":"AA"},{"val":"AAA","label":"AAA"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio", "stay": "true"}
    ]
  },
  { //lot, amanda internal receiving 
    id: 10, 
    hide: "Start New Lot", 
    fields:[
      {"type":"text", "fieldname":"internal_lot_code", "title":"Lot code", "value":""}
    ]
  },
  {//label, AM2-004
    id: 11, 
    fields:[
      {"type": "select", "fieldname":"product_code", "title":"Product Type", "value": {"list": "list2", "name": "product_type", "val":"product_code", "table": "product"}},
      {"value":[{"name":"10"},{"name":"20"},{"name":"50"}],"fieldname":"trade_unit_w","id":"1","title":"Trade Unit - Weight","type":"select"}, 
      {"value":[{"name":"kg"},{"name":"lb"}],"fieldname":"trade_unit","id":"2","title":"Units","type":"select"}      
    ], 
    dboptions: 'label'
  },
  {//product, AM2-004
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
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"seal_number", "title":"Seal Number", "value":""}
    ]
  },
  { //lot, amanda internal receiving 
    id: 14, 
    fields:[
      {"type":"text", "fieldname":"internal_lot_code", "title":"Lot code", "value":""}
    ]
  },
  {//harvester, AM1-001
    id: 15,
    hide: "Add New Origin",  
    fields:[
      {"value":"dboptions","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"select"},
      {"value":"dboptions","fieldname":"supplier","id":"5","title":"Name","type":"select"},
      {"fieldname":"species_common","id":"0","title":"Species (Common)","type":"text", "value":"Yellowfin Tuna"},
    ],
    dboptions: 'origin',
    editinform: true
  },
  {//shipping_unit, AM1-001
    id: 16,  
    hide: "Create New Shipment",  
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""},  
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""},
      {"type":"select", "fieldname":"received_from", "title":"Supplier", "value":"dboptions"},
    ],
    dboptions: 'shipment',
    editinform: true
  },
  { //scan, AM1-002
    id: 17, 
    startpolling: "weight_1",
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number", "pollarg": "stop"},
      {"value":[{"val":"A","label":"A"},{"val":"AA","label":"AA"},{"val":"AAA","label":"AAA"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio"},
      {"value":[{"val":"YF","label":"YF"},{"val":"BE","label":"BE"}],"fieldname":"species","id":"2","title":"Species","type":"radio", "stay": "true"}
    ]
  },
  { //scan, AM1-002
    id: 18, 
    startpolling: "weight_1",
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number", "pollarg": "stop"},
      {"value":"","fieldname":"pieces","id":"0","title":"Pieces","type":"number"}
    ]
  },
  { //scan, AM1-002
    id: 19, 
    startpolling: "weight",
    fields:[
      {"value":"","fieldname":"weight","id":"0","title":"Weight (kg)","type":"number", "pollarg": "stop"},
      {"value":[{"val":"A","label":"A"},{"val":"AA","label":"AA"},{"val":"AAA","label":"AAA"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio"},
      {"value":[{"val":"YF","label":"YF"},{"val":"BE","label":"BE"}],"fieldname":"species","id":"2","title":"Species","type":"radio", "stay": "true"}
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
