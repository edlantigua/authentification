//jshint esversion:6
require('dotenv').config()
const express = require('express'),
       ejs    = require('ejs'),
  bodyParser  =  require('body-parser'),
  mongoose    = require('mongoose'),
   bcrypt     = require('bcrypt'),
    app = express();

// here we specify the numbers of salts we'll implement

const saltRounds = 10;

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
      if(err){
         console.log("we had a problem " + err)
         return  res.redirect("/login");
      }  else{
         if(foundUser){
           console.log("WO00HAA there is no problem")
         //   esto es lo que compara la hashed password que tenemos en la database con
         //   las que el user esta poniendo cuando trata de entrar a la pagina
           bcrypt.compare(password, foundUser.password, function(err, result) {
             if(result === true){
              res.render("secrets");
             }

         }
           )}
      }
      
   })
});


app.get("/register", function(req,res){
   res.render("register");
});

app.post('/register', function(req, res){
//  Esta es la manera como creamos hashed password and we also 
//  salt it to make it harder to crack
//  encrypt will encrypt the passowrd here
  const password = req.body.password;
// this is the code needed to bcrypt an user when creating it
  bcrypt.hash(password, saltRounds, function(err, hash) {
   const newUser = new User ({
      email: req.body.username,
      password: hash
 }); 
   
 newUser.save(function(err){
    if(err){
       console.log(err);
   if(err.code === 11000){
   return res.send("this email is already taken");
   }
} 
   else {
      res.render('secrets');
   }
})

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
});

app.get("/submit", function(req,res){
   res.render('submit');
});


app.listen(3000, function(){
   console.log('Crib set on 3000');
})    