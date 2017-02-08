'use strict';

var express = require('express'),
    MongoClient = require('mongodb').MongoClient;

var databaseURL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/demo';

var app = express();
app.get('/', function (req, res, next) {
    MongoClient.connect(databaseURL, function (err, db) {
        if (err) {
            next(err);
            return;
        }
        // insert a new record into the visits collection
        var collection = db.collection('visits');
        collection.insert([{
            message: 'Hello, world!',
            date: new Date()
        }], function (err, result) {
            if (err) {
                next(err);
                db.close();
                return;
            }
            console.log('inserted a new record in the visits collection');
            // fetch the latest 10 visits, sorted by date
            var cursor = collection.find().sort({'date': -1}).limit(10);
            // accumulate these and send as JSON when done
            var response = [];
            cursor.each(function (err, doc) {
                if (err) {
                    next(err);
                    db.close();
                    return;
                }
                if (doc == null) {
                    res.json(response);
                    db.close();
                    return;
                }
                response.push(doc);
            });
        });
    });
});

app.get('/ping', function (req, res) {
    res.send('pong\n');
});

var port = process.env.PORT || 8088;
app.listen(port, '0.0.0.0', function () {
    console.log('listening on port ' + port);
});
