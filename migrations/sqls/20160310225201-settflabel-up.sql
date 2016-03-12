
CREATE TABLE receive_lot
(
  serial_id integer NOT NULL DEFAULT nextval('lot_id_seq'::regclass),
  receive_code character varying,
  lot_number character varying,
  "timestamp" timestamp with time zone DEFAULT now(),
  station_code character varying,
  harvester_code character varying,
  received_from character varying,
  tf_code character varying,
  product_code character varying,
  harvest_date timestamp with time zone,
  CONSTRAINT rlot_pk PRIMARY KEY (serial_id),
  CONSTRAINT urlot UNIQUE (receive_code)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE receive_lot
  OWNER TO tuna_processor;
  
  
  
alter table box add column receive_code varchar;


alter table thisfish add column product_code varchar;
alter table thisfish add column label varchar;
alter table thisfish add column timestamp timestamp;

ALTER TABLE thisfish
    ALTER COLUMN timestamp TYPE timestamp with time zone;
    
    
ALTER TABLE thisfish ADD CONSTRAINT tfprod FOREIGN KEY (product_code) 
REFERENCES product (product_code);

    


CREATE VIEW group_codes AS 
 SELECT thisfish.lot_number,
    thisfish.label,
    array_agg(thisfish.tf_code ORDER BY thisfish.tf_code) AS codes,
    array_agg((thisfish.tf_code::text || ' : '::text) || product.product_type::text ORDER BY thisfish.tf_code) AS products
   FROM thisfish,
    product
  WHERE thisfish.product_code::text = product.product_code::text AND thisfish.label IS NOT NULL
  GROUP BY thisfish.label, thisfish.lot_number;

ALTER TABLE group_codes
  OWNER TO tuna_processor;
  

drop view if exists box_product;

CREATE OR REPLACE VIEW box_product AS 
 SELECT box.box_number,
    box.station_code,
    box.lot_number,
    box.weight,
    box.size,
    box.grade,
    box.shipping_unit_number,
    product.product_code,
    product.product_type,
    product.trade_unit,
    product.sap_item_code
   FROM box left join
    product
  ON box.product_code::text = product.product_code::text;

ALTER TABLE box_product
  OWNER TO tuna_processor;
