var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');

Product.createMapping(function(err, mapping) {
  if (err) {
    console.log("error create mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function() {
  count++;
});

stream.on('close', function() {
  console.log("Indexed" + count + "documents");
});

stream.on('error', function(err) {
  console.log(err);
});

router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next) {
  if (req.query.q) {
    Product.search({
      query_string: { query: req.query.q }
    }, function(err, results) {
      results:
      if (err) return next(err);
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

//pengendali untuk menuju halaman home ketika di akses root
router.get('/', function(req, res) {
  res.render('main/home');
});

//pengendali untuk munuju halaman about
router.get('/about', function(req, res) {
  res.render('about');
});

router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.render('main/category', {
        products: products
      });
    });
});

router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});

module.exports = router;