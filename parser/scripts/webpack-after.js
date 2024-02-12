const fs = require( "fs" )
const dir = "dist/components/"

fs.renameSync( dir + "http.js", dir + "http_ex.js" )
fs.renameSync( dir + "http_webpack.js", dir + "http.js" )