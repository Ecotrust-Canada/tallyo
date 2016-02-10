# ScanThis

Open source Fish Plant data collection software, geared towards generating traceable data.

```
git clone https://github.com/Ecotrust-Canada/scanthis
```


### Installation

Install the latest stable version of node v4 (ie, v4.0.0) . We recommend using [nvm](https://github.com/creationix/nvm) for this.

Install environmental dependencies using npm
```
npm install -g nodemon
npm install -g bower
npm install -g db-migrate
```

Then, install package dependencies:
```
cd scanthis
npm install
bower install
```

### Database Setup

Install postgreSQL

create a user:
```
sudo -u postgres createuser -P -s -e [user]
sudo -u postgres psql -c "ALTER role [user] superuser;"
```
when prompted, input password 

create an empty database:
```
sudo -u postgres createdb -O [user] [dbname]
```


copy template_database.json as database.json

Edit the environment name, database name, user and password

You can add multiple databases with different environment names

then run:
```
db-migrate up -e [environment name]
```

Database should now have correct schema

###PostgREST  (with docker)
The app communicates with the database via a REST API

install docker as per instructions: https://docs.docker.com/engine/installation/linux/ubuntulinux/
then:
```
sudo service docker start
sudo groupadd docker
sudo usermod -aG docker [linux user]
```
clone docker image files and navigate to correct folder

To build the docker image:
```
./run.sh
```
Then run a docker image with options:
```
docker run --name [name this docker service] -p [port]:3000  -e POSTGREST_DBHOST=[server ip] -e POSTGREST_DBPORT=5432 -e POSTGREST_DBNAME=[] -e POSTGREST_DBUSER=[user] -e POSTGREST_DBPASS=[password] -d postgrest-ec
```

### Configuration
Config files should go in scanthis/public/js/configs

files include:
```
list_config.js
form_config.js
app_config.js
app_config_local.js
```

list_config.js and form_config.js contain options for specific forms, list, dropdown menus, etc

app_config.js specifies the type and any options for each terminal

app_config_local.js contains the url for the database as well as the port to run the app on

Add multiple configurations by adding additional config and config_local files

For example, app_config_v2.js and app_config_v2_local.js

Start the app with this configuration by running
```
npm start app_config_v2
```

### Starting the Node Server
```
npm start
```

### Running the project on a virtual machine

You run the project in VM environment using Vagrant. To do so, checkout out: https://github.com/Ecotrust-Canada/scanthis-vagrant



###postgREST without Docker
download postgREST

https://github.com/begriffs/postgrest/releases/download/v0.3.0.1/postgrest-0.3.0.1-ubuntu.tar.xz

un-tar:
```
tar xvf postgrest-0.3.0.1-ubuntu.tar.xz
```
and run on database/user created earlier:
```
./postgrest postgres://[user]:[password]@localhost:5432/[database name] --port 3000 --schema public --anonymous [user] --pool 200
```
###Examples of running protractor tests:


```
npm run-script protractor -- --baseUrl='http://localhost:8002/'
```
```
npm run-script protractor -- --baseUrl='http://localhost:8002/' --specs e2e-tests/harsam.js
```
```
protractor e2e-tests/protractor.conf.js --baseUrl='http://localhost:8002/'  --specs e2e-tests/harsam.js
```

For now, after running ptotractor tests, I need manually delete formoptions and latest lots and harvesters with harvester_code, 
obtained by running query:
```
select harvester_code from harvester where active='f';
```
