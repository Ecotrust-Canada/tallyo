// harsam.js
describe('Harsam Set Receiving Lots', function() {
  var moment = require('moment');

  function makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  function generateOptionValue(fieldname){
    return makeid()+"_"+new Date().valueOf()+fieldname;
  }

  function filling_add_new_supplier_form(new_vessel, cb){
    browser.get('#/terminal/1');
    // filling form
    element(by.id('toggle-2')).click();
    // supplier_group
    var new_supplier_group = generateOptionValue('supplier_group');
    element(by.id('supplier_group-2')).click();    // click "Edit"
    element(by.id('edit-options-supplier_group')).
            element(by.model('new')).sendKeys(new_supplier_group);
    element(by.id('edit-options-supplier_group')).
            element(by.css('.add-field-option')).click().then(function(){

      var select = element(by.css('select[name="supplier_group"]'));
      select.$('[value="'+new_supplier_group+'"]').click();
      //element(by.cssContainingText('select[name="supplier_group"] option', field_val)).click();
    });
    element(by.id('supplier_group-2')).click();    // click "Hide"
    // supplier
    var new_supplier = generateOptionValue('supplier');
    element(by.id('supplier-2')).click();    // click "Edit"
    element(by.id('edit-options-supplier')).
            element(by.model('new')).sendKeys(new_supplier);
    element(by.id('edit-options-supplier')).
    element(by.css('.add-field-option')).click().then(function(){
      element(by.cssContainingText('select[name="supplier"] option', new_supplier)).click();
    });
    element(by.id('supplier-2')).click();    // click "Hide"
    // fleet_vessel
    element(by.id('fleet_vessel-2')).click();    // click "Edit"
    element(by.id('edit-options-fleet_vessel')).
            element(by.model('new')).sendKeys(new_vessel);
    element(by.id('edit-options-fleet_vessel')).
    element(by.css('.add-field-option')).click().then(function(){
      element(by.cssContainingText('select[name="fleet_vessel"] option', new_vessel)).click();
    });
    element(by.id('fleet_vessel-2')).click();    // click "Hide"
    // fishing_area
    var new_area = generateOptionValue('fishing_area');
    element(by.id('fishing_area-2')).click();    // click "Edit"
    element(by.id('edit-options-fishing_area')).
            element(by.model('new')).sendKeys(new_area);
    element(by.id('edit-options-fishing_area')).
            element(by.css('.add-field-option')).click().then(function(){
      element(by.cssContainingText('select[name="fishing_area"] option', new_area)).click();
    });
    element(by.id('fishing_area-2')).click();    // click "Hide"
    // landing_location
    var new_landing_location = generateOptionValue('landing_location');
    element(by.id('landing_location-2')).click();    // click "Edit"
    element(by.id('edit-options-landing_location')).
            element(by.model('new')).sendKeys(new_landing_location);
    element(by.id('edit-options-landing_location')).
            element(by.css('.add-field-option')).click().then(function(){
      element(by.cssContainingText('select[name="landing_location"] option', new_landing_location)).click();
    });
    element(by.id('landing_location-2')).click();    // click "Hide"
    // ft_fa_code
    var new_ft_code = generateOptionValue('ft_fa_code');
    element(by.id('ft_fa_code-2')).click();    // click "Edit"
    element(by.id('edit-options-ft_fa_code')).
            element(by.model('new')).sendKeys(new_ft_code);
    element(by.id('edit-options-ft_fa_code')).
            element(by.css('.add-field-option')).click().then(function(){

      element(by.css('select[name="ft_fa_code"]')).$('[value="'+new_ft_code+'"]').click();
    });
    element(by.id('ft_fa_code-2')).click();    // click "Hide"

    element(by.css('input[name="species_common"]')).sendKeys('Polloc');

    element.all(by.css('input[type="radio"][name="fair_trade"]')).get(0).click().then(cb);
  }

  it('should have 8 terminals', function() {
    browser.get('');
    var terminalsList = element.all(by.repeater('terminal in terminals'));
    expect(terminalsList.count()).toEqual(8);
  });

  it('click on "Add New Supplier" should show harvester form', function() {
    browser.get('#/terminal/1');
    expect(element(by.id('form-2')).isDisplayed()).toBeFalsy();
    element(by.id('toggle-2')).click();
    expect(element(by.id('form-2')).isDisplayed()).toBeTruthy();
  });

  it('fill new supplier data, submit should add to list of suppliers', function() {
    var new_vessel = generateOptionValue('fleet_vessel');

    filling_add_new_supplier_form( new_vessel, function(){
      //click 'Submit'
      element(by.id('submit-2')).click().then(function(){
        // fill search field
        element(by.model('searchText')).sendKeys(new_vessel).then(function(){
          //expect new vessel name to be in list of harvesters
          expect(element.all(by.cssContainingText('.list_item_val', new_vessel)).count()).toEqual(1);
          expect(element.all(by.cssContainingText('.list_item_val', 'Polloc')).count()).toEqual(1);
        }); 
      }); 
    });
  });

  it('Clear Form should clear to default values', function() {
    var new_vessel = generateOptionValue('fleet_vessel');

    filling_add_new_supplier_form( new_vessel, function(){
      //click 'Submit'
      element(by.id('clear-2')).click().then(function(){
        // text inputs to default
        element(by.css('input[name="species_common"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Yellowfin Tuna'); 
        });
        element(by.css('input[name="species_latin"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Thunnus abacares'); 
        });
        element(by.css('input[name="state"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Fresh'); 
        });
        element(by.css('input[name="handling"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Loined'); 
        });
        element(by.css('input[name="fishing_method"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Handline'); 
        });
        element(by.css('input[name="country_origin"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Indonesia'); 
        });
        element(by.css('input[name="country_production"]')).getAttribute('value').then(function(value){
          expect(value).toEqual('Indonesia'); 
        });
        // select none
        expect(element(by.css('select[name="supplier_group"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="supplier"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="fleet_vessel"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="fishing_area"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="fishing_area"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="landing_location"]')).$('option:checked').getText()).toEqual('-- select --'); 
        expect(element(by.css('select[name="ft_fa_code"]')).$('option:checked').getText()).toEqual('-- select --'); 
        // radiobuttons not checked
        expect(element.all(by.css('select[name="fair_trade"]:checked')).count()).toEqual(0); 
      }); 
    });
  });

  it('clicking "Set Current" in harversters list row creates lot, fills the section above and creates a new row in the admin-view lots', 
    function() {
    
    var new_vessel = generateOptionValue('fleet_vessel');

    filling_add_new_supplier_form( new_vessel, function(){
      //click 'Submit'
      element(by.id('submit-2')).click().then(function(){
        // fill search field
        element(by.model('searchText')).sendKeys(new_vessel).then(function(){
          // click "Set Current" button
          element(by.buttonText('Set Current')).click().then(function(){
            // expect values from row with "Set Current" button to appear in
            // above "display current lot" section, lot will have as end_date
            // (Receive Date) today date
            expect(element.all(by.cssContainingText('.display_val', new_vessel)).count()).toEqual(1);
            expect(element.all(by.cssContainingText('.display_val', moment().format("MMM DD"))).count()).toEqual(1);

            // setting internal_lot_code
            var internal_lotnum = makeid();
            element(by.model('form.internal_lot_code')).sendKeys(internal_lotnum);
            element(by.id('set_lot_num')).click().then(function(){
              var current_lotnum = element(by.id('current_internal_lotnum'));
              expect(current_lotnum.isDisplayed()).toBeTruthy();  
              expect(current_lotnum.getText()).toContain(internal_lotnum);
              // creates a new row in the admin-view lots page 
              browser.get('#/terminal/0');
              var lot_row = element.all(by.repeater("lot in list.harvester_lot")).get(0);
              var lotinfo_cell = lot_row.all(by.tagName('td')).get(1);
              var lotinfo_cell_contents = lotinfo_cell.getText();
              expect(lotinfo_cell_contents).toContain(internal_lotnum);
              expect(lotinfo_cell_contents).toContain(new_vessel);
            });
          });
        }); 
      }); 
    });
  });

  it('clicking "Hide/Delete" removes supplier from list', function() {
    var new_vessel = generateOptionValue('fleet_vessel');

    filling_add_new_supplier_form( new_vessel, function(){
      //click 'Submit'
      element(by.id('submit-2')).click().then(function(){
        // fill search field
        element(by.model('searchText')).sendKeys(new_vessel).then(function(){
          expect(element.all(by.cssContainingText('.list_item_val', new_vessel)).count()).toEqual(1);
          element(by.buttonText('Hide/Delete')).click().then(function(){
            browser.switchTo().alert().accept();
            /*
            var ptor = protractor.getInstance();
            var alertDialog = ptor.switchTo().alert();
            alertDialog.accept();  // Use to accept (simulate clicking ok)
            //alertDialog.dismiss(); // Use to simulate cancel button
            */
            browser.sleep(100);
            expect(element.all(by.cssContainingText('.list_item_val', new_vessel)).count()).toEqual(0);
          });
        }); 
      }); 
    });
  });

});
