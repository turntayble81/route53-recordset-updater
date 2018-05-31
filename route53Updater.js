#!/usr/bin/env node

const async  = require('async');
const fs     = require('fs');
const AWS    = require('aws-sdk');
const config = require('./config');
const {exec} = require('child_process');

const route53 = new AWS.Route53({
    apiVersion: '2013-04-01'
});

const IP_FILE = `${__dirname}/.lastRecordsetIp`;

async.parallel([
    (pNext) => getCurrentIp(pNext),
    (pNext) => getLastRecordSetIp(pNext)
], (err, result) => {
    if(err) {
        return console.error(err);
    }
    let currentIp       = result[0];
    let lastRecordSetIp = result[1];

    currentIp       = sanitizeIP(currentIp);
    lastRecordSetIp = sanitizeIP(lastRecordSetIp);

    console.log(`Current IP    : ${currentIp}`);
    console.log(`Record set IP : ${lastRecordSetIp || 'unknown'}`);

    if(currentIp == lastRecordSetIp) {
        console.log('Record set IP is already up to date');
    }else {
        console.log('Updating record set');
        updateRecordSet(currentIp, (err) => {
            if(err) {
                console.error(err);
            }else {
                console.log('Successfully updated record set');
            }
        });
    }
});

function sanitizeIP(ip) {
    if(!ip) {
        return ip;
    }
    return ip.replace(/[^0-9.]/g, '');
}
function getCurrentIp(cb) {
    console.log('Determining current IP');
    exec('curl -s ipinfo.io/ip', (err, stdout, stderr) => {
        if(err) {
            return cb(err);
        }
        if(stderr) {
            console.error(stderr);
        }
        cb(null, stdout);
    });
}

function getLastRecordSetIp(cb) {
    console.log('Determining last known record set IP');
    fs.stat(IP_FILE, (err, stat) => {
        if(err) {
            if(err.code == 'ENOENT') {
                //file does not exist
                cb(null, null);
            }else {
                cb(err);
            }
            return;
        }

        fs.readFile(IP_FILE, {encoding: 'utf8'}, cb);
    });
}

function updateRecordSet(ip, cb) {
    const params = {
        ChangeBatch: {
            Changes: [{
                Action: "UPSERT", 
                ResourceRecordSet: {
                    Name: config.recordsetName,
                    ResourceRecords: [{
                        Value: ip
                    }], 
                    TTL: config.recordsetTTL,
                    Type: "A"
                }
            }],
            Comment: config.recordsetComment
        }, 
        HostedZoneId: config.hostedZoneId
    };

    async.series([
        (next) => route53.changeResourceRecordSets(params, next),
        (next) => fs.writeFile(IP_FILE, ip, next)
    ], cb);
}