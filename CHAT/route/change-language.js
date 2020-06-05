/**
 * define
 */
var express           = require('express')
var router            = express.Router()


router.any('/change-lang/:lang', (req, res) => { 

    res.cookie('language', req.params.lang, { maxAge: 900000 });
    return res.redirect('back');
})


module.exports = router;