# ScanThis

Open source Fish Plant data collection software, geared towards generating traceable data.

```
git clone https://github.com/Ecotrust-Canada/scanthis
```

### Installation

Install node v4.0.0. We recommend using [nvm](https://github.com/creationix/nvm) for this. Then, install package dependencies:

```
cd scanthis
npm install
bower install
```

Install nodemon using npm
```
npm install -g nodemon
```

### Starting the Node Server
```
npm start
```

### Running the project on a virtual machine

You run the project in VM environment using Vagrant. To do so, checkout out: https://github.com/Ecotrust-Canada/scanthis-vagrant

### Database Setup

Install postgreSQL

create a user:
```
sudo -u postgres createuser -P -s -e [user]
```
when prompted, input password 

create database from schema:
```
sudo -u postgres createdb -O [user] [database name]
sudo -u postgres pg_restore -i -d [database name] st.dump
```

download postgREST

https://github.com/begriffs/postgrest/releases/download/v0.3.0.1/postgrest-0.3.0.1-ubuntu.tar.xz

un-tar:
```
tar zxf postgrest-0.3.0.1-ubuntu.tar.xz
```
and run on database/user created earlier:
```
postgrest --db-host localhost --db-port 5432 --db-name [database] --db-user [user] --db-pass [password] --db-pool 200 --anonymous [user] --port 3000 --v1schema public
```
