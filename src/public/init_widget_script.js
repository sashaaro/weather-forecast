var initWeatherForeCastWidget = function(widgetID) {
    var block = document.querySelector('.weather-forecast[data-id="'+widgetID+'"]')
    var url = 'http://localhost:3000/widget/' + widgetID
    fetch(url).then(function(response) {
        return response.json()
    }).then(function(response) {
        var html = '<em>' + response.cityTitle + '</em>'
        html += '<div class="list">'
        response.forecast.forEach(function(day) {
            var date = (new Date(day.dt)).toLocaleString("ru", {month: 'long', day: 'numeric'})
            html += '<div class="day">' +
                '<div>' + date + '</div>' +
                '<div>'+ day.temp +' °C</div>' +
                '<div>Ветер '+ day.speed +' м/с. ' + day.description  +'</div>' +
                '</div>'
        })
        html += '</div>'

        block.innerHTML = html
        var blockPositionClass = response.widget.position == 0 ? 'horizontal' : 'vertical'
        block.classList.add(blockPositionClass)
    })
}