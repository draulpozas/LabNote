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
            res.status(400).render('error', {err});
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
            res.status(400).render('error', {err});
        } else {
            res.json({
                ok:true,
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
            res.status(400).render('error', {err});
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
    
    // If the provided product's mass is invalid or unspecified, it will be automatically calculated
    let mass;
    if (reqBody.mass && /(^\d+$)|(^\d+\.\d+$)/.test(reqBody.mass)) {
        mass = reqBody.mass;
    } else {
        mass = molarcalc.calc(reqBody.formula).mass;
    }

    let product = new Product({
        name:reqBody.name,
        formula:reqBody.formula,
        mass
    });

    product.save((err, productData) => {
        if (err) {
            res.status(400).render('error', {err});
        } else {
            // res.json({
            //     ok: true,
            //     productData
            // });
            // res.redirect(`/product/${productData._id}`);
            res.render('savedproduct', {product:productData});
        }
    });
});

app.post('/product/:productid', (req, res) => { // It SHOULD be "put", but HTML forms only support GET and POST, for some reason? https://stackoverflow.com/questions/8054165/using-put-method-in-html-form
    let pid = req.params.productid;
    let reqBody = req.body;
    console.log(req);
    Product.findByIdAndUpdate(pid, reqBody, (err, product) => {
        if (err) {
            res.status(400).render('error', err);
        } else {
            res.redirect('/');
        }
    });
});

app.delete('/remove/product/:productid', (req, res) => {
    let pid = req.params.productid;
    // First we should delete all entries related to that product
    Entry.deleteMany({productid: mongoose.Types.ObjectId(pid)});
    // Entry.find({productid: mongoose.Types.ObjectId(pid)}, (err, entries) => {
    //     if (!err) {
    //         entries.forEach(entry => {
    //             console.log(entry);
    //             Entry.findByIdAndDelete(mongoose.Types.ObjectId(entry._id));
    //         });
    //     }
    // });
    Product.findByIdAndDelete(pid, (err, deletedProduct) => {
        if (err) {
            res.status(400).render('error', {err});
        } else {
            res.json({
                ok: true,
                deletedProduct
            });
        }
    });



});

module.exports = app;