# OAuth-2.0---FitBit

Basic connection to FitBit API using AngularJS

------------------------

There are several different ways to connect to the FitBit API. The easiest way that I had the most success was with AngularJS. This is a very basic application to demonstrate how OAuth 2.0 will work with FitBit.

###Instructions

In order to make any requests to the FitBit API you must register your application on dev.fitbit.com. You can easily find guides on how to complete this, but as a helpful tip, the information doesn't have to be exactly correct right away. By completing the registration, you will be provided with a few lines of information. For this app, the most important piece would be the "OAuth 2.0 Client ID".

Modifying the app with this client ID is the first step. Go to scripts/app.js. Find the "LoginController" and you will see [$scope.fitbit_client_id = "XXXXXX";]. Go ahead and replace XXXXXX with your Client ID.

Next, you will just have to modify a few links to match your environment. Going back to dev.fitbit.com, you will need to make sure your Callback URL is set to the exact URL where your oauth_callback.html is located (i.e. http://www.YOURDOMAIN.com/fitbit/oauth_callback.html). This will also work if you're running this locally through a wamp / mamp server using localhost.

Now within the oauth_callback.html file, change "http://.../#/dashboard" to the full url where this file will be located.

You should now be able to run the site and login to fitbit. You'll then be redirected back to the app to show you basic profile information as well as a chart (using Chart.js) showing your steps over the past 7 days.

------------------------

###Brief Explanation

To understand the big picture of how OAuth 2.0 works with FitBit, here is a brief, non-technical explanation.

1. The user clicks on the "Login with FitBit" button and is redirected to FitBit's login screen on their website. The user is then prompted to allow our application to access their activity and profile information.
2. Once authorization is complete, FitBit will redirect the user back to our application (using the Callback URL) along with an access token.
3. Our oauth_callback file handles this access token and stores it in the user's local storage.
4. The user is then redirected to our dashboard where we are able to make API requests using the user's access token to retrieve their profile and activity information.
