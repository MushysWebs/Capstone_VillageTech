# Capstone_VillageTech

~-~ Creating the Database ~-~
CREATE DATABASE capstone;

CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
last_login TIMESTAMP
);

~-~ Server side ~-~

cd server {change drives to server to install necessary dependancies}

npm init -y {Creates package.json}

npm install express {installs express}

Create .env file (
PORT = 3007 # Port number for the server

PGUSER=postgres {or your database user if you've made one}
PGPASSWORD={Your postgres password}
PGHOST=localhost
PGPORT=5432
PGDATABASE=myprojects
)

npm install nodemon {nodemon autosaves and reloads server when changes are made}

npm install express pg dotenv {manage envrionment variables}

npm install bcrypt {encrypts and hashs the password for saftey reason}

npm nodemon server.js {Starts the server}
npm start {starts the nodemon server after updating package.json scripts with the start script below}
"scripts": {
"start": "nodemon server.js"
},

~-~ client side ~-~
npm install create-react-app -g {installs the plugin to create app}

npx create-react-app . {Installs node modules client side}
