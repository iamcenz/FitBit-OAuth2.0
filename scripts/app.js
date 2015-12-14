/* app.js */

var fitbit = angular.module("fitbit", [
    'ui.router',
    'chart.js'
]);
 
fitbit.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'templates/auth/login.html',
            controller: 'LoginController'
        })
        .state('dashboard', {
            url: '/dashboard',
            views: {
                '': {
                    templateUrl: 'templates/activity/dashboard.html',
                    controller: 'DashboardController'
                }
            }
        });
    $urlRouterProvider.otherwise('/');
})
.run(function ($rootScope, $location) {

	$rootScope.isLoggedIn = function () {

		var user_info = {};

        if (JSON.parse(window.localStorage.getItem("fitbit"))){
            user_info.accessToken   = JSON.parse(window.localStorage.getItem("fitbit")).oauth.access_token;
        }

   		if (user_info.accessToken == null || user_info.accessToken === 0) {
   			$location.path( "/" );
            return false;
   		} else {

   			return true;
   		}
	}
});
 
fitbit.controller("LoginController", function($scope) {
    
    $scope.fitbit_client_id = "XXXXXX";

    $scope.login = function() {
        window.location.href = "https://www.fitbit.com/oauth2/authorize?client_id=" + $scope.fitbit_client_id + "&response_type=token&scope=activity%20profile&expires_in=2592000";
    }
 
});
 
fitbit.controller("DashboardController", function($rootScope, $scope, $http, $location, $filter) {

	if ($rootScope.isLoggedIn()) {
    
        $scope.user_info = {};

        $scope.user_info.accessToken    = JSON.parse(window.localStorage.getItem("fitbit")).oauth.access_token;
        $scope.user_info.expiresIn      = JSON.parse(window.localStorage.getItem("fitbit")).oauth.expires_in;
        $scope.user_info.accountUserId  = JSON.parse(window.localStorage.getItem("fitbit")).oauth.account_user_id;

        $scope.profileData = function () {

            if ($rootScope.isLoggedIn()) {

                $http({
                  method  : 'GET',
                  url     : 'https://api.fitbit.com/1/user/' + $scope.user_info.accountUserId +'/profile.json',
                  headers : {'Authorization': 'Bearer ' + $scope.user_info.accessToken}
                })
                .success(function(data) {
                    if (data.errors) {
                        alert('ERRORS');
                    } else {
                        $scope.avatar = data.user.avatar150;
                        $scope.name = data.user.fullName;
                        $scope.gender = data.user.gender;
                        $scope.averageDailySteps = data.user.averageDailySteps;
                    }
                });

            }
        };

        $scope.activityData = function ($dates, $is_today) {

             if ($rootScope.isLoggedIn()) {
                angular.forEach($dates, function ($date) {
                    $http({
                      method  : 'GET',
                      url     : 'https://api.fitbit.com/1/user/' + $scope.user_info.accountUserId +'/activities/date/' + $date + '.json',
                      headers : {'Authorization': 'Bearer ' + $scope.user_info.accessToken}
                    })
                    .success(function(data) {
                        if (data.errors) {
                            alert('ERRORS');
                        } else {
                            if (!$is_today) {
                                $scope.activity.push({
                                    "Day": $date,
                                    "Steps": data.summary.steps,
                                    "Calories": data.summary.caloriesOut,
                                    "Calories BMR": data.summary.caloriesBMR
                                });

                                var $date_copy = $filter('date')($date, "EEE d");

                                $scope.labels.push($date_copy);
                                $scope.data[0].push(data.summary.steps);

                                console.log($scope.labels);
                                console.log($scope.data[0]);
                            }
                            else
                            {
                                $scope.todayActivity.push({
                                    "Day": $date,
                                    "Steps": data.summary.steps,
                                    "Calories": data.summary.caloriesOut,
                                    "Calories BMR": data.summary.caloriesBMR
                                });
                            }
                        }
                    });

                });
            }       
        };

        $scope.stepChart = function () {

            $scope.series = ['Steps'];

            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

        };

        angular.element(document).ready(function () {

            $scope.activity = [];
            $scope.todayActivity = [];

            // For step chart
            $scope.labels = [];
            $scope.data = [[]];

            $scope.today = new Date();
            $scope.past7 = [];

            for (var i=1; i<=7; i++) {
                var curr_date = new Date();
                curr_date.setDate($scope.today.getDate() - i);
                curr_date = $filter('date')(curr_date, "yyyy-MM-dd");

                $scope.past7.push(curr_date);
            }

            $scope.today = $filter('date')($scope.today, "yyyy-MM-dd");
            $scope.past7.push($scope.today);

    		$scope.profileData();
            $scope.activityData([$scope.today], true);
            $scope.activityData($scope.past7);
            $scope.stepChart();
    	});
    }

 
});