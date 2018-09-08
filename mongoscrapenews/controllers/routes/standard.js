// Server Routing - Standard /default route handling, favicon, static
// paths, and redirects unknown paths to the default path / index.


module.exports = (app, db, approot) => {

    var express = require('express');
    var path = require('path');
    app.use('/', express.static(path.join(approot, '/public')));


    // Some browsers (chrome!) will always ask for the
    // favicon. We won't return one, but we'll respond
    // with an appropriate status.



    app.get('/favicon.ico', function (req, res) {
        console.log('standard.js - favicon.ico request, responding with 204');
        res.status(204).send('/favicon.ico does not exist');
    });

    // route all unknown paths to /index
    app.get('*', function (req, res) {
        console.log('Server - redirecting [' + req.route.path + '] to /index');
        res.redirect('/index');
    });
};