const node_validator = require('node-input-validator')

node_validator.extend('formatHeadPhone', ({ value, args }, validator) => {
    if (args.length) {
        throw new Error('Invalid seed for rule formatHeadPhone');
    }
    if(value.length > args[0] + 1 ){
        return false
    }
    // var email = validator.inputs['email']
   
    return value.match(/^(\++)([0-9]{2})$/)
});
var { Validator } = node_validator


module.exports.VALIDATE_LOCATION = async function( req, res, next ){
    
    let validate = new Validator(req.body, {
        name              : 'required',
        subname           : 'required',
        headPhone            : "required|formatHeadPhone"
    },{
        'name.required'               : res.__("Name is required"),
        'subname.required'            : res.__("Subname is required"),
        'headPhone.required'             : res.__("Head phone is required"),
        'headPhone.formatHeadPhone'             : res.__("Head phone is valid")
    });
     
    var matched = await validate.check()
    if (!matched) {
        req.error = validate.errors
    }
    next();
}