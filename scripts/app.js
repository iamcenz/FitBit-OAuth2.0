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
.run(function ($rootScope, $location, Session) {

	$rootScope.isLoggedIn = function () {

   		if (Session.accessToken == null || Session.accessToken === 0) {
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
 
fitbit.controller("DashboardController", function($rootScope, $scope, $http, $location, $filter, Session, FitBitAPI) {

	if ($rootScope.isLoggedIn()) {

        $scope.user_info = {};
        $scope.activity = [];

        $scope.user_info.accessToken    = Session.accessToken;
        $scope.user_info.expiresIn      = Session.expiresIn;
        $scope.user_info.accountUserId  = Session.accountUserId;

        $scope.profileData = FitBitAPI.getProfileData();
        $scope.profileData.then(function (data) {

            var user = data[0].data.user;

            $scope.avatar = user.avatar150;
            $scope.name = user.fullName;
            $scope.gender = user.gender;
            $scope.averageDailySteps = user.averageDailySteps;

        });

        // For step chart
        $scope.labels = [];
        $scope.data = [[],[]];

        $scope.today = new Date();
        
        var dates = [];
        var past_days = 4;

        for (var i=1; i<=past_days; i++) {
            var curr_date = new Date();
            curr_date.setDate($scope.today.getDate() - (past_days - i));
            curr_date = $filter('date')(curr_date, "yyyy-MM-dd");

            dates.push(curr_date);

            curr_date = $filter('date')(curr_date, "EEE d");
            $scope.labels.push(curr_date);
        }

        $scope.activityData = FitBitAPI.getActivityData(dates);
        $scope.activityData.then(function (data){

            var activities = [];
            var idx = 0;

            angular.forEach(data, function(value, key) {

                var activity = value.data.summary;
                var info = {};
                
                info.user_id = Session.accountUserId;
                info.steps = activity.steps;
                info.calories = activity.caloriesOut;
                info.caloriesBMR = activity.caloriesBMR;
                
                activities.push(info);
                activities[idx].day = dates[idx];

                idx++;
            });

            for (var i = 0; i < activities.length; i++) {
                $scope.activity[i] = activities[i];
                $scope.data[0].push($scope.activity[i].steps);
                $scope.data[1].push($scope.activity[i].calories);
            }

        });

        $scope.stepChart = function () {

            $scope.series = ['Steps', 'Calories Burned'];

            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

        };

        $scope.stepChart();
    }
});

fitbit.factory('Session', function() {

    var access_token;
    var expires_in;
    var account_user_id;

    if (JSON.parse(window.localStorage.getItem("fitbit"))) {
        access_token = JSON.parse(window.localStorage.getItem("fitbit")).oauth.access_token;
        expires_in = JSON.parse(window.localStorage.getItem("fitbit")).oauth.expires_in;
        account_user_id = JSON.parse(window.localStorage.getItem("fitbit")).oauth.account_user_id;
    }
    
    return {
       accessToken: access_token,
       expiresIn: expires_in,
       accountUserId: account_user_id
    }
});

fitbit.factory('FitBitAPI', function($http, $q, Session) {

    return {
        getProfileData: function() {

            var info = $q.defer();

            info = $http({
                method  : 'GET',
                url     : 'https://api.fitbit.com/1/user/' + Session.accountUserId +'/profile.json',
                headers : {'Authorization': 'Bearer ' + Session.accessToken}
            })

            return $q.all([info]);
        },
        getActivityData: function($dates) {

            var promises = [];

            angular.forEach($dates, function(date, key){
                promises.push($http({
                    method  : 'GET',
                    url     : 'https://api.fitbit.com/1/user/' + Session.accountUserId +'/activities/date/' + date + '.json',
                    headers : {'Authorization': 'Bearer ' + Session.accessToken}
                    })
                );
            });

            return $q.all(promises);
        }
    }
});