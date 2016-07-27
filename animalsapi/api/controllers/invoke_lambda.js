'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
 */

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.
 It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var http = require('http');
var AWS = require('aws-sdk');
var apigee = require('apigee-access');
var lambda;

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.
 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.
 Either:
 - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
 - Or the operationId associated with the operation in your Swagger document
 In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
 we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    postAnimal: post_animal,
    getAnimal: get_animal
};

//get the aws access details from the apigee vault
var envVault = apigee.getVault('animals-demo', 'environment');
envVault.get('aws_access_key', function(err, secretValue) {
    console.log('The deployment mode is ' + apigee.getMode());
    console.log('Retrieved aws_access_key from the vault.');
    AWS.config.accessKeyId = secretValue;

    envVault.get('aws_secret_key', function(err, secretValue) {
        console.log('Retrieved aws_secret_key from the vault.');
        AWS.config.secretAccessKey = secretValue;

        envVault.get('aws_region', function(err, secretValue) {
            AWS.config.region = secretValue;
            console.log('Retrieved ' + AWS.config.region + ' region from the vault.');

            lambda = new AWS.Lambda();
        });
    });
});


/*
 Call the lambda function passing in the required values
 */
function invoke_lambda(req, res, lambdaFunction, action) {

    console.log(action + ' called, with body ' + JSON.stringify(req.body));
    if (req.body) { var payload = req.body }
    else if (req.body)

    console.log("lambdaFunction is " + lambdaFunction);

    var params = {
        FunctionName: lambdaFunction,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(req.body)
    };

    //Invokes Lambda function
    lambda.invoke(params, function(err, data) {
        if (err) { console.log("Error: for lambda", err); }
        else {

            if (/.*Bad request.*/.test( JSON.stringify(data) ) ){
                console.log("BAD REQUEST");
                res.status(400);
                res.send({"code": "4000", "message": "ERROR: Bad request"})
            } else if (/.*Duplicate.*/.test( JSON.stringify(data) ) ) {
                console.log("CONFLICT REQUEST");
                res.status(409);
                res.send({"code": "4090", "message": "ERROR: Duplicate request" })
            } else if (/.*Received.*/.test( JSON.stringify(data) ) ) {
                console.log("Received");
                res.status(202)
            }

            console.log("Response:" + JSON.stringify(data));
            res.json(JSON.parse(data.Payload));
        }
    });
}

function post_animal(req, res) {
    invoke_lambda(req, res, "post-animals", "postAnimal");
}

function get_animal(req, res) {
    invoke_lambda(req, res, "get-animals", "getAnimal");
}
