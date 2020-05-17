const express = require("express");
const cool = require('cool-ascii-faces');
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const winston = require("winston");
require("./startup/logging");
const env = require("./startup/environment");
require("./startup/routes")(app);
const {createDb}=require("./startup/db");
require("./startup/config")();
require("./startup/validation")();

//check connection
createDb();
//middelware
app.use(bodyParser.json());
// environment
env.selectEnvironmet();

app.get('/cool', (req, res) => res.send(cool()));

const port = process.env.SERVER_VIDLY_PORT || 3060;
app.listen(port, process.env.SERVER_VIDLY_IP, () =>
  winston.info(`Listening on port ${port}...`)
);

// comments
// const port = process.env.SERVER_VIDLY_PORT || 3061;
// // is NODE_ENV set to "development"?
// //const DEVMODE = process.env.NODE_ENV === "development";
// winston.info(
//   `application started in ${process.env.NODE_ENV} mode on port ${port}`
// );
