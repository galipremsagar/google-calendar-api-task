angular.module('GoogleCalendarService', [], function($provide){

	$provide.factory('$googleCalendar', function($http, $q){

		var $scope = angular.element(document).scope();


		var baseUrl = 'http://bc738e09.ngrok.io/google';

		return {};

	});

});