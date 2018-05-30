const async  = require('async');
const AWS    = require('aws-sdk');
const config = require('./config');
const {exec} = require('child_process');

const route53 = new AWS.Route53({
    apiVersion: '2013-04-01'
});

//TODO: Write last successfully set IP to file
//TODO: Check if ip has changed from file.
    //- If yes or file does not exist, update route53
    //- If no, do nothing

async.waterfall([
    (next) => {
        exec('curl -s ipinfo.io/ip', next);
    },
    (ip, stderr, next) => {
        if(stderr) {
            console.error(stderr);
        }
        console.log('**', ip)
        next();
    }
], (err) => {
    if(err) {
        console.error(err);
    }else {
        console.log('Update successful');
    }
});
/*
const params = {
    ChangeBatch: {
        Changes: [{
            Action: "UPSERT", 
            ResourceRecordSet: {
                Name: "haigo.org",
                ResourceRecords: [{
                    Value: "74.199.55.152"
                }], 
                TTL: 300,
                Type: "A"
            }
        }],
        Comment: "DNS for ITX Server"
    }, 
    HostedZoneId: "Z3EVZUL5N5WGQ7"
};

route53.changeResourceRecordSets(params, (err, data) => {

});

*/