const express = require('express')
const pug = require('pug');
const Widget = require('./models/Widget')
const WidgetRepository = require('./components/WidgetRepository')
const bodyParser = require('body-parser')
const request = require('request');

const app = express()

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const widgetRepository = new WidgetRepository()
const formCompiledFunction = pug.compileFile('templates/form.pug');

app.get('/', async (req, res) => {
    const compiledFunction = pug.compileFile('templates/index.pug');
    const widgets = await widgetRepository.findAll()
    res.send(compiledFunction({
        pageTitle: 'Список виджетов',
        widgets: widgets
    }))
})


app.route('/add').all(async (req, res) => {
    const widget = new Widget()

    if  (req.method === 'POST') {
        widget.city = parseInt(req.body.city)
        widget.period = parseInt(req.body.period)
        widget.position = parseInt(req.body.position)

        await widgetRepository.save(widget)
        res.redirect('/');
    } else {
        res.send(formCompiledFunction({
            pageTitle: 'Добавить новый виджет',
            cities: Widget.allowedCities(),
            periods: Widget.allowedPeriods(),
            positions: Widget.allowedPositions(),
            widget: widget
        }))
    }
})

app.route('/edit/:id').all(async (req, res) => {
    const widget = await widgetRepository.findById(parseInt(req.params.id))

    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    if  (req.method === 'POST') {
        widget.city = parseInt(req.body.city)
        widget.period = parseInt(req.body.period)
        widget.position = parseInt(req.body.position)

        await widgetRepository.save(widget)
        res.redirect('/')
    } else {
        res.send(formCompiledFunction({
            pageTitle: 'Редактировать виджет',
            cities: Widget.allowedCities(),
            periods: Widget.allowedPeriods(),
            positions: Widget.allowedPositions(),
            widget: widget
        }))
    }
})


const apiKey = '76e5edb3c65806e097cb33987239ea05'
const cities = [
    'Moscow',
    'Saint Petersburg',
    'Nizhniy Novgorod'
]

const getForeCaseList = (widget) => {
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
app.route('/widget/:id').get(async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const widget = await widgetRepository.findById(parseInt(req.params.id))
    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    const forecast = await getForeCaseList(widget)
    res.send({
        widget,
        forecast,
        cityTitle: widget.cityTitle,
    })
})

app.listen(3000)