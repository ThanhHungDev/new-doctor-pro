var mongoose = require("mongoose"),
    CONFIG = require("../config")
    

var IS_PRODUCTION = CONFIG.IS_ENVIROMENT_PRODUCT

/// connect mongodb
mongoose.connect(CONFIG.database.mongodb, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true
    }
)
!IS_PRODUCTION && mongoose.set('debug', true)
mongoose.set('useFindAndModify', true);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connected ' + CONFIG.database.mongodb);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// When the connection is open
mongoose.connection.on('open', function () {
    console.log('Mongoose default connection is open');
    console.log('===================================');

    // var Location = require("../model/Location")
    // var newLocationJapan = new Location({
    //     name : "Nhật bản",
    //     subname: "jp",
    //     headPhone : "+81"
    // })
    // newLocationJapan.save()
    // .then(jp => {
    //     console.log(jp)
    //     console.log(jp._id.toString())
    // })
    // .catch(err => {
    //     console.log( err )
    // })
    /// gỉa sử headphome = +81 = 5ec8940a4a7c080966d9e911



    
    ///search location 
    // var Location = require("../model/Location")

    // Promise.all([ 
    //     new Location({ name : "Nhật bản", subname: "jp", headPhone : "+81" }).save(),
    //     new Location({ name : "Việt Nam", subname: "vi", headPhone : "+84" }).save()
    // ])
    // .then(([ jp, vi ]) => {
    //     console.log(" success location ")
    //     var User = require("../model/UserAccount")
    //     var listAdmin = CONFIG.ACCOUNT_ADMIN
    //     listAdmin.map( account => {
    //         Location.findOne({headPhone : account.headPhone })
    //         .then( location => {
    //             var newUserHungtt = new User({
    //                 name: account.name, 
    //                 email: account.email, 
    //                 password : "hungtt@266", 
    //                 userType: "Admin",
    //                 phones : [{ locationPhone: location._id, phoneNumber: account.phone }], 
    //                 avatar: account.avatar
    //             })
    //             return newUserHungtt.save()
    //         })
    //     })
    // })
    // .catch(err => {
    //     console.log( " fail location " )
    // })
    
    
    
});
