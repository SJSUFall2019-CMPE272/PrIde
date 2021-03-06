var express = require('express');
var router = express.Router();
const axios = require('axios');
const config = require('../../../config/config')

/*
   * This api returns the schema_id and 
   * cred_def_id info
*/
router.post('/schema', (req, res) => {
    console.log(req.body);
 var {attributes, schema_name} = req.body;
 console.log(attributes)
 console.log(JSON.parse(attributes))
 attributes = JSON.parse(attributes);
 attributes.push("user_id");
 //console.log(['name','id','tin'])
 const request = {
     "attributes":attributes,
     "schema_name":schema_name,
     "schema_version":"1.0"
 } 
 var data = ""
 axios.post(config.issuerURL+'schemas',request,{
    headers: {
        'Content-Type': 'application/json',
    }
})
  .then(response => {
    data = response.data
     if(data.schema_id!="" && data.schema_id!=null){
         const cred_req = {
             "schema_id":data.schema_id,
             "tag":"default"
         }
        axios.post(config.issuerURL+'credential-definitions',cred_req,{
            headers: {
                'Content-Type': 'application/json',
            }})
            .then(response=>{
                res.send({
                    success:true,
                    data:{   
                        "schema_id":cred_req.schema_id,
                        "credential_definition_id":response.data.credential_definition_id
                        },
                    errMsg:""
                });
            })
            .catch(err=>{
                res.send({
                    success:false,
                    data:null,
                    errMsg:"Could not fetch credential definition info"
                })
            });
    } 
    //res.send(data);
  })
  .catch(error => {
    res.send({
        success:false,
        data:null,
        errMsg:"Could not create schema"
    })
  });

  //res.json(data)
});

router.post('/sendOffer',(req, res)=> {
    const credential_definition_id = req.body.credential_definition_id
    attributes = JSON.parse(req.body.attributes);
    console.log(attributes)
    //attributes.push("user_id");
    axios.get(config.issuerURL+'connections')    
    .then(response=>{
       console.log(response.data.results[0])
       const connection_id = response.data.results[0].connection_id;
       const request = {
                        "credential_preview": {
                        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
                        "attributes": attributes
                        /* [
                            {
                            "name": "score2",
                            
                            "value": "10"
                            },
                        {
                            "name": "passport_id2",
                            "value": "19"
                        }
                        ] */
                        },
                        "comment": "string",
                        "cred_def_id": credential_definition_id,
                        "connection_id": connection_id,
                        "auto_issue": true
                     }
        console.log(request)
        axios.post(config.issuerURL+'issue-credential/send-offer',request,{
            headers: {
                'Content-Type': 'application/json',
            }}).then(response=>{
                console.log(response.data);
                //res.send(response.data)
                res.send({
                    success:true,
                    data:response.data,
                    errMsg:""
                });

            })

         })
  /*  const request = {
        "credential_preview": {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
          "attributes": [
            {
              "name": "score",
              
              "value": "10"
            },
           {
             "name": "passport_id",
              "value": "19"
           }
          ]
        },
        "comment": "string",
        "cred_def_id": "Btso2j5Fy[   "name": "tin",                            
                            "value": "1sdadreger3424sddf0"
                        },

                        {
                            "name": "id",
                            "value": "1dsad9"
                        }

                        {
                            "name": "user_id",
                            "value": "1"
                        }

                        {
                       dxDQGR2UVqjVw:3:CL:22:default",
        "connection_id": "44aa2e35-f36e-4f3e-a29f-a76d42ae6ae8",
        "auto_issue": true
      } */
});

var getAttributes = (schema_ids) => {
    var schemaAttributes=[];  
    var promises = [];
    return new Promise((resolve, reject) => {
        for(schema_id of schema_ids) {
            // console.log(schema_id+" --")
            promise = new Promise((resolve, reject) => {
                axios.get(config.issuerURL+'schemas/'+schema_id).then((resp) => {
                    const cred_req = {
                       "schema_id":resp.data.schema_json.id,
                       "tag":"default"
                    }
                    axios.post(config.issuerURL+'credential-definitions',cred_req,{
                        headers: {
                            'Content-Type': 'application/json',
                    }}).then(response=>{
                        // console.log(response.data)
                        // console.log(resp.data.schema_json)
                        var tempjson = {
                            'schema_id': resp.data.schema_json.id,
                            'attributes': resp.data.schema_json.attrNames,
                            'schema_name': resp.data.schema_json.name,
                            'credential_definition_id': response.data.credential_definition_id
                        }
                        //console.log(tempjson)
                        if (tempjson.schema_name != "degree schema")
                          schemaAttributes.push(tempjson);
                        resolve();
                        console.log(schemaAttributes)
                        console.log("*******************************************")
                    });
               });
            });
            promises.push(promise)
        }
        Promise.all(promises).then(values => {
            resolve(schemaAttributes);
        })
    }) 
}
router.get('/schemaAttributes',(req,res) => {
    var schema_ids=[];
    
    //var promises = []
    axios.get(config.issuerURL+'schemas/created')
    .then(response => {
       
        schema_ids = response.data.schema_ids;
        //console.log(schema_ids)
        getAttributes(schema_ids).then((result)=>{
            res.send(result);
        })
      
})
});

module.exports = router;