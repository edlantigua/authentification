
//jshint esversion:6
require('dotenv').config()
const express = require('express'),
       ejs    = require('ejs'),
  bodyParser  =  require('body-parser'),
  mongoose    = require('mongoose'),
  session     =  require('express-session'),
  passport    =  require('passport'),
passportLocalMongoose = require('passport-local-mongoose'),
GoogleStrategy = require('passport-google-oauth20').Strategy,
 findOrCreate = require("mongoose-findorcreate"),
 FacebookStrategy = require('passport-facebook').Strategy,  
    app = express();


app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
   secret:"This is my litle litle litle secret hope you enjoy it",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/saveDB", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema ({
   email : String,
   password: String,
   googleId: String,
   facebookId: String,
   secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// con este metodo podemos serialize o deserialize
// cualquier user sin importar la estrategia si es por google
// o facebook o twitter
passport.serializeUser(function(user, done) {
   done(null, user.id);
 });
 
 passport.deserializeUser(function(id, done) {
   User.findById(id, function(err, user) {
     done(err, user);
   });
 });

passport.use(new GoogleStrategy({
   clientID: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET,
   callbackURL: "http://localhost:3000/auth/google/secrets",
   userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
 },
 function(accessToken, refreshToken, profile, cb) {
    console.log(profile + accessToken + refreshToken);
   User.findOrCreate({ googleId: profile.id }, function (err, user) {
     return cb(err, user);
   });
 }
));

passport.use(new FacebookStrategy({
   clientID: process.env.FACEBOOK_ID,
   clientSecret: process.env.FACEBOOK_SECRET,
   callbackURL: "http://localhost:3000/auth/facebook/secrets"
 },
 function(accessToken, refreshToken, profile, cb) {
    console.log(profile + accessToken + refreshToken);
   User.findOrCreate({ facebookId: profile.id }, function (err, user) {
     return cb(err, user);
   });
 }
));


app.get("/", function(req,res){
     res.render('home');
});

// es la informacion que mandamos a google para que nos
// authenticate el usuario
app.get("/auth/google",
   passport.authenticate('google',  { scope: ['profile'] })
);

// es la informacion que nos manda google a este Router
// cuando authentifica al usuario
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets route.
    res.redirect('/secrets');
  });


 app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });


app.get("/login", function(req,res){
   res.render("login");
});


app.post("/login", function(req,res){

 const user = new User({
    username: req.body.username,
    password: req.body.password
 });
 
 req.logIn(user, function(err){
    if(!user){

   return  res.redirect('/login');

    } else if(err){
    return  res.redirect('/login');
    } else{
       passport.authenticate('local')(req, res, function(){
          res.redirect('/secrets');
       })
    }
 })

});

app.get("/logout", function(req, res){
   req.logout();
   res.redirect('/');
})

app.get("/register", function(req,res){
   res.render("register");
});

app.get("/secrets", function(req, res){
   // if(req.isAuthenticated()){
   //    res.render('secrets');
   // } else {
   //    res.redirect("/login");
   // }

   // look for all  users how's secrets is not empty
   User.find({"secret": {$ne: null}}, function(err, foundUser){
      if(err){
         console.log(err);
      } else {
          if(foundUser){
         res.render('secrets', {usersWithSecret : foundUser});
          }
      }
   })
})

app.post('/register', function(req, res){
// user registration
  User.register({username: req.body.username}, req.body.password, function(err, user){
     console.log(req.body.username);
     console.log(req.body.password);
     if(err){
        console.log(err)
        res.redirect('/register');
     } else {
        passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets');
        });
     }

  });

});


//   this will also work 
   //  User.create({email: req.body.username, password: req.body.password}, function(err, user){
   //        if(!err){
   //           console.log("Successfully created an user")
   //           console.log(user);
   //           res.render("secrets");
   //        } else{
   //           console.log("There is a problem " + err);
   //           res.redirect("/register");
   //        }
   //  })

app.get("/submit", function(req,res){
   if(req.isAuthenticated()){
      res.render('submit');
   } else {
      res.redirect("/login");
   }
});

app.post("/submit", function(req,res){
 const submittedSecret = req.body.secret;
// passport save the users information so we can console.log it

 console.log(req.user.id);

 User.findById(req.user.id, function(err, user){
   if(err){
      console.log(err);
   } else {
      if (user){
         user.secret = submittedSecret;
         user.save(function(){
            res.redirect('/secrets');
         });
      }
   }
         
 })

});

app.listen(3000, function(){
   console.log('Crib set on 3000');
})    