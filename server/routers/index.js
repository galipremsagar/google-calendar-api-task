'use strict';
var AuthRouter   = require('./auth');
var GoogleRouter = require('./google');
module.exports.auth   = AuthRouter;
module.exports.google = GoogleRouter;
