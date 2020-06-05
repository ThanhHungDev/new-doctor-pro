/**
 * define
 */
var express               = require('express')
var router                = express.Router()
var formidable = require('formidable')
var fs = require('fs')
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname )
  }
})

var upload = multer({ storage: storage })

var { register_user, refesh, logout } = require("../controller/user"),
    { VALIDATE_REGISTER }             = require("../middleware/request/register"),
    { VALIDATE_REFESH }               = require("../middleware/request/refesh"),
    { VALIDATE_UPDATE_AVATAR }        = require("../middleware/request/update-avatar"),
    { VALIDATE_GET_CHANNEL_MESSAGE }  = require("../middleware/request/get-channel-message"),
    { get_channel_message }           = require("../controller/channel"),
    { save_image_chat }               = require("../controller/image"),
    { initial_db }                    = require("../controller/setting")


router.post('/register', [ VALIDATE_REGISTER ], register_user)
router.post('/refesh', [ VALIDATE_REFESH ], refesh)
// router.put('/', [ VALIDATE_UPDATE_AVATAR ], register_user)
router.post('/channel-message', [VALIDATE_GET_CHANNEL_MESSAGE], get_channel_message )
router.post('/image', upload.single('image'), save_image_chat)
router.post('/logout', logout)
router.get('/setting', initial_db)
module.exports = router;