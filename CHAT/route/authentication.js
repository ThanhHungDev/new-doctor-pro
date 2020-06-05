/**
 * define
 */
var express             = require('express')
var router              = express.Router()
var { login, logout }   = require("../controller/authentication")
var { VALIDATE_LOGIN }  = require("../middleware/request/login")
var { VALIDATE_LOGOUT } = require("../middleware/request/logout")

router.post('/login', [ VALIDATE_LOGIN ], login)
router.post('/logout', [ VALIDATE_LOGOUT ], logout)


module.exports = router;