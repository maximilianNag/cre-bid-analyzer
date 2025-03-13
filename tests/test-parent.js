const fs = require("fs"); const path = require("path"); console.log("Parent directory:", path.resolve(__dirname, "..")); console.log("Files in parent directory:", fs.readdirSync(".."));
