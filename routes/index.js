var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', {
        name: 'Emily',
        desired: ['ForStatement', 'IfStatement', 'VariableDeclaration'],
        nodes: {}
    });
});

module.exports = router;