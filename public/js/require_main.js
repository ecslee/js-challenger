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
        'bootstrap'
    ],
    function () {
        console.log('ready to go!');

        require(
            [
                
            ],
            function () {
                $('#go-acorn').click(function () {
                    $.ajax({
                        url: '/acorn',
                        data: {
                            js: encodeURI($('textarea').val())
                        },
                        success: function (data, success, jqxhr) {
                            $('#acorn-result').html(data);
                        },
                        error: function (jqxhr, status, errorMsg) {
                            $('#acorn-result').html(errorMsg);
                        }
                    });
                });
            }
        );
    }
);