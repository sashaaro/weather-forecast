#Weather forecast
 
 Web interface for manage weather forecast widgets
 
 ## Setup
 
 Set params
 ~~~
 mv parameters.json.dist parameters.json
 ~~~

 Run redis
 ~~~
  docker run --rm -p 6379:6379 redis
 ~~~
 
 Run project on 3000 port
 ~~~
 node src/index.js
 ~~~