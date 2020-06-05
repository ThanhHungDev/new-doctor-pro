const node_validator = require('node-input-validator')

node_validator.extend('formatHeadPhone', ({ value, args }, validator) => {
    if (args.length > 2) {
        throw new Error('Invalid seed for rule formatHeadPhone');
    }
    if(value.length > args[0] + 1 ){
        return false
    }
    // var email = validator.inputs['email']
   
    return value.match(/^(\+{1})([0-9]{2,3})$/)
});
var { Validator } = node_validator



module.exports.VALIDATE_REGISTER = async function( req, res, next ){
    ///:attribute :value
    let validate = new Validator(req.body, {
        name      : "required|minLength:3|maxLength:50",
        email     : 'required|email',
        password  : 'required|minLength:6',
        head_phone: 'required|formatHeadPhone',
        phone     : 'required|minLength:8|maxLength:11'
    },{
        'name.required'             : res.__("User Id is required"),
        'name.minLength'            : res.__("User Id is valid"),
        'name.maxLength'            : res.__("Token Access is required"),
        'email.required'            : res.__("Email is required"),
        'email.email'               : res.__("Email is valid"),
        'password.required'         : res.__("Password is required"),
        'password.minLength'        : res.__("Password is valid"),
        'head_phone.required'       : res.__("Head Phone is required"),
        'head_phone.formatHeadPhone': res.__("Head Phone is valid"),
        'phone.required'            : res.__("Phone is required"),
        'phone.minLength'           : res.__("Phone is valid"),
        'phone.maxLength'           : res.__("Phone is valid")
    });

    var matched = await validate.check()
    if (!matched) {
        req.error = validate.errors
    }
    next();
}




