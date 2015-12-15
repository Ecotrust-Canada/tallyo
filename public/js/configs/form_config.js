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
  {//harvester, AM2-ADM
    id: 3, 
    fields:[
      {"value":"Yellowfin Tuna","fieldname":"species_common","id":"0","title":"Species (Common)","type":"text"},
      {"value":"Thunnus abacares","fieldname":"species_latin","id":"1","title":"Species (Latin)","type":"text"},
      {"value":"Fresh","fieldname":"state","id":"2","title":"State","type":"text"},
      {"value":"Loined","fieldname":"handling","id":"3","title":"Handling","type":"text"},
      {"value":"","fieldname":"supplier_group","id":"4","title":"Supplier Group","type":"text"},
      {"value":"","fieldname":"supplier","id":"5","title":"Supplier","type":"text"},
      {"value":"","fieldname":"fleet_vessel","id":"6","title":"Fleet/Vessel","type":"text"},
      {"value":"","fieldname":"fishing_area","id":"7","title":"Fishing Area","type":"text"},
      {"value":"","fieldname":"fishing_method","id":"8","title":"Fishing Method","type":"text"},
      {"value":"","fieldname":"landing_location","id":"9","title":"Landing Location","type":"text"},
      {"value":"","fieldname":"country_origin","id":"10","title":"Country of Origin","type":"text"},
      {"value":"","fieldname":"country_production","id":"11","title":"Country of Production","type":"text"},
      {"value":"","fieldname":"ft_fa_code","id":"12","title":"FT FA Code","type":"text"},
      {"value":[{"val":"true","label":"Yes"},{"val":"false","label":"No"}],"fieldname":"fair_trade","id":"13","title":"Fair Trade","type":"radio"},
      {"value":[{"name":"HS0"},{"name":"AM1"}, {"name":"FIJ"}, {"name":"PAC"}, {"name":"ATL"}],"fieldname":"processor_code","id":"14","title":"Processor code","type":"select"}
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
    fields:[
      {"type":"text", "fieldname":"po_number", "title":"P.O. Number", "value":""}, 
      {"type":"text", "fieldname":"received_from", "title":"Received From", "value":""}, 
      {"type":"text", "fieldname":"bill_of_lading", "title":"Bill of Lading", "value":""},
      {"type":"text", "fieldname":"vessel_name", "title":"Vessel Name", "value":""},
      {"type":"text", "fieldname":"container_number", "title":"Container Number", "value":""}
    ]
  },
  {//processor, AM2-ADM
    id: 6, 
    fields:[
      {"type":"text", "fieldname":"name", "title":"Name", "value":""}, 
      {"type":"text", "fieldname":"processor_code", "title":"Code", "value":""}
    ]
  },
  { //scan, HS0-001
    id: 7, 
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Plastic (kg)","type":"number"},
      {"value":"","fieldname":"weight_2","id":"1","title":"No Plastic","type":"number"},
      {"value":[{"val":"Dirty","label":"Dirty"},{"val":"Clean","label":"Clean"}],"fieldname":"state","id":"2","title":"State","type":"radio"}
    ]
  },
  {//scan. HS0-002, 003
    id: 8, 
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number"},
      {"value":[{"val":"A","label":"A"},{"val":"B","label":"B"},{"val":"C","label":"C"},{"val":"D","label":"D"}],"fieldname":"grade","id":"1","title":"Grade","type":"radio"}
    ]
  },
  {//scan, AM2-003
    id: 9, 
    fields:[
      {"value":"","fieldname":"weight_1","id":"0","title":"Weight (kg)","type":"number"}
    ]
  }

];


var packingconfigs = [
  {
    id: 0, 
    sectiontitle: "Add Items", 
    scantitle: "Scan Loin"     
  },
  {
    id: 1, 
    sectiontitle: "Add Cases", 
    scantitle: "Box ID"    
  }


];
