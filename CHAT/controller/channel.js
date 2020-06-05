var User        = require("../model/UserAccount"),
    Channel     = require("../model/Channel"),
    TokenAccess = require("../model/TokenAccess"),
    CONFIG      = require("../config")



module.exports.get_channel_message = function( req, res ){

    var { access, browser, browserMajorVersion, 
        browserVersion, os, osVersion } = req.body,
        { 'user-agent': userAgent } = req.headers,
        detect                      = { browser, browserMajorVersion, browserVersion, 
                                            os, osVersion, userAgent },
        response = {}
    if(req.error){
        response = { code: 422, message: "入力エラーがありました", internal_message: "入力エラーがありました", 
        errors : [ req.error ] }
        return res.end(JSON.stringify(response))
    }
    // var lteDate = new Date((new Date).getTime() - (CONFIG.TimeExpireAccessToken * 1000) ) , period: { $gte: lteDate }
    TokenAccess.findOne({ token: access })
    .then( token => {
        if( !token ){
            throw new Error("token không tồn tại")
        }
        var now = new Date
        var diffe = now.getTime() - new Date(token.period).getTime()
        if( diffe > 1000 * CONFIG.TimeExpireAccessToken ){
            console.log(diffe + " / " + 1000 * CONFIG.TimeExpireAccessToken + " / " + now + " / " + new Date(token.period) ,"token hết hạn")
            throw new Error("token hết hạn")
        }
        return Channel.getChannelMessage(token.user)
    })
    .then( channels => {
        response = { code: 200, message: res.__("get channel succcess"), internal_message: res.__("get channel succcess"), 
        data : channels }
        return res.end(JSON.stringify(response))
    })
    .catch( error => {
        console.log( { error, access, ...detect }, "oject không thể chứng thực fetch channel")
        response = { code: 500, message: error.message, 
            internal_message: error.message, 
            errors : [ { message : error } ] }
        return res.end(JSON.stringify(response))
    })
}
