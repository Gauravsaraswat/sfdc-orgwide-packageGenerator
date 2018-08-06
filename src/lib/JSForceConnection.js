"use strict";
var jforce = require('jsforce');
const mapping = require('../utils/MetadataMapping');
var fileIO = require('../utils/FileSystemIO');


class JSForce{

    constructor(){
        this.con = new jforce.Connection({
            // you can change loginUrl to connect to sandbox or prerelease env.
            loginUrl : 'https://login.salesforce.com'
        });
    }

    createConnection(username,password){
        return this.con.login(username, password);
    }

    QueryAllRecordByObjectName(ObjectName,fieldToQuery){
        return this.QueryRecordByFields(ObjectName,{},fieldToQuery);
    }

    QueryRecordByObjectNameForApexCode(ObjectName,RecordName){
        return this.QueryRecordByFields(ObjectName,{'Name':RecordName},'Id,Body');
    }

    describeMetadata(version){
        let con = this.con;
        return new Promise(function(resolve,reject){
            con.metadata.describe(version,function(err,response){
               if(err){
                   reject(err);
               }
               resolve(response);
            });
        });
    }

    listMetadata(metadataMapping,folderNamesMapping){
        let con = this.con;
        return new Promise(function(resolve,reject){
            var metadataXmlMap = {};
            var countIndex = 0;
            var finishIndex = 0;
            var metadataMappingArray = Array.isArray(metadataMapping) ? metadataMapping : Object.keys(metadataMapping);
            metadataMappingArray.forEach(metadataType => {
                var types = [];
                if(folderNamesMapping && folderNamesMapping[mapping['FolderMapping'][metadataType]]){
                    folderNamesMapping[mapping['FolderMapping'][metadataType]] = fileIO.converToArray(folderNamesMapping[mapping['FolderMapping'][metadataType]]);
                    folderNamesMapping[mapping['FolderMapping'][metadataType]].forEach(folderData => {
                        types.push({type: metadataType, folder: folderData.fullName });
                    });
                }
                else{
                    types = [{type: metadataType, folder: null }];
                }
                for(let i=0;i<types.length;i++){
                    finishIndex++;
                    console.log(finishIndex);
                    con.metadata.list(types[i], '43.0', function(err, metadata) {
                        countIndex++;
                        if(!metadata){
                            if(!metadataXmlMap[metadataType]){
                                metadataXmlMap[metadataType] = 'test';
                            }
                        }
                        else{
                            metadata = Array.isArray(metadata) ? metadata : [metadata];
                            //var metadata = metadata.map(a => a.fullName);
                            if(err){
                                reject(err);
                            }
                            if(metadataXmlMap[metadataType] && metadataXmlMap[metadataType] != 'test'){
                                metadataXmlMap[metadataType] = metadataXmlMap[metadataType].concat(metadata);
                            }
                            else{
                                metadataXmlMap[metadataType] = metadata;
                            }
                        }
                        
                        if(countIndex == finishIndex){
                            resolve(metadataXmlMap);
                        }
                    });
                }
            });
        });
    }


    readMetadataDuplicate(parentMetadataList,metadataMappings,parentMetadataDetails){
        let con = this.con;
        return new Promise(function(resolve,reject){
            let countIndex = 0;
            let finishIndex = 0;
            parentMetadataList = fileIO.converToArray(parentMetadataList);
            parentMetadataList.forEach(metadataParent => {
                var parentsToRead = parentMetadataDetails[metadataParent];
                var parentMetadataMap = {};
                parentsToRead = fileIO.converToArray(parentsToRead);
                for(let i=0;i<parseInt(parentsToRead.length/10)+1;i++){
                    let startIndex = i*10;
                    let endIndex = (i*10 + 9 ) < parentsToRead.length ? (i*10 + 9 ) :parentsToRead.length; 
                    startIndex = startIndex == endIndex ? startIndex - 1 : startIndex;
                    var metadataRecs = parentsToRead.slice(startIndex,endIndex).map(a => a.fullName);
                    finishIndex++;
                    console.log('initialized '+metadataParent + 'with' + startIndex + '-->' +endIndex);
                    con.metadata.read(metadataParent, metadataRecs, function(err, metadata) {
                        console.log('Fetched '+metadataParent + 'with' + startIndex + '-->' +endIndex);
                        countIndex++;
                        console.log('countIndex'+countIndex);
                        console.log('finishIndex'+finishIndex);
                        if (err) { console.error(err); }
                        if(metadata){
                            metadata = fileIO.converToArray(metadata);
                            for (let j=0; j < metadata.length; j++) {
                                let parentchildrens = metadataMappings[metadataParent].childXmlNames;
                                for(let childKey in parentchildrens){
                                    if(!metadata[j][childKey]){
                                        continue;
                                    }
                                    if(!Array.isArray(metadata[j][childKey])){
                                        metadata[j][childKey] = [metadata[j][childKey]];
                                    }
                                    for(let k=0;k<metadata[j][childKey].length;k++){
                                        if(!parentMetadataMap[parentchildrens[childKey].typeName]){
                                            parentMetadataMap[parentchildrens[childKey].typeName] = [];
                                        }
                                        parentMetadataMap[parentchildrens[childKey].typeName].push(metadata[j].fullName+'.'+metadata[j][childKey][k][parentchildrens[childKey].name]);
                                    }
                                }
                            }
                        }
                        if(countIndex == finishIndex){
                            resolve(parentMetadataMap);
                        }
                    });
                }
            });
        });
    }


    QueryRecordByFields(ObjectName,fieldValuesMap,fieldToQuery){
        let con1 = this.con;
        return new Promise(function(resolve,reject){
            con1.tooling.sobject(ObjectName).find(fieldValuesMap,fieldToQuery).execute(function(err, records){
                resolve(records);
            });
        });
    }



}


module.exports = new JSForce();