var express = require('express');
var router = express.Router();
var Acorn = require('acorn');

// accept accorn requests and responds with error or object
router.get('/', function (req, res, next) {
    var result = {
        nodes: {},
        err: false
    };
    try {
        result.nodes = Acorn.parse(req.query.js);
    } catch (e) {
        console.log('=== ERROR ===');
        result.err = e.message;
    }
    
    res.end(JSON.stringify(result));
});

module.exports = router;