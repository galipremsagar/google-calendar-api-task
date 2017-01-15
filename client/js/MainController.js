'use strict';

app.controller('MainController', ['$scope','$googleCalendar','$http','$config','Auth','$location','$modal','$timeout',
	function($scope, $googleCalendar, $http, $config, Auth, $location, $modal,$timeout) {
		$scope.events = [];
		$scope.date = "15/01/2017";
		console.log($scope.date.split("/"));
		var baseUrl = 'http://bc738e09.ngrok.io/google';
		$scope.getEvents = function() {
			var date_temp = $scope.date.split("/").join("-");
			$http.get(baseUrl+'/events',{params:{date:date_temp}}).then(function(response){

				console.log(response);

				if(response.status == 200){
					$scope.events = response.data;
				}

			});

			$scope.intervalFunction = function(){
				$timeout(function() {
					$scope.getEvents();
					// $scope.intervalFunction();
				}, 1000000)
			};
			$scope.intervalFunction();
		};
		$scope.getEvents();

		$scope.setCurrentEvent = function(event) {
			$scope.currentEvent = event;
		};
		$scope.logout = function() {
			Auth.logout();
		};

	}]);