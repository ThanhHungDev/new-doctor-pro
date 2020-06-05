var User        = require("../model/UserAccount"),
    Location    = require("../model/Location"),
    Channel     = require("../model/Channel"),
    TokenAccess = require("../model/TokenAccess"),
    TokenRefesh = require("../model/TokenRefesh"),
    crypto      = require('crypto'),
    mongoose    = require("mongoose"),
    CONFIG      = require("../config")

module.exports.register_user = function( req, res ){
    var { name, email, password, head_phone, phone, anonymous } = req.body
    var response = {}
    if(req.error){
        response = { code: 422, message: "入力エラーがありました", internal_message: "入力エラーがありました", 
        errors : [ req.error ] }
        return res.end(JSON.stringify(response))
    }

    User.findOne({ email })
    .then( userUnique => {
        if(userUnique){
            throw new Error("このユーザーは既に存在します")
        }
        return  Location.findOne({headPhone : head_phone })
    })
    .then(location => {
        if(!location){
            throw new Error("システムに場所がありません")
        }
        var avatarUrl = anonymous ? "/image/avatar-anonymous.png" : "/image/avatar.jpg"
        var newUser = new User({
            name, email, password, 
            phones : [{ locationPhone: location._id, phoneNumber: phone }], 
            avatar: avatarUrl,
            anonymous
        })
        return newUser.save()
    })
    .then( user => {
        console.log(user, "save success")
        createChannelDefault(user)
        response = { code: 200, message: res.__("save succcess"), internal_message: res.__("save succcess"), 
        data : { user : user.toJSONFor() } }
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        response = { code: 500, message: error.message, 
        internal_message: error.message, 
        errors : [ { message : error } ] }
        return res.end(JSON.stringify(response))
    });
}

function createChannelDefault(user){

    var listAccount = CONFIG.ACCOUNT_ADMIN
    listAccount.map( account => {
        User.findOne( { email : account.email } )
        .then( admin => {
            if( !admin ){
                console.log(" lỗi lớn : channel của 1 user không tìm thấy admin "+  account.email)
            }
            new Channel({
                name : account.channel + user._id.toString(),
                user : [
                    user._id,
                    admin._id
                ]
            }).save()
        } )
    })
}


module.exports.refesh = function( req, res ){

    var { userId, refesh, browser, browserMajorVersion, 
        browserVersion, os, osVersion } = req.body,
        { 'user-agent': userAgent } = req.headers,
        detect                      = { browser, browserMajorVersion, browserVersion, 
                                            os, osVersion, userAgent }
    var response = {}
    if(req.error){
        response = { code: 422, message: "入力エラーがありました", internal_message: "入力エラーがありました", 
        errors : [ req.error ] }
        return res.end(JSON.stringify(response))
    }

    var tokenRefesh = crypto.createHash('md5').update(
        JSON.stringify({ idUser: userId, ...detect, time: (new Date).getTime() })
    ).digest('hex')
    var tokenAccess = crypto.createHash('md5').update(
        JSON.stringify({ ... detect, time: (new Date).getTime() })
    ).digest('hex')

    User.findOne({ _id : userId })
    .populate({
        path: "tokenRefesh",
        match : {
            token: refesh, 
            detect: JSON.stringify(detect)
        }
    })
    .then( userToken => {
        if(!userToken.tokenRefesh.length){
            throw new Error("このユーザーは既に存在します")
        }
        console.log(userToken.tokenRefesh.length , "refesh user ")
        return TokenRefesh.findOne({ token: refesh })
        .then(tokenUpdate => {
            tokenUpdate.token = tokenRefesh 
            return tokenUpdate.save()
        })
    })
    .then( tokenRefeshUpdate => {
        var newTokenAccess = new TokenAccess({
            token: tokenAccess,
            user: userId,
            detect : JSON.stringify({ ...detect } )
        })
        return newTokenAccess.save()
    })
    .then(tokenAccessCreate => {
        response = { code: 200, message: res.__("refesh success"), 
        internal_message: res.__("refesh success"), 
        data : {  tokenRefesh, tokenAccess, period: new Date, expire : CONFIG.TimeExpireAccessToken } }
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        response = { code: 500, message: error.message, 
        internal_message: error.message, 
        errors : [ { message : error } ] }
        return res.end(JSON.stringify(response))
    });
}




module.exports.logout = function( req, res ){
    var { userId, access, browser, browserMajorVersion, 
        browserVersion, os, osVersion } = req.body,
        { 'user-agent': userAgent } = req.headers,
        detect                      = { browser, browserMajorVersion, browserVersion, 
                                            os, osVersion, userAgent }
    var response = {}

    TokenAccess.findOne({ token : access, user: userId, detect: JSON.stringify({...detect }) })
    .then( token => {
        if( !token ){
            var objectFindLogout = { token : access, user: userId, detect: JSON.stringify({...detect }) }
            console.log(JSON.stringify(objectFindLogout), "objectFindLogout")
            throw new Error("không tồn tại token logout")
        }
        token.remove()
    })
    .then( () => {
        response = {code: 200, message: res.__("logout succcess"), internal_message: res.__("logout succcess")}
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        response = { code: 500, message: error.message, internal_message: error.message, errors: [{ message : error }] }
        return res.end(JSON.stringify(response))
    })
}