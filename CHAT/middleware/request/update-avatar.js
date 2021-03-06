const { Validator } = require('node-input-validator')

module.exports.VALIDATE_UPDATE_AVATAR = async function( req, res, next ){
    
    let validate = new Validator(req.body, {
        tokenAccess: 'required|hash:md5',
        userId: 'required|hash:md5',
        avatar: 'required'
    },{
        'userId.required'     : res.__("User Id is required"),
        'userId.hash'         : res.__("User Id is valid"),
        'tokenAccess.required': res.__("Token Access is required"),
        'tokenAccess.hash'    : res.__("Token Access format valid"),
        'avatar.required'     : res.__("Avatar iss valid")
    })
     
    var matched = await validate.check()
    if (!matched) {
        req.error = validate.errors
    }
    next()
}