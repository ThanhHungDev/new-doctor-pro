const node_validator = require('node-input-validator')

node_validator.extend('browserVersion', ({ value, args }, validator) => {
    if (args.length) {
        throw new Error('Invalid seed for rule browserVersion');
    }
    if(value.length > args[0] + 1 ){
        return false
    }
    // var email = validator.inputs['email']
   
    return value.match(/^([0-9 \.]+)$/)
});
var { Validator } = node_validator


module.exports.VALIDATE_LOGIN = async function( req, res, next ){
    
    let validate = new Validator(req.body, {
        email              : 'required|email',
        password           : 'required',
        browser            : "required",
        browserMajorVersion: "required",
        browserVersion     : "required|browserVersion",
        os                 : "required",
        osVersion          : "required"
    },{
        'email.required'               : res.__("Email is required"),
        'email.email'                  : res.__("Email is valid"),
        'password.required'            : res.__("Password is required"),
        'browser.required'             : res.__("Detect format valid"),
        'browserMajorVersion.required' : res.__("Detect format valid"),
        'browserVersion.required'      : res.__("Detect format valid"),
        'browserVersion.browserVersion': res.__("Detect format valid"),
        'os.required'                  : res.__("Detect format valid"),
        'osVersion.required'           : res.__("Detect format valid")
    });
     
    var matched = await validate.check()
    if (!matched) {
        req.error = validate.errors
    }
    next();
}