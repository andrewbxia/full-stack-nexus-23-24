const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../files/.env")});

const BASE_URL = process.env.BASE_URL;

console.log("BASE_URL: " + BASE_URL);

module.exports = BASE_URL;