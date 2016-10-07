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
        
        /**
         * Sample qualifications and code entry
         */
        
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
        
        $('#switch-code').click(function () {
            $(this).toggleClass('complex');
            if ($(this).hasClass('complex')) {
                $('textarea').val(complex);
            } else {
                $('textarea').val(simple);
            }
        });

        /**
         * Qualifications have 3 categories:
         *     whitelist: required types, listed as an array of Acorn node types
         *     blacklist: rejected types, listed as an array of Acorn node types
         *     structure: rough structure, listed as an array of Acorn node types in nested order
         */
        
        var quals = {
            whitelist: ['ForStatement', 'VariableDeclaration'],
            blacklist: ['WhileStatement', 'IfStatement'],
            structure: ['ForStatement', 'IfStatement']
        };

        function initQualifications() {
            // Whitelist
            $('#quals .list .whitelist .entries').empty();
            for (var w = 0; w < quals.whitelist.length; w++) {
                $('#quals .list .whitelist .entries').append('<p data-qual="' + quals.whitelist[w] + '">'
                                                      + '<i class="glyphicon glyphicon-ok-circle"></i>'
                                                      + quals.whitelist[w]
                                                      + '</p>');
            }

            // Blacklist
            $('#quals .list .blacklist .entries').empty();
            for (var b = 0; b < quals.blacklist.length; b++) {
                $('#quals .list .blacklist .entries').append('<p data-qual="' + quals.blacklist[b] + '">'
                                                      + '<i class="glyphicon glyphicon-ban-circle"></i>'
                                                      + quals.blacklist[b]
                                                      + '</p>');
            }

            // Structure
            $('#quals .list .structure .entries').empty();
            for (var s = 0; s < quals.structure.length; s++) {
                $('#quals .list .structure .entries').append('<p data-qual="' + quals.structure[s] + '">'
                                                      + '<i class="glyphicon glyphicon-thumbs-up"></i>'
                                                      + (s > 0 ? '  > ' : '') + quals.structure[s]
                                                      + '</p>');
            }
        }
        initQualifications();

        /**
         * Get a summary of included node types.
         * Traverse the Acorn object and collect all-included node types.
         */
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

        /**
         * Check rough program structure.
         * For each desired type, find all matching nodes
         * withing the set of nodes that matched previous types.
         */
        function checkStructure(structure, nodes) {
            // find nodes that match the desired type, and go no deeper
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

            // for each successive type, find nodes included in each round of matches
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

        /**
         * Check code once per second.
         * When clicking the button to check instantly,
         * clear the interval to avoid any crossed checks.
         */
        var checkInterval = setInterval(checkJS, 1000);
        $('#go-acorn').click(function () {
            clearInterval(checkInterval);
            checkJS();
            checkInterval = setInterval(checkJS, 1000);
        });

        function checkJS() {
            /**
             * Send a request with the code to the node server.
             * If there is an error, keep it silent - code may be half-typed.
             * If there is a valid Acorn structure, update any qualifications that are/aren't met.
             */
            
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

                        $('#quals .list .match').removeClass('match');
                        var jsNodeSummary = getJSNodeTypes({}, data.nodes);

                        // update white/blacklist with included node types
                        for (var key in jsNodeSummary) {
                            if (quals.whitelist.indexOf(key) > -1) {
                                $('#quals .list .whitelist .entries [data-qual="' + key + '"]').addClass('match');
                            }

                            if (quals.blacklist.indexOf(key) > -1) {
                                $('#quals .list .blacklist .entries [data-qual="' + key + '"]').addClass('match');
                            }
                        }

                        // if every whitelist entry is matched, the whole category is matched
                        if ($('#quals .list .whitelist .entries .match').length === quals.whitelist.length) {
                            $('#quals .list .whitelist h3').addClass('match');
                        }

                        // if no blacklist entries are matched, the whole category is matched
                        if ($('#quals .list .blacklist .entries .match').length === 0) {
                            $('#quals .list .blacklist h3').addClass('match');
                        }

                        // if the structure matches, the whole category (obviously) is matched
                        var structureMatch = checkStructure(quals.structure, data.nodes);
                        if (structureMatch) {
                            $('#quals .list .structure h3').addClass('match');
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