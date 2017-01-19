let passport = require('passport');
let localStrategy = require('passport-local').Strategy;
let User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', `${email} Is An Invalid Email \n`).notEmpty().isEmail();
    req.checkBody('password', `Invalid Password`).notEmpty().isLength({min: 4});
    let errors = req.validationErrors();
    if (errors){
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, (err, user) => {
        if(err){
            return done(err);
        } 
        if(user){
            return done(null, false, {message: `${email} is already in use`});
        }
        let newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save((err, result) => {
            if(err){
                return done(err)
            }
            return done(null, newUser);
        })
    })
}));

passport.use('local.signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', `${email} Is An Invalid Email \n`).notEmpty().isEmail();
    req.checkBody('password', `Invalid Password`).notEmpty()
    let errors = req.validationErrors();
    if (errors){
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, (err, user) => {
        
        if(err){
            return done(err);
        } 
        console.log("1")
        if(!user){
            return done(null, false, {message: `${email} account does not exist`});
        }
        console.log("2")
        if (!user.validPassword(password)) {
            console.log("inside")
            return done(null, false, {message: 'Wrong password.'});
        }
        console.log("3")
        return done(null, user);
    });
}));
