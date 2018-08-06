var str = require('../tasks/GenerateOrgWidePackage');


str.allMetadataXML();

// then(function(userinfo){
//     if(!fs.existsSync('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json')){
//         return jsforce.describeMetadata('43.0');
//     }
//     else{
//         return fileIO.readFile('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json');
//     }
// }).
// then(function(response){
//     if(response.metadataObjects){
//         var metadataObjArray = {};
//         response1.metadataObjects.forEach(element => {
//             if(element && element.xmlName){
//                 metadataObjArray[element.xmlName] = element;
//             }
//         });
//         return fileIO.saveFileContent('/Users/gaurav/devops/src/utils/MetadataMappingV'+43+'.json',JSON.stringify(metadataObjArray));
//     }
//     else{
//         return response;
//     }
// }).
// then(function(response){
//     this.mappingData = JSON.parse(response);
//     console.log('extracting Folders',folderMetadata);
//     if(fs.existsSync('PackageXml.json')){
//         return fileIO.readFile('PackageXml.json');
//     }
//     else{
//         return jsforce.listMetadata(folderMetadata);
//     }
// }).
// then(function(response){
//     if(fs.existsSync('PackageXml.json')){
//         return jsforce.listMetadata(this.mappingData,response);
//     }
//     else{
//         return response;
//     }
// }).
// then(function(response){
//     this.parentMetadataRecords = response;
//     console.log(Object.keys(this.parentMetadataRecords));
//     var metadata = Object.values(this.mappingData).map((type) => {
//         return (
//             type.childXmlNames ? type.xmlName : undefined
//         )
//     }).filter(function(n){return n;});
//     return jsforce.readMetadataDuplicate(metadata,this.mappingData,this.parentMetadataRecords);
// }).
// then(function(response){
//     var newItem = Object.assign({}, this.mappingData,response);
//     console.log('Final Moving With Child');
//     return fileIO.saveFileContent('PackageXmlChild.json',JSON.stringify(newItem));
// }).
// then(function(response){
//     console.log('moved');
// }).
// catch(function(err){
//     console.log(err);
// });