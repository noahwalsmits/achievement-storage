require('dotenv').config();

var http = require('http');
const PORT = process.env.PORT || 3000;

var mysql = require('mysql');
var database = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD, //TODO add a password to the database
    port: process.env.MYSQLPORT,
    database: process.env.MYSQLDATABASE
});

database.connect((err) => {
    if(err) {
        throw err;
    }
    console.log('connected to database!');
});

function queryDatabase(query) {
    console.log(query);
    database.query(query, (err, result) => {
        if(err) {
            throw err;
        }
        data = result;
    });
}

//this is called every time a http request to the server is made
function onRequest(request, response){
    response.setHeader('Access-Control-Allow-Origin', '*'); //this allows other sites to access the API

    //error handling
    request.on('error', (err) => {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', (err) => {
        console.error(err);
    });

    //echo back post messages
    if(request.method === 'POST' && request.url === '/echo') { 
        let body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            response.end(body);
        });
    } else if(request.method === 'GET') {
        database.query("SELECT * FROM `DebugTable`", (err, result, fields) => {
            if(err) {
                throw err;
            }
            response.end(JSON.stringify(result));
        });
    } else {
        response.statusCode = 404; //TODO add the other response codes
        response.end();
    }
}

http.createServer(onRequest).listen(PORT);
console.log('server listening to port ${PORT}');
