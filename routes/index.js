let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let Cart = require('../models/cart');
let Order = require('../models/order');

let Product = require('../models/product');

let IsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  let successMsg = req.flash('success')[0];
  Product.find((err, doc) => {
    let productChucks = [];
    let chuckSize = 3;
    for (let i = 0; i < doc.length; i += chuckSize){
      productChucks.push(doc.slice(i, i + chuckSize));
    }
    res.render('shop/index', { title: 'Express', products: productChucks, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
})

router.get('/checkout', IsLoggedIn, (req, res, next) => {
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  let cart = new Cart(req.session.cart);
  let errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg})
});

router.post('/checkout', IsLoggedIn, (req, res, next) => {
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }

  let cart = new Cart(req.session.cart)

  var stripe = require("stripe")(
  "sk_test_gqMnqzGcNSuWannk8mxTFc00"
  );

  stripe.charges.create({
  amount: cart.totalPrice * 100,
  currency: "gbp",
  source: req.body.stripeToken, // obtained with Stripe.js
  description: "Test Charge"
  }, function(err, charge) {
    if(err){
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }

    let order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });

    order.save((err, result) => {
      // if (err){
      // }
      req.flash('success', 'Successfully brought product');
      req.session.cart = null;
      res.redirect('/');
    });  
  });
});

module.exports = router;
