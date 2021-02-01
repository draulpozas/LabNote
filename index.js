require('./config/config');
const app = require('express') ();
const mongoose = require('mongoose');
const hbs = require('hbs');

// DB connection
mongoose.connect(process.env.CONN_URL, (err, res) => {
    if (err) throw err;

    console.log('connected to ', process.env.CONN_URL);
});

// handlebars
app.set('view engine', 'hbs');
hbs.registerPartials('./views/partials'); // register hbs partials

// paths
app.use(require('./paths/product.js'));
app.use(require('./paths/entry.js'));

// pages
app.get('/', function(req, res) {res.render('home');});

// port setup
app.listen(process.env.PORT, () => {
    console.log('listening through ', process.env.PORT);
});