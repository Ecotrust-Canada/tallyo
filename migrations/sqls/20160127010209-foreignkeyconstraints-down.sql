/* Replace with your SQL commands */
ALTER TABLE box DROP CONSTRAINT boxlot;
ALTER TABLE box DROP CONSTRAINT boxharvester;
ALTER TABLE box DROP CONSTRAINT boxship;
ALTER TABLE box DROP CONSTRAINT boxproduct;

ALTER TABLE loin DROP CONSTRAINT loinlot;
ALTER TABLE loin DROP CONSTRAINT loinbox;

ALTER TABLE lot DROP CONSTRAINT lotharvester;
ALTER TABLE lot DROP CONSTRAINT lotship;

ALTER TABLE scan DROP CONSTRAINT scanlot;
ALTER TABLE scan DROP CONSTRAINT scanship;
ALTER TABLE scan DROP CONSTRAINT scanbox;
ALTER TABLE scan DROP CONSTRAINT scanloin;


ALTER TABLE lot DROP CONSTRAINT ulot;
ALTER TABLE box DROP CONSTRAINT ubox;
ALTER TABLE harvester DROP CONSTRAINT uharvester;
ALTER TABLE shipping_unit DROP CONSTRAINT uship;
ALTER TABLE product DROP CONSTRAINT uproduct;
ALTER TABLE loin DROP CONSTRAINT uloin;
