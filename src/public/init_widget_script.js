var initWeatherForeCastWidget = function(widgetID) {
    var block = document.querySelector('.weather-forecast[data-id="'+widgetID+'"]')
    var url = 'http://localhost:3000/widget/' + widgetID
    fetch(url).then(function(response) {
        return response.json()
    }).then(function(response) {
        var html = '<em>' + response.cityTitle + '</em>'
        html += '<div class="list">'

        response.forecast.forEach(function(item) {
            html += '<div class="day">' +
                '<span>+34 c</span>' +
                '<span>12 июня (среда)</span>' +
                '</div>'
        })
        html += '</div>'

        block.innerHTML = html
        var blockPositionClass = response.widget.position == 0 ? 'horizontal' : 'vertical'
        block.classList.add(blockPositionClass)
    })
}