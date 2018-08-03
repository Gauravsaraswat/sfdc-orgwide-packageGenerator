var path = require('path');
var fs = require('fs');
var stream = require('stream')
var es = require('event-stream');
var builder = require('xmlbuilder');

class FileSystemIO{

    constructor(){
        this.backupDir = '/Users/gaurav/SFDX/DevOrg/metadata/BackUp';
    }

    createBackup(fileName){
        console.log('Copying Started of-> ' +fileName + ' to ' + path.dirname(fileName).replace('/unpackaged/','/BackUp/')+'/'+path.basename(fileName));
        return new Promise(function(resolve,reject){
            var reqStream = fs.createReadStream(fileName).pipe(fs.createWriteStream(path.dirname(fileName).replace('/unpackaged','/BackUp')+'/'+path.basename(fileName)));
            reqStream.on('finish', function () { resolve() });
        });
    }
    

    readFile(fileName){
        return new Promise(function(resolve,reject){
            var returnTxt = '';
            var s = fs.createReadStream(fileName)
            .pipe(es.split())
            .pipe(es.mapSync(function(line){
                    s.pause();
                    returnTxt += line;        

                    s.resume();
                })
                .on('error', function(){
                    console.log('Error while reading file.');
                })
                .on('end', function(){
                    console.log('Read entire file.');
                    resolve(returnTxt);
                })
            );
        });
    }

    saveFileContent(fileName,StringContent){
        return new Promise(function(resolve,reject){
            fs.writeFile(fileName, StringContent, function (err) {
                if (err) throw err;
                resolve(StringContent);
            });
        });
    }

    matchFileContent(SourceFileName, StringToCompare){
        return new Promise(function(resolve,reject){
            fs.createReadStream(SourceFileName).on('data', (chunk) => {
                resolve(StringToCompare.replace(/\s/g, "") == `${chunk}`.replace(/\s/g, ""));
            });
        });
    }

    converToArray(jsonData){
        if(!Array.isArray(jsonData)){
            return [jsonData];
        }
        else{
            return jsonData;
        }
    }

    convertToXML(jsonData){
        var build = builder.create('Package', { encoding: 'utf-8' })
        .att('xmlns', 'http://soap.sforce.com/2006/04/metadata');
        let parentObj = jsonData;
        Object.keys(parentObj).forEach(metadataType => {
            if(parentObj[metadataType] == 'test'){
                return;
            }
            build = build.ele('types');
            console.log(metadataType);
            parentObj[metadataType].forEach(memberRec => {
                build = build.ele('members', memberRec).up();
            });
            build = build.ele('name', metadataType).up().up();
        });
        return build.end({ pretty: true});
    }
}

module.exports = new FileSystemIO();