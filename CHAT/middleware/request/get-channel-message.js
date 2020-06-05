const node_validator = require('node-input-validator')

var { Validator } = node_validator


module.exports.VALIDATE_GET_CHANNEL_MESSAGE = async function( req, res, next ){
    
    let validate = new Validator(req.body, {
        access             : "required",
        browser            : "required",
        browserMajorVersion: "required",
        browserVersion     : "required",
        os                 : "required",
        osVersion          : "required"
    },{
        'userId.required'             : res.__("userId is required"),
        'access.required'             : res.__("Access is valid"),
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