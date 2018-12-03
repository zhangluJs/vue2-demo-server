/**
 * @file 根路由
 * @author zhanglu
 */

let express = require('express');
let router = express.Router();

// GET home page.
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express,very good'
    });
});

module.exports = router;
