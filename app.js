//jshint esversion:6
require('dotenv').config()
const express = require('express'),
       ejs    = require('ejs'),
  bodyParser  =  require('body-parser'),
  mongoose    = require('mongoose'),
  encrypt     = require('mongoose-encryption'),
    app = express();

app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
//  THIS IS THE WAY SCHEMA MOST BE DONE

const userSchema = new mongoose.Schema ({
   email : {type:String, required: true, unique:true},
   password: String
});

// now we new to create a secret for our mongood encruption



// this will encrypt the whole data base and we just want to encrypt the password so we give it the 
// last argument.

// we can also call for the method decryptPostSave: false  to leave document encrypt in the database
// tenemos que crear otro file para que puede tener nuestra informacion secret y no tener que tenerla en github.
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password'], additionalAuthenticatedFields: ['email']});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
     res.render('home');
});

app.get("/login", function(req,res){
   res.render("login");
});


app.post("/login", function(req,res){
        const password = req.body.password;

//  encrypt will decrept the password here       
   User.findOne({email:req.body.username}, function(err , foundUser){
      if(!err){
         if(foundUser){
         if(foundUser.password === password){
           console.log("WO00HAA there is no problem")
           console.log(password);
        return  res.render("secrets");
         }
      }
         console.log("we had a problem " + err);
         console.log(password);
       return  res.redirect("/login");
      }
      
   })
});


app.get("/register", function(req,res){
   res.render("register");
});

app.post('/register', function(req, res){
   // esta es la forma como yo queria dejarlo pero para encrupt tengo que cambiarlo
//  encrypt will encrypt the passowrd here
  const newUser = new User ({
       email: req.body.username,
       password: req.body.password
  });

  newUser.save(function(err){
     if(err){
        console.log(err);
     } else {
        res.render('secrets');
     }
  })
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
});

app.get("/submit", function(req,res){
   res.render('submit');
});


app.listen(3000, function(){
   console.log('Crib set on 3000');
})    