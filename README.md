[![codecov](https://codecov.io/github/MushysWebs/Capstone_VillageTech/graph/badge.svg?token=Y5OY005Q3W)](https://codecov.io/github/MushysWebs/Capstone_VillageTech)


# July 25, 2024
AuthGuard has been implemented please run this command on server side to install jsonwebtoken

~-~ server side ~-~<br>
npm install<br>

# Capstone_VillageTech

## ~-~ Server side ~-~

cd server {change drives to server to install necessary dependancies}<br>

npm init -y {Creates package.json}<br>

npm install express {installs express}<br>

## Create .env file <br>
PORT = 3007 # Port number for the server<br>

PGUSER=postgres {or your database user if you've made one}<br>
PGPASSWORD={Your postgres password}<br>
PGHOST=localhost<br>
PGPORT=5432<br>
PGDATABASE=myprojects<br>
)

npm install nodemon {nodemon autosaves and reloads server when changes are made}<br>
npm install express pg dotenv {manage envrionment variables}<br>
npm install bcrypt {encrypts and hashs the password for saftey reason}<br>
npm nodemon server.js {Starts the server}<br>

npm start {starts the nodemon server after updating package.json scripts with the start script below}
"scripts": {<br>
"start": "nodemon server.js"<br>
},<br>

## ~-~ client side ~-~
npm install {install npm dependencies}<br>
npm install create-react-app -g  {installs the plugin to create app}<br>
npm install axios {For making https request}<br>
npm install cors {middleware}<br>
npx create-react-app . {Installs node modules client side}<br>
