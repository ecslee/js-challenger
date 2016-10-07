var express = require('express');
var router = express.Router();
var Acorn = require('acorn');

var jsNodeSummary = {};
function getJSNodeTypes(node) {
    var types = [node.type];
    if (jsNodeSummary[node.type] == undefined) {
        jsNodeSummary[node.type] = 0;
    }
    jsNodeSummary[node.type]++;

    if (node.body && node.body.length) {
        node.body.forEach(function (subnode, i) {
            types = types.concat(getJSNodeTypes(subnode));
        });
    } else if (node.body) {
        types = types.concat(getJSNodeTypes(node.body));
    }
    return types;
}

router.get('/', function (req, res, next) {
    jsNodeSummary = {};
    var result = {
        nodes: {},
        err: false
    };
    try {
        var response = Acorn.parse(req.query.js);
        var types = getJSNodeTypes(response);
        console.log(jsNodeSummary);
        result.nodes = jsNodeSummary;
    } catch (e) {
        console.log('=== ERROR ===');
        result.err = e.message;
    }
    
    res.end(JSON.stringify(result));
});

module.exports = router;