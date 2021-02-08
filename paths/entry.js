const app = require('express')();
const mongoose = require('mongoose');
const Entry = require('../models/entry');
const bparser = require('body-parser');
const showdown = require('showdown');
showdown.setOption('tasklists', true);

// body-parser config
app.use(bparser.urlencoded({extended:false}));
app.use(bparser.json());

// Show an entry given its id
app.get('/entry/:entryid', (req, res) => {
    let entryid = req.params.entryid;
    Entry.findById(entryid, (err, entry) => {
        if (err) {
            res.status(400).redirect(`/error/${err.errors.name}/${err.message}`);
        } else {
            let conv = new showdown.Converter();
            entry.body = conv.makeHtml(entry.body);

            res.json({
                ok: true,
                entry
            });
        }
    });
});

// Find multiple entries via query
app.get('/entries/:query', (req, res) => {
    let query = req.params.query;
    let filter = {
        $or:[
            {title: {$regex:query}},
            {body: {$regex:query}}
        ]
    };

    Entry.find(filter, (err, entries) => {
        if (err) {
            res.status(400).redirect(`/error/${err.errors.name}/${err.message}`);
        } else {
            res.json({
                ok: true,
                entries
            });
        }
    });
});

// Save new entry
app.post('/entry/:productid', (req, res) => {
    // console.log('posting entry');
    let reqBody = req.body;
    let entry = new Entry({
        title:reqBody.title,
        body:reqBody.entrybody,
        yield:reqBody.yield,
        productid:mongoose.Types.ObjectId(req.params.productid)
    });

    entry.save((err, entryData) => {
        if (err) {
            res.status(400).redirect(`/error/${err.errors.name}/${err.message}`);
        } else {
            res.redirect('/');
            // res.json({
            //     ok: true,
            //     entryData
            // });
        }
    });
});

module.exports = app;