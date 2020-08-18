const { response } = require("express");

var express = require("express"),//requiring express framework
    app = express(),
    mongoose= require("mongoose"),//for our database
    bodyParser= require("body-parser"),//body parser to retrieve data from form
    passport= require("passport"),//passport is main auhentication module local and jwt are some of the strategies
    path= require("path");
    
var db= require("./config/keys.js").mongoURI, //DB config
    users= require("./routes/API/users.js"),//we make seperate file for routes
    profile= require("./routes/API/profile.js"),
    posts= require("./routes/API/posts.js");

var port=process.env.PORT||8080;

//connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log("database connected"))
    .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config **************************************************************************
require("./config/passport.js")(passport);

app.use(bodyParser.urlencoded({extended: true}));//to get body of data
app.use(bodyParser.json());    
app.use("/api/users", users);//this denotes users routes starts with "/api/users/"
app.use("/api/profile", profile);
app.use("/api/posts", posts);

//server static assets if in production
if(process.env.NODE_ENV === 'production'){
    //set static folder
    app.use(express.static('client/build'));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.get("/", (req, res) => res.send("hello world"));

app.listen(port, () => console.log(`dev connector started!! on port ${port}`));
