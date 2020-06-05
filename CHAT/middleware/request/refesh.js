const node_validator = require('node-input-validator')

var { Validator } = node_validator


module.exports.VALIDATE_REFESH = async function( req, res, next ){
    
    let validate = new Validator(req.body, {
        userId             : "required",
        refesh             : "required",
        browser            : "required",
        browserMajorVersion: "required",
        browserVersion     : "required",
        os                 : "required",
        osVersion          : "required"
    },{
        'userId.required'             : res.__("userId is required"),
        'refesh.required'                : res.__("Refesh is valid"),
        'password.required'           : res.__("Password is required"),
        'browser.required'            : res.__("Detect format valid"),
        'browserMajorVersion.required': res.__("Detect format valid"),
        'browserVersion.required'     : res.__("Detect format valid"),
        'os.required'                 : res.__("Detect format valid"),
        'osVersion.required'          : res.__("Detect format valid")
    });
     
    var matched = await validate.check()
    if (!matched) {
        req.error = validate.errors
    }
    next();
}