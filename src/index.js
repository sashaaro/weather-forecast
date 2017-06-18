const express = require('express')
const pug = require('pug');
const Widget = require('./models/Widget')
const User = require('./models/User')
const WidgetRepository = require('./components/WidgetRepository')
const fetchWeatherForeCase = require('./components/fetchWeatherForeCase')
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const app = express()

const projectParameters = require('../parameters.json')

app.use(express.static('public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const verifyCallBack = (username, password, done) => {
    User.findOne({ name: username }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}

const localStrategy = new LocalStrategy(verifyCallBack)
passport.use(localStrategy)

const widgetRepository = new WidgetRepository()
const formCompiledFunction = pug.compileFile('templates/form.pug');

app.get('/', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }
    const compiledFunction = pug.compileFile('templates/index.pug');
    const widgets = await widgetRepository.findByUserID(req.user._id)
    res.send(compiledFunction({
        req,
        widgets,
        projectParameters,
        pageTitle: 'Список виджетов'
    }))
})

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.send(pug.compileFile('templates/login.pug')({req}))
});

app.route('/sign-up').all(async (req, res) => {
    if (req.user) {
        return res.redirect('/')
    }
    const user = new User({});

    let errors = {};
    if  (req.method === 'POST') {
        user.name = req.body.name
        user.password = req.body.password

        errors = user.validateSync()
        if (!errors) {
            user.save((err, user) => {
                req.login(user, (error) => {
                    if (err) { return next(err); }
                    return res.redirect('/');
                })
            })
            return;
        }
    }

    res.send(pug.compileFile('templates/sign-up.pug')({
        req,
        user,
        errors: errors.errors
    }))
})

app.route('/add').all(async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }

    const widget = new Widget()

    if  (req.method === 'POST') {
        widget.user = req.user._id
        widget.city = parseInt(req.body.city)
        widget.period = parseInt(req.body.period)
        widget.position = parseInt(req.body.position)

        await widgetRepository.save(widget)
        res.redirect('/');
    } else {
        res.send(formCompiledFunction({
            req,
            widget,
            pageTitle: 'Добавить новый виджет',
            cities: Widget.allowedCities(),
            periods: Widget.allowedPeriods(),
            positions: Widget.allowedPositions()
        }))
    }
})

app.route('/edit/:id').all(async (req, res) => {
    if (!req.user) {
        return res.redirect('/login')
    }

    const widget = await widgetRepository.findOneById(parseInt(req.params.id))

    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }
    if (req.user._id !==  widget.user) {
        res.status(405);
        res.send({ error: 'No access' });
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
            req,
            widget,
            pageTitle: 'Редактировать виджет',
            cities: Widget.allowedCities(),
            periods: Widget.allowedPeriods(),
            positions: Widget.allowedPositions()
        }))
    }
})


app.route('/widget/:id').get(async (req, res) => { // TODO by unique secret token
    res.header("Access-Control-Allow-Origin", "*");

    const widget = await widgetRepository.findOneById(parseInt(req.params.id))
    if (!widget) {
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    const forecast = await fetchWeatherForeCase(widget, projectParameters.openWeatherApiKey)
    res.send({
        widget,
        forecast,
        cityTitle: widget.cityTitle,
    })
})


mongoose.connect('mongodb://localhost/weather-forecast');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    app.listen(3000)
});