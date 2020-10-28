//jshint esversion:6
require('dotenv').config()
const express = require('express'),
       ejs    = require('ejs'),
  bodyParser  =  require('body-parser'),
  mongoose    = require('mongoose'),
  session     =  require('express-session'),
  passport    =  require('passport'),
passportLocalMongoose = require('passport-local-mongoose'),  
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
   password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
     res.render('home');
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
   if(req.isAuthenticated()){
      res.render('secrets');
   } else {
      res.redirect("/login");
   }
})

app.post('/register', function(req, res){

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
   res.render('submit');
});


app.listen(3000, function(){
   console.log('Crib set on 3000');
})    