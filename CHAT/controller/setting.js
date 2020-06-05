var Location    = require("../model/Location")
var UserAccount = require("../model/UserAccount")
module.exports.initial_db = function( req, res ){

    
    Promise.all([ 
        new Location({ name : "Nhật bản", subname: "jp", headPhone : "+81" }).save(),
        new Location({ name : "Việt Nam", subname: "vi", headPhone : "+84" }).save()
    ])
    .then(([ jp, vi ]) => {
        
        var listAdmin = CONFIG.ACCOUNT_ADMIN
        listAdmin.map( account => {
            Location.findOne({headPhone : account.headPhone })
            .then( location => {
                var newUserHungtt = new UserAccount({
                    name: account.name, 
                    email: account.email, 
                    password : "hungtt@266", 
                    userType: "Admin",
                    phones : [{ locationPhone: location._id, phoneNumber: account.phone }], 
                    avatar: account.avatar
                })
                return newUserHungtt.save()
            })
        })
        var response = { code: 200, message: "setting" }
        return res.end(JSON.stringify(response))
    })
    .catch(err => {
        console.log( " fail location " )
        var response = { code: 200, message: "setting", data : err }
        return res.end(JSON.stringify(response))
    })
    
}
