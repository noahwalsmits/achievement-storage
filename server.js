var http = require('http');
var mysql = require('mysql');

var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "" //TODO add a password to the database
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

queryDatabase("USE `taxi`");

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
        database.query("SELECT * FROM `destinations`", (err, result, fields) => {
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

http.createServer(onRequest).listen(3000);
console.log('server listening to port 3000');
