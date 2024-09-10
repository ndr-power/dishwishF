# Dish & Wish


## Installation instructions

Project was deployed on [render.com](https://render.com) which is a free cloud hosting. 
It is still possible to run it locally.

### Install MongoDB

The easiest way to install Mongo is to follow their official website documentation
[MongoDB Installation](https://www.mongodb.com/docs/manual/installation/)
### Back-end

 1. Install dependencies (run from project root folder)
 `$ npm run install-server`
 2. Create **.env** file in the **/backend** folder and set following variables:
  `COOKIE_SECRET=12345`
`MONGO_URL=mongodb://localhost:27017`
`SERVER_PORT=5000`
 3. Run the server (also from project root folder):
 `npm run start-server`