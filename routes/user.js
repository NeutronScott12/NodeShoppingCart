let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let passport = require('passport');
let Order = require('../models/order');
let Cart = require('../models/cart')

let csrfProtection = csrf();
router.use(csrfProtection);

let IsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

let IsNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

router.get('/profile', IsLoggedIn, (req, res, next) => {
    Order.find({user: req.user}, (err, orders) => {
        if (err){
            return res.write('error!');
        };
        let cart;
        orders.forEach((order) => {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', {orders: orders});
    });
})

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
})

router.use('/', IsNotLoggedIn, (req, res, next) => {
    next();
})

router.get('/signup', (req, res, next) => {
  let messages = req.flash('error')
  res.render('user/signup', {csrfToken: req.csrfToken(), message: messages, hasErrors: messages.length > 0})
})

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), (req, res, next) => {
    if(req.session.oldUrl){
        let oldUrl = req.session.oldUrl
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), (req, res, next) => {
    if(req.session.oldUrl){
        let oldUrl = req.session.oldUrl
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

