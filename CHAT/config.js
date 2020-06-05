'use strict'

var local      = "localhost",
    local_ip   = "127.0.0.1",
    local_port = 3000

var CONFIG = {
    SERVER : {
        PORT : local_port,
        DOMAIN : local,
        IP : local_ip,
        PROTOCOL: function(){
            if( local_port == 443 ){
                return "https://"
            }
            return  "http://"
        }, 
        ASSET : () => {
            let port_url = ''
            let protocol = ''
            if( local_port == 443 ){
                protocol = "https://"
            }else{
                protocol = "http://"
                port_url = ':'+ local_port
            }

            return protocol + local + port_url;
        }
    }, 
    mailler: {
        email: "jbtruongthanhhung@gmail.com",
        password: "...."
    }
    database : {
        mysql : {
            username: 'root',
            password: '',
            database_name: 'ebudezain',
            host: local_ip,
            dialect: 'mysql',
            logging : false
        },
        mongodb : 'mongodb://127.0.0.1:27017/realtime'
    },
    TimeExpireAccessToken : 1 * 60,
    TimeExpireAccessChannel : 24 * 60 * 60,
    salt : 5,
    IS_ENVIROMENT_PRODUCT : true,
    WEBPUSH: { 
        PUBLIC_KEY: 'BIUnprvdEEntYAgrOBaI_MAaWK8qtRtgfM_RKnSGglsI1NAZUcycI7yJ6YL2ZEoqmKG9dSQ3AtX0-2mS6j_7epE',
        PRIVATE_KEY: 'OAGhOjAuZ5WqNOm7hdqNeo-SSJqGApaXivfY5ps0Eiw'
    },
    EVENT : {
        CONNECTTION     : 'connection',
        DISCONNECT      : 'disconnect',
        SEND_MESSAGE    : 'send-message',
        RESPONSE_MESSAGE: 'response-message',
        JOIN_CHANNEL    : "join-channel",
        SEND_TYPING     : "send-typing",
        RESPONSE_TYPING : 'response-typing'
    },
    ACCOUNT_ADMIN: [
        {
            channel: "consulting-web-design-",
            name: "hùng đẹp trai",
            email: "admin.thanhhung@ebudezain.com",
            avatar: "/image/avatar-hero.jpg",
            headPhone: "+81",
            phone: "8033870674"
        },
        {
            channel: "technical-support-",
            name : "trương trúc ngân",
            email: "admin.trucngan@ebudezain.com",
            avatar: "/image/avatar-developer.jpg",
            headPhone : "+84",
            phone: "5674324322"
        },
        {
            channel: "submit-web-request-",
            name : "nguyễn văn tỉnh",
            email: "admin.vantinh@ebudezain.com",
            avatar: "/image/avatar-hero.jpg",
            headPhone : "+84",
            phone: "564332434"
        }
    ]
}
module.exports = CONFIG;