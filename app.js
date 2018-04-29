var bodyParser 				= require("body-parser"),
	methodOverride 			= require("method-override"),
	mongoose 				= require("mongoose"),
	flash					= require("connect-flash"),
	passport 				= require("passport"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose"),
	express 				= require("express"),
	app						= express();

app.use(require("express-session")({
	secret: process.env.SECRET || "SECRETSTRING",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

var url = process.env.DATABASEURL || "mongodb://localhost/stamps";
mongoose.connect(url);

//========================================================
//MIDDLEWARE
//========================================================

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

var commonRoute = require("./routes/commonRoutes");
var companyRoute = require("./routes/companyRoutes");
var customerRoute = require("./routes/customerRoutes");

app.use(commonRoute);
app.use(companyRoute);
app.use(customerRoute);

var User = require("./models/user");
var Stamp = require("./models/stamp");
var Campaign = require("./models/campaign");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/*", function(req,res) {
	res.render("common/index");
});

app.listen(process.env.PORT || 3000, function() {
	console.log("Stamping");
});
