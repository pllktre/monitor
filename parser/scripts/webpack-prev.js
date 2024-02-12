const fs = require( "fs" )
const dir = "dist/components/"

fs.renameSync( dir + "http.js", dir + "http_webpack.js" )
fs.renameSync( dir + "http_ex.js", dir + "http.js" )