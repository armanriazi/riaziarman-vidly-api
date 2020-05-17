const winston = require("winston");
const fs = require("fs");
const result = require("dotenv").config();

if (result.error) {
  throw result.error;
}

const selectEnvironmet = () => {
  switch (process.env.NODE_VIDLY_ENV) {
    case "development":
      const envConfigDev = require("dotenv").parse(
        fs.readFileSync(".env.override.development")
      );
      for (const k in envConfigDev) {
        process.env[k] = envConfigDev[k];
        winston.info(process.env[k]);
      }
      break;
    case "production":
      const envConfigPro = require("dotenv").parse(
        fs.readFileSync(".env.override.production")
      );
      for (const k in envConfigPro) {        
        process.env[k] = envConfigPro[k];
        winston.info(process.env[k]);
      }
      break;
    case "stage":
      const envConfigStage = require("dotenv").parse(
        fs.readFileSync(".env.override.stage")
      );
      for (const k in envConfigStage) {
        process.env[k] = envConfigStage[k];
        winston.info(process.env[k]);
      }
      break;
  }
};


exports.selectEnvironmet = selectEnvironmet;