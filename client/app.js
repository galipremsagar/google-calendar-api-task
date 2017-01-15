'use strict';

var app = angular.module('app', [
	'ngRoute',
    'ngCookies',
    'authentication',
    'GoogleCalendarService',
    'mgcrea.ngStrap',
    'ngAnimate'
]).config(['$routeProvider','$httpProvider', function($routeProvider, $httpProvider) {
	$routeProvider.when('/login', {templateUrl: '/login.html', controller: 'LoginController'});
    $routeProvider.when('/', {templateUrl: '/main.html', controller: 'MainController'});
    $routeProvider.otherwise({redirectTo: '/login'});
}]);