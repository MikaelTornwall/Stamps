var bodyParser = 			require("body-parser"),
	methodOverride = 		require("method-override"),
	mongoose = 				require("mongoose"),
	passport = 				require("passport"),
	LocalStrategy = 		require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	express = 				require("express"),
	app		= 				express();

app.use(require("express-session")({
	secret: "SECRETSTRING",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
<<<<<<< HEAD
app.use(express.static(__dirname + "public"));
=======
app.use(express.static("public"));
app.use(methodOverride("_method"));
>>>>>>> master

var url = process.env.DATABASEURL || "mongodb://localhost/stamps";
mongoose.connect(url);

var commonRoute = require("./routes/commonRoutes");
var companyRoute = require("./routes/companyRoutes");
var customerRoute = require("./routes/customerRoutes");
app.use(commonRoute);
app.use(companyRoute);
app.use(customerRoute);

var User = require("./models/user");
var Card = require("./models/card");
var Stamp = require("./models/stamp");
var Campaign = require("./models/campaign");
var Reward = require("./models/reward");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/*", function(req,res) {
	res.render("common/index");
});

app.listen(process.env.PORT || 3000, function() {
	console.log("Stamping");
});
