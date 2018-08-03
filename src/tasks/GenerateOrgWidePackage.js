var fs = require('fs');
var jsforce = require('../lib/JSForceConnection');
var fileIO = require('../utils/FileSystemIO');
const username = 'gauravsaraswat@appirio.com.training';
const password = 'vlocity@2018O03GtBIe0OerymihshdGzk1WO';
var folderMetadata = ['DocumentFolder','EmailFolder','ReportFolder','DashboardFolder'];


exports.allMetadataXML = function(){
    jsforce.createConnection(username,password).
    then(function(userinfo){
        if(!fs.existsSync('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json')){
            return jsforce.describeMetadata('43.0');
        }
        else{
            return fileIO.readFile('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json');
        }
    }).
    then(function(response){
        if(response.metadataObjects){
            var metadataObjArray = {};
            response.metadataObjects.forEach(element => {
                if(element && element.xmlName){
                    metadataObjArray[element.xmlName] = element;
                }
            });
            return fileIO.saveFileContent('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json',JSON.stringify(metadataObjArray));
        }
        else{
            return response;
        }
    }).
    then(function(response){
        this.mappingData = JSON.parse(response);
        if(fs.existsSync('PackageXml'+username+'.json')){
            return fileIO.readFile('PackageXml'+username+'.json');
        }
        else{
            console.log('Extracting Folders',folderMetadata);
            return jsforce.listMetadata(folderMetadata);
        }
    }).
    then(function(response){
        if(!fs.existsSync('PackageXml'+username+'.json')){
            console.log('fetching all parent metadata');
            return jsforce.listMetadata(this.mappingData,response);
        }
        else{
            return response;
        }
    }).
    then(function(response){
        if(fs.existsSync('PackageXml'+username+'.json')){
            this.parentMetadataRecords = JSON.parse(response);
        }
        else{
            this.parentMetadataRecords = response;
            console.log('saving parent metadata records..');
            return fileIO.saveFileContent('PackageXml'+username+'.json',JSON.stringify(response));
        }
    }).
    then(function(response){
        var metadata = Object.values(this.mappingData).map((type) => {
            return (
                type.childXmlNames ? type.xmlName : undefined
            )
        }).filter(function(n){return n;});
        return jsforce.readMetadataDuplicate(metadata,this.mappingData,this.parentMetadataRecords);
    }).
    then(function(response){
        this.childRecords = response;
        return jsforce.QueryAllRecordByObjectName('Layout','Id,Name,TableEnumOrId');
    }).
    then(function(response){
        var objectMap = {};
        this.parentMetadataRecords['CustomObject'].forEach(objRec => {
            objectMap[objRec.id] = objRec.fullName;
        });
        console.log(objectMap);
        var parentMetadataRecs = {};
        Object.keys(this.parentMetadataRecords).forEach(metadataName => {
            if(this.parentMetadataRecords[metadataName] != 'test'){
                parentMetadataRecs[metadataName] = this.parentMetadataRecords[metadataName].map(a => a.fullName);
            }
            else{
                parentMetadataRecs[metadataName] = 'test';
            }
        });
        parentMetadataRecs['Layout'] = [];
        response.forEach(element => {
            let objName = objectMap[element.TableEnumOrId] ? objectMap[element.TableEnumOrId] : element.TableEnumOrId;
            parentMetadataRecs['Layout'].push(objName + '.'+element.Name);
        });
        var newItem = Object.assign({}, parentMetadataRecs,this.childRecords);
        console.log('Final Moving With Child');
        return fileIO.saveFileContent('PackageXmlChild'+username+'.json',JSON.stringify(newItem));
    }).
    then(function(response){
        let xmlString = fileIO.convertToXML(JSON.parse(response));
        return fileIO.saveFileContent('Package.xml',xmlString);
    }).
    then(function(response){
        console.log('saved');
    }).
    catch(function(err){
        console.log(err);
    });
}