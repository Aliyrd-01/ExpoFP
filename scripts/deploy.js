const AWS = require("aws-sdk");

const credentials = new AWS.SharedIniFileCredentials({ profile: "efp-deploy-fp" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01", credentials });

console.log("Deploy to selected locations");

// Purge URL example:
// https://purge.jsdelivr.net/npm/jquery@3.2.1/AUTHORS.txt
const publicPath = "https://cdn.jsdelivr.net/npm/expofp2@1/";

const locations = ["expo"];
