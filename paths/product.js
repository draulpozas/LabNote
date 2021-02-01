const app = require('express')();
const mongoose = require('mongoose');
const Product = require('../models/product');
const Entry = require('../models/entry');
const bparser = require('body-parser');
const molarcalc = require('molarcalc');

// body-parser config
app.use(bparser.urlencoded({extended:false}));
app.use(bparser.json());

// Search for reaction products
app.get('/products/:query', (req, res) => {
    let query = req.params.query; // save the query
    let filter; // create the filter

    let isMass = /^(\d+\.?\d*)$/; // create the regex to test if the query contains a mass

    // set the filter accordingly depending on the query
    if (query === '*') {
        filter = {} // empty filter will retrieve all records
    } else if (isMass.test(query)) { // if it's a search by mass, then retrieve all products with a mass similar to that of the query
        query = parseFloat(query);
        filter = {
            $and:[ // record has to fulfill everything inside to be chosen
                {mass:{$gte: query-1}}, // it's mass must be >= the query minus one
                {mass:{$lte: query+1}} // it's mass must be <= the query plus one
            ]
        };
    } else { // if it's not a search by mass, then search for the query's string inside names and formulas
        filter = {
            $or:[ // record has to fulfill one of the requirements inside to be chosen
                {formula: {$regex: query}},
                {name: {$regex: query}}
            ]
        };
    }

    // Now that the filter is built appropriately, we use it:
    Product.find(filter, 'name formula mass', (err, products) => { // second argument are the fields that mongo is going to send back. I assume it just sends everything if unspecified
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                products
            });
        }
    });

});

// Find a unique product
app.get('/product/:productid', (req, res) => {
    let productid = req.params.productid; // save the productid
    // console.log('searching by id:', productid);

    Product.findById(productid, (err, product) => { // second argument are the fields that mongo is going to send back. I assume it just sends everything if unspecified
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                product
            });
        }
    });

});

// Search for entries related to a product
app.get('/:productid/entries', (req, res) => {
    let entryproductid = req.params.productid; // get the query
    let filter = { // find all entries for that product's id
        productid: mongoose.Types.ObjectId(entryproductid)
    }

    Entry.find(filter, 'title yield', (err, entries) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                entries
            });
        }
    });
});

// Save new products
app.post('/product', (req, res) => {
    let reqBody = req.body;
    let product = new Product({
        name:reqBody.name,
        formula:reqBody.formula,
        mass:molarcalc.calc(reqBody.formula).mass // mass is automatically calculated so no need to make the user search for it, just the formula
    });

    product.save((err, productData) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        } else {
            res.json({
                ok: true,
                productData
            });
        }
    });
});

module.exports = app;