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
            [
                
            ],
            function () {
                $('textarea').val('function abc() {\n'
                                    + '  var number = 42;\n'
                                    + '  for (var i = 0; i < 3; i++) {\n'
                                    + '    number++;\n'
                                    + '  }\n'
                                    + '  return number === 45;\n'
                                    + '}'
                                 );
                
                var quals = {
                    whitelist: ['ForStatement', 'VariableDeclaration'],
                    blacklist: ['WhileStatement', 'IfStatement'],
                    structure: []
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
                        $('#quals .result .structure').append('<p data-qual="' + quals.structure[s] + '">' + quals.structure[s] + '</p>');
                    }
                }
                initQualifications();
                
                var jsNodeSummary;
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
                    } else if (node.body && node.body.type) {
                        types = types.concat(getJSNodeTypes(node.body));
                    }
                    return types;
                }
                
                var checkInterval = setInterval(checkJS, 1000);
                $('#go-acorn').click(function () {
                    clearInterval(checkInterval);
                    checkJS();
                    checkInterval = setInterval(checkJS, 1000);
                });
                    
                function checkJS() {
                    console.log('GO! check js');
                    $.ajax({
                        url: '/acorn',
                        data: {
                            js: $('textarea').val()
                        },
                        success: function (data, success, jqxhr) {
                            
                            
                            data = JSON.parse(data);
                            jsNodeSummary = {};
                            getJSNodeTypes(data.nodes);
                            
                            if (data.err) {
                                console.log('error: ' + data.err);
                                //$('#used .result').html('<div class="alert alert-warning">' + data.err + '</div>');
                            } else {
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