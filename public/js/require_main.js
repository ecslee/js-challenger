require.config({
    baseUrl: '.',
    paths: {
        'jquery': '/js/jquery.min'
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

require(
    [
        'jquery'
    ],
    function () {
        console.log('ready to go!');

        require(
            [],
            function () {
                var simple = 'function abc() {\n'
                        + '  var number = 42;\n'
                        + '  for (var i = 0; i < 3; i++) {\n'
                        + '    number++;\n'
                        + '  }\n'
                        + '  return number === 45;\n'
                        + '}';
                var complex = 'function abc() {\n'
                        + '  var number = 42;\n'
                        + '  for (var i = 0; i < 3; i++) {\n'
                        + '    number++;\n'
                        + '    if (number == 45) {\n'
                        + '      number = 44;\n'
                        + '    }\n'
                        + '  }\n'
                        + '  for (var i = 0; i < 3; i++) {\n'
                        + '    number++;\n'
                        + '  }\n'
                        + '  for (var i = 0; i < 3; i++) {\n'
                        + '    number++;\n'
                        + '    if (number == 45) {\n'
                        + '      number = 44;\n'
                        + '    }\n'
                        + '  }\n'
                        + '  return number === 45;\n'
                        + '}\n'
                
                $('textarea').val(simple);
                
                var quals = {
                    whitelist: ['ForStatement', 'VariableDeclaration'],
                    blacklist: ['WhileStatement', 'IfStatement'],
                    structure: ['ForStatement', 'IfStatement']
                };
                
                function initQualifications() {
                    // Whitelist
                    $('#quals .result .whitelist').empty();
                    $('#quals .result .whitelist').append('<h3>Whitelist</h3>');
                    for (var w = 0; w < quals.whitelist.length; w++) {
                        $('#quals .result .whitelist').append('<p data-qual="' + quals.whitelist[w] + '">' + quals.whitelist[w] + '</p>');
                    }

                    // Blacklist
                    $('#quals .result .blacklist').empty();
                    $('#quals .result .blacklist').append('<h3>Blacklist</h3>');
                    for (var b = 0; b < quals.blacklist.length; b++) {
                        $('#quals .result .blacklist').append('<p data-qual="' + quals.blacklist[b] + '">' + quals.blacklist[b] + '</p>');
                    }

                    // Structure
                    $('#quals .result .structure').empty();
                    $('#quals .result .structure').append('<h3>Structure</h3>');
                    for (var s = 0; s < quals.structure.length; s++) {
                        $('#quals .result .structure').append('<p data-qual="' + quals.structure[s] + '">' + (s > 0 ? '  > ' : '') + quals.structure[s] + '</p>');
                    }
                }
                initQualifications();
                
                function getJSNodeTypes(jsNodeSummary, node) {
                    if (jsNodeSummary[node.type] == undefined) {
                        jsNodeSummary[node.type] = 0;
                    }
                    jsNodeSummary[node.type]++;
                    
                    for (var key in node) {
                        if (node[key] && node[key].type) {
                            getJSNodeTypes(jsNodeSummary, node[key]);
                        } else if (node[key] && typeof node[key] === 'object' && node[key].length) {
                            node[key].forEach(function (subnode, i) {
                                if (subnode.type) {
                                    getJSNodeTypes(jsNodeSummary, subnode);
                                }
                            });
                        }
                    }
                    
                    return jsNodeSummary;
                }
            
                function checkStructure(structure, nodes) {
                    function findNode(type, node) {
                        var result = [];
                        if (node.type === type) {
                            return [node];
                        }

                        for (var key in node) {
                            if (node[key] && node[key].type) {
                                result = result.concat(findNode(type, node[key]));
                            } else if (node[key] && typeof node[key] === 'object' && node[key].length) {
                                node[key].forEach(function (subnode, i) {
                                    if (subnode.type) {
                                        result = result.concat(findNode(type, subnode));
                                    }
                                });
                            }
                        }
                        return result;
                    }

                    var result = [];
                    var nodeMatches = nodes;
                    for (var i = 0; i < structure.length; i++) {
                        if (nodeMatches.length > 0 || typeof nodeMatches.type != 'undefined') {
                            if (typeof nodeMatches.type == 'undefined') {
                                nodeMatches = {
                                    type: 'nodeMatchWrapper',
                                    body: nodeMatches
                                };
                            }
                            nodeMatches = findNode(structure[i], nodeMatches);
                        }
                    }
                    
                    return nodeMatches.length > 0;
                }
                
                var checkInterval = setInterval(checkJS, 1000);
                $('#go-acorn').click(function () {
                    /**
                     * When clicking the button to check instantly,
                     * clear the interval to avoid any crossed checks.
                     */
                    
                    clearInterval(checkInterval);
                    checkJS();
                    checkInterval = setInterval(checkJS, 1000);
                });
                    
                function checkJS() {
                    $.ajax({
                        url: '/acorn',
                        data: {
                            js: $('textarea').val()
                        },
                        success: function (data, success, jqxhr) {
                            data = JSON.parse(data);
                            
                            if (data.err) {
                                /**
                                 * Don't immediately display an error.
                                 * Since code is parsed periodically, it could be half-typed.
                                 */
                                console.log('error: ' + data.err);
                            } else {
                                /**
                                 * If no error, clear the old results and update info.
                                 * Check the qualifications and update quals panel.
                                 */
                                
                                var jsNodeSummary = getJSNodeTypes({}, data.nodes);
                                
                                $('#used .result').empty();
                                $('#quals .result [data-qual]').css('color', '');
                                
                                for (var key in jsNodeSummary) {
                                    $('#used .result').append('<p>' + key + ' x ' + jsNodeSummary[key] + '</p>');
                                    
                                    if (quals.whitelist.indexOf(key) > -1) {
                                        $('#quals .result .whitelist [data-qual="' + key + '"]').css('color', 'lightgreen');
                                    }
                                    
                                    if (quals.blacklist.indexOf(key) > -1) {
                                        $('#quals .result .blacklist [data-qual="' + key + '"]').css('color', 'red');
                                    }
                                }
                                
                                var structureMatch = checkStructure(quals.structure, data.nodes);
                                if (structureMatch) {
                                    $('#quals .result .structure [data-qual]').css('color', 'lightgreen');
                                }
                            }
                        },
                        error: function (jqxhr, status, errorMsg) {
                            $('#used-result').html(errorMsg);
                        }
                    });
                }
            }
        );
    }
);