var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
// // var Card = require("../models/card");
// // var Stamp = require("../models/stamp");
// // var Campaign = require("../models/campaign");
// // var Reward = require("../models/reward");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/", function(req,res){
	res.render("common/index");
});

router.get("/campaigns", function(req,res){
	res.render("common/campaigns");
});

router.get("/campaigns/:id", function(req,res) {
	res.render("common/campaign", {id:req.params.id});
});

router.get("/rewards", function(req,res){
	res.render("common/rewards");
});

router.get("/rewards/:id", function(req,res){
	res.render("common/reward", {id:req.params.id});
});

router.get("/login", function(req,res){
	res.render("common/login");
});

router.get("/register", function(req,res){
	res.render("common/register");
});

router.post("/login/customer", passport.authenticate("local", {
	successRedirect: "/customers/" + "USERNAME" + "/cards",
	failureRedirect: "/login",
}), function(req,res) {});

router.post("/login/company", passport.authenticate("local", {
	successRedirect: "/companies/" + "USERNAME" + "/admin",
	failureRedirect: "/login",
}), function(req,res) {});



router.post("/register/customer", function(req,res){
	var newCustomer = 
		{
			image: req.body.image,
			username: req.body.username,
			role: true,
			cards: [],
			campaigns: null,
			signup_time: Date.now()
		};
	User.register(new User(newCustomer), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local") (req, res, function() {
			res.redirect("/customers/" + "USERNAME" + "/cards");
		});
	});
	res.redirect("/");
});

router.post("/register/company", function(req,res){
	var newCompany = 
		{
			image: req.body.image,
			username: req.body.username,
			role: false,
			cards: null,
			campaigns: [],
			signup_time: Date.now()
		};
	User.register(new User(newCompany), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local") (req, res, function() {
			res.redirect("/companies/" + "COMPANYNAME" + "/admin");
		});
	});
	res.redirect("/");
});


router.get("/logout",function(req, res){
	req.logout();
	res.redirect("/");
});



module.exports = router;