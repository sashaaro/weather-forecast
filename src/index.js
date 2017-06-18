const express = require('express')
const pug = require('pug');
const Widget = require('./models/Widget')
const WidgetManager = require('./components/WidgetManager')
const bodyParser = require('body-parser')
const request = require('request');

const app = express()

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

const widgetManager = new WidgetManager()
const formCompiledFunction = pug.compileFile('templates/form.pug');

app.get('/', async (req, res) => {
    const compiledFunction = pug.compileFile('templates/index.pug');
    const widgets = await widgetManager.findAll()
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

        await widgetManager.save(widget)
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
    const widget = await widgetManager.findById(parseInt(req.params.id))

    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    if  (req.method === 'POST') {
        widget.city = parseInt(req.body.city)
        widget.period = parseInt(req.body.period)
        widget.position = parseInt(req.body.position)

        await widgetManager.save(widget)
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



app.route('/widget/:id').get(async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const widget = await widgetManager.findById(parseInt(req.params.id))

    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    const apiKey = '76e5edb3c65806e097cb33987239ea05'

    const url = 'http://api.openweathermap.org/data/2.5/weather?q=Moscow,ru&appid=' + apiKey
    request(url, (error, response, body) => {
        //const forecast = JSON.parse(body)
        const forecast = [];
        for (let i = 0; i < widget.period; i++) {
            forecast.push(1)
        }
        res.send({
            widget: widget,
            cityTitle: widget.cityTitle,
            forecast: forecast
        })
    })
})

app.listen(3000)