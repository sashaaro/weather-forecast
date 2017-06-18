const request = require('request');

const cities = [
    'Moscow',
    'Saint Petersburg',
    'Nizhniy Novgorod'
]

const fetchWeatherForeCase = (widget, apiKey) => {
    return new Promise((resolve) => {
        const city = cities[widget.city]
        const url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q='+city+',ru&lang=ru&units=metric&cnt='+widget.period+'&appid=' + apiKey
        request(url, (error, response, body) => {
            const forecastList = [];
            body = JSON.parse(body)
            for (let i = 0; i < body.list.length; i++) {
                const forecast = body.list[i]
                forecastList.push({
                    dt: forecast.dt,
                    temp: forecast.temp.day,
                    description: forecast.weather ? forecast.weather[0].description : null,
                    speed: forecast.speed
                })
            }
            resolve(forecastList)
        })
    })
}

module.exports = fetchWeatherForeCase