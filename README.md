# Tally-O

Open source Fish Plant data collection software, geared towards generating traceable data.

```
git clone https://github.com/Ecotrust-Canada/scanthis
```


### Installation

Install the latest stable version of node v4 (ie, v4.4.0) . We recommend using [nvm](https://github.com/creationix/nvm) for this.

Install environmental dependencies using npm
```
npm install -g nodemon
npm install -g bower
npm install -g db-migrate
npm install -g forever
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
sudo -u postgres createuser -P -s -e tuna_processor
sudo -u postgres psql -c "ALTER role tuna_processor superuser;"
```
when prompted, input password 

create an empty database:
```
sudo -u postgres createdb -O tuna_processor [dbname]
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
From the main Tally-O project folder, navigate to the deploy subfolder, then build the docker image using the command:
```
./postgrest_build.sh
```
Then run a docker image with options.
fill in docker image name, port to run database on, ip address of server, database name and password for the postgres user:

```
docker run --name [name this docker service] -p [port]:3000  -e POSTGREST_DBHOST=[server ip] -e POSTGREST_DBPORT=5432 -e POSTGREST_DBNAME=[dbname] -e POSTGREST_DBUSER=tuna_processor -e POSTGREST_DBPASS=[password] -d postgrest-ec
```

### Configuration
navigate to scanthis/public/js

clone
```
https://gitlab.ecocloud.ca/ecotrust/configs.git
```

files include:
```
list_config.js
form_config.js
label_config.js
templatelocal.js
app_config_[].js for each processor 
```
copy templatelocal.js as app_config_[]_local.js.
uncomment and set globalurl (database url as set in docker image), port to run application on, and hwurls (urls for printers and scales).  Need to set any printer or scale urls that are referenced in app_config file

Navigate to /scanthis.
Start the app with this configuration by running
```
forever start app.js app_config_[]
```


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

For now, after running protractor tests, I need manually delete formoptions and latest lots and harvesters with harvester_code, 
obtained by running query:
```
select harvester_code from harvester where active='f';
```
