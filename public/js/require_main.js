require.config({
    baseUrl: '.',
    paths: {
        'tpl': '/tpl',
        'text': '/js/text',
        'jquery': '/js/jquery.min',
        'underscore': '/js/underscore-min',
        'backbone': '/js/backbone-min',
        'bootstrap': '/js/bootstrap.min',
        'models': '/js/models',
        'views': '/js/views',
        'collections': '/js/collections'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery']
        }
    }
});

require(
    [
        'jquery',
        'underscore',
        'backbone',
        'bootstrap',
        'text'
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
                
                $('#go-acorn').click(function () {
                    $.ajax({
                        url: '/acorn',
                        data: {
                            js: $('textarea').val()
                        },
                        success: function (data, success, jqxhr) {
                            $('#used .result').empty();
                            data = JSON.parse(data);
                            if (data.err) {
                                $('#used .result').html('<div class="alert alert-warning">' + data.err + '</div>');
                            } else {
                                for (var key in data.nodes) {
                                    $('#used .result').append('<p>' + key + ' x ' + data.nodes[key] + '</p>');
                                }
                            }
                        },
                        error: function (jqxhr, status, errorMsg) {
                            $('#used-result').html(errorMsg);
                        }
                    });
                });
            }
        );
    }
);