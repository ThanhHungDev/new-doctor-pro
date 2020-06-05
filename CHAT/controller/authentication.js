var User        = require("../model/UserAccount"),
    TokenAccess = require("../model/TokenAccess"),
    TokenRefesh = require("../model/TokenRefesh"),
    crypto      = require('crypto'),
    mongoose    = require("mongoose"),
    CONFIG      = require("../config")

module.exports.login = function( req, res ){

    var { userLogin, email, password, browser, browserMajorVersion, browserVersion, os, osVersion }   = req.body
    var { 'user-agent' : userAgent } = req.headers,
        detect                        = { browser, browserMajorVersion, browserVersion, os, osVersion, userAgent }

    var response = {}
    if(req.error){
        response = { code: 422, message: "入力エラーがありました", internal_message: "入力エラーがありました", 
        errors : [ req.error ] }
        return res.end(JSON.stringify(response))
    }

    ///search location { _id : new ObjectId('5ec8940a4a7c080966d9e911')}
    return User.findOne({ email })
    .populate('tokenRefesh')
    .then(user => {
        if(!user){
            console.log(user, "không tìm thấy user")
            throw new Error('メールアドレスまたはパスワードが間違っています')
        }
        userLogin = user
        return user.checkValidPassword(password)
    })
    .then( equalPassword => { 
        if(!equalPassword){
            throw new Error('メールアドレスまたはパスワードが間違っています')
        }
        return createToken( userLogin, detect )
    })
    .then( tokens => {
        response = { code: 200, message: res.__("login success"), 
        internal_message: res.__("login success"), data : { ... userLogin.toJSONFor(), tokens } }
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        console.log(error)
        response = { code: 302, message: error.message, internal_message: error.message }
        return res.end(JSON.stringify(response))
    });
}

function createToken( user, detect ){
    /// check tokenrefesh in user
    var tokenRefesh = null,
        tokenAccess = null,
        refesh      = null


    if(user.tokenRefesh.length){
        refesh = user.tokenRefesh.find( refesh => refesh.detect == JSON.stringify({ ...detect } ))
    }
    if(refesh){
        tokenRefesh = refesh.token
        console.log("đã tồn tại sẵn" + tokenRefesh)
    }else{
        tokenRefesh = crypto.createHash('md5').update(
            JSON.stringify({ idUser: user._id.toString(), ...detect, time: (new Date).getTime() })
        ).digest('hex')
        
    
        var newTokenRefesh = new TokenRefesh({
            token : tokenRefesh,
            detect : JSON.stringify({ ...detect } )
        })
        newTokenRefesh.save()
        .then(result => {
            user.tokenRefesh.push(result._id)
            user.save()
        })
    }
    
    /// save token assess
    tokenAccess = crypto.createHash('md5').update(
        JSON.stringify({ ... detect, time: (new Date).getTime() })
    ).digest('hex')
    var newTokenAccess = new TokenAccess({
        token: tokenAccess,
        user: user._id,
        detect : JSON.stringify({ ...detect } )
    })
    return newTokenAccess.save()
    .then( tokenAcc => {
        return { tokenRefesh, tokenAccess, period: new Date, expire : CONFIG.TimeExpireAccessToken }
    })
}


module.exports.logout = function( req, res ){

    var { tokenAccess, userId }   = req.body

    var response = {}
    if(req.error){
        response = { code: 422, message: "入力エラーがありました", internal_message: "入力エラーがありました", 
        errors : [ req.error ] }
        return res.end(JSON.stringify(response))
    }

    ///search location { _id : new ObjectId('5ec8940a4a7c080966d9e911')}
    return User.findOne({ user: mongoose.Types.ObjectId(userId), token: tokenAccess })
    .then(token => {
        if(!token){
            console.log("không tìm thấy token logout")
            throw new Error('不正アクセス')
        }
        ////remove 
        return token.remove()
    })
    .then( remove => {
        console.log(remove, "remove")
        response = { code: 200, message: res.__("logout success"), internal_message: res.__("logout success")}
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        console.log(error)
        response = { code: 204, message: "have error save", internal_message: error.message }
        return res.end(JSON.stringify(response))
    });
}