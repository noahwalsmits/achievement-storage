require('dotenv').config();
const url = require('url');

const http = require('http');
const PORT = process.env.PORT || 3000;

const mysql = require('mysql2');
const database = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    port: process.env.MYSQLPORT,
    database: process.env.MYSQLDATABASE
});

database.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('connected to database!');
});

//this is called every time a http request to the server is made
function onRequest(request, response) {
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

    let requestPath = url.parse(request.url).pathname;
    let requestParameters = url.parse(request.url, true).query;

    //echo back post messages
    if (requestPath === '/echo' && request.method === 'POST') {
        let body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            response.end(body);
        });
    } else if (requestPath === '/achievementsByGame' && request.method === 'GET') {
        handleAchievementsByGameRequest(requestParameters.appId, response);
    } else {
        //request could not be handled
        response.statusCode = 400;
        response.end();
    }
}

function handleAchievementsByGameRequest(appId, response) {
    console.log('requested achievements for appId %d', appId);
    database.query(
        'SELECT displayName, description, iconUrl, unlockPercentage FROM Achievement WHERE gameAppId = ' + appId,
        (err, result) => {
            if (err) {
                console.warn(err);
                response.statusCode = 400;
                response.end();
                return;
            }
            //if empty array fill database using steam api and run this function again
            response.end(JSON.stringify(result));
        }
    );
}

function requestGameAchievements(appId) {
    //request achievements using steam api and put them in the database
}

http.createServer(onRequest).listen(PORT);
console.log('server listening to port %d', PORT);
