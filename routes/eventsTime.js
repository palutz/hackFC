var mongo = require('mongodb');
 
var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;
 
var server = new Server('ds027748.mongolab.com', 27748, {auto_reconnect: false});
db = new Db('hackfc', server);

console.log('new db');
db.open(function(err,db){
    console.log('db open');
    if(db){
        db.authenticate("hackfc", "hackfc",function(err2,data2){
            console.log('db auth');
            if(data2){
                console.log('data2');
                db.collection('events', function(err, collection) {
                    if (err) {
                        console.log("COLLECTION doesn't exist!");
                    }
                }); 
            } else {
               console.log("err2" + err2);
            }
        });
    }
    else{
        console.log('err' + err);
    }
});

// API /api/findAggregate/:datestart/:dateend GET
exports.findAggregate = function(req, res) {
    var dstart = parseFloat(req.params.datestart);
    var dend = parseFloat(req.params.dateend);
    db.collection('events', function(err, collection) {
        if(!err || collection) {
            collection.aggregate([
               { $match: { ts: { $gte : dstart, $lte: dend } } },
               { $group: { _id : "$ts", count : { $sum : "$amount" }}},
               { $sort : { _id : -1 }}
            ], function(err2, result) {
                //console.log("result " + result);
                if(!err || result) {
                    ret = [];
                    //console.log("length " + result.length);
                    for (var i = 0; i < result.length; i++)
                        ret.push([result[i]._id, result[i].count]);

                    res.send(ret);
                }
                else
                    console.log(err2);
            });
        } else
            console.log(err);
    });
}


// API /api/eventsTime/:evType/:datestart/:dateend GET
exports.findByTypeDate = function(req, res) {
    var evtype = req.params.type;
    var dstart = parseFloat(req.params.datestart);
    var dend = parseFloat(req.params.dateend);
    
    console.log(evtype + " " + dstart + " " + dend);
    db.collection('events', function(err, collection) {
        console.log('findbydate');
        // collection.findOne({}, function(err, item) {
        //     console.log('findbyone');
        //     if(err)
        //         console.log(err);

        //     res.send(item);
        // });
        ret = [];
        if(dstart && dend)
            var stream = collection.find({ 'ev_type' : evtype, 'ts' : { $gte : dstart, $lte: dend } }).stream();
        else 
            var stream = collection.find({ 'ev_type' : evtype }).stream();
        stream.on("data", function(item) {
            ret.push(item);
            console.log(item)
        });
        stream.on("end", function() {
            res.send(ret);
        });
        // var i = 0;
        // collection.find({ 'ev_type' : evtype }, {'limit' : 200} , (function(err, docs) {
        //     if(err || !docs)
        //         console.log("No data found");
        //     else 
        //         docs.each( function(doc) {
        //             i = i + 1;
        //             console.log(i + " " + doc);
        //         });
        // }));

    });
  
};

// API /api/eventsTime/:datestart/:dateend GET
exports.findByDate = function(req, res) {
    var dstart = parseFloat(req.params.datestart);
    var dend = parseFloat(req.params.dateend);
    
    console.log(dstart + " " + dend);
    db.collection('events', function(err, collection) {
        console.log('findbydate');
        ret = [];
        var stream = collection.find({ 'ts' : { $gte : dstart, $lte: dend }  }).stream();
        stream.on("data", function(item) {
            ret.push(item);
            console.log(item)
        });
        stream.on("end", function() {
            res.send(ret);
        });
        // var i = 0;
        // collection.find({ 'ev_type' : evtype }, {'limit' : 200} , (function(err, docs) {
        //     if(err || !docs)
        //         console.log("No data found");
        //     else 
        //         docs.each( function(doc) {
        //             i = i + 1;
        //             console.log(i + " " + doc);
        //         });
        // }));

    });
  
};