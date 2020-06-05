var webpush = require('web-push'),
    CONFIG = require("../config")
// const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = {
    publicKey : CONFIG.WEBPUSH.PUBLIC_KEY,
    privateKey : CONFIG.WEBPUSH.PRIVATE_KEY,
}

module.exports.getInstanceWebPush = function(){

    webpush.setVapidDetails(
        'mailto:thanhhung.code@gmail.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
    return webpush;
}