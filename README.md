#Weather forecast
 
 Web interface for manage weather forecast widgets
 
 ## Setup
 
 Set params
 ~~~
 mv parameters.json.dist parameters.json
 ~~~

 Run redis and mongo
 ~~~
  docker run --rm -p 6379:6379 redis
  docker run --rm -p 27017:27017 mongo
 ~~~
 
 Run project on 3000 port
 ~~~
 node src/index.js
 ~~~