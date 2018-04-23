var express = require("express");
var router = express.Router();
var passport = require("passport");
var middleware = require("../middleware/index.js");

var User = require("../models/user");
var Campaign = require("../models/campaign");
var Stamp = require("../models/stamp");

//========================================================
//HELPER FUNCTIONS
//========================================================

var CUSTOMER = true;
var COMPANY = false;

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/", function(req,res){
	res.render("common/index");
});

// router.post("/stamp", middleware.isAuthenticatedCustomer, middleware.campaignExists, middleware.isStampGetAllowed, function(req,res){
router.post("/stamp", middleware.isAuthenticatedCustomer, middleware.campaignExists, function(req,res){
	var stamp = {
		id: 1,
		company: req.body.company,
		holder: req.user.username,
		campaign: req.body.campaign,
		requesting_time: Date.now(),
		granting_time: null,
		identifier: req.body.identifier
	}
	Stamp.create(stamp, function(err, newStamp) {
		if(err) {
			req.flash("error", "Stamp get failed");
			res.redirect("/");
		} else {
			req.flash("success", "Successfully got stamp");
			res.redirect("/customer/" + newStamp.campaign);
		}
	});
});

//TODO: reimplement middleware.campaignExists, there may have been an issue with it
router.get("/stamp/:company/:campaign/:identifier", middleware.isAuthenticatedCustomer, function(req,res){
	var stamp = {
		id: 1,
		company: req.params.company,
		holder: req.user.username,
		campaign: req.params.campaign,
		requesting_time: Date.now(),
		granting_time: null,
		identifier: req.params.identifier
	}
	Stamp.create(stamp, function(err, newStamp) {
		if(err) {
			req.flash("error", "Stamp get failed");
			res.redirect("/");
		} else {
			req.flash("success", "Successfully got stamp");
			res.redirect("/customer/" + newStamp.campaign);
		}
	});
});


router.get("/campaigns", function(req,res){
	// getCampaignsAndRender(res, "common/campaigns");
	Campaign.find({}, function(err, allCampaigns) {
		if(err) {
			console.log("error retreiving campaign");
			res.redirect("/");
		} else {
			if(!allCampaigns.length) {
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL CAMPAIGNS");
				res.render("common/campaigns", {campaigns:allCampaigns});
			}
		}
	});
});

router.get("/campaigns/:title", function(req,res) {
	Campaign.find({title:req.params.title}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			res.redirect("/");
		} else {
			console.log("campaign retreived");
			res.render("common/campaign", {campaign:foundCampaign});
		}
	});
});

router.get("/login", function(req,res){
	res.render("common/login");
});

router.get("/register", function(req,res){
	res.render("common/register");
});

router.get("/business/auth", function(req,res){
	res.render("common/businessauth");
});

// router.post("/login/customer", passport.authenticate("local", {
// 	successRedirect: "/customer/circularmay",
// 	failureRedirect: "/login",
// 	failureFlash: true
// }), function(req,res) {});

router.post("/login/customer", passport.authenticate("local"), function(req, res) {
	if(!req.user) {
		req.flash("error", "Issue signing up");
		res.redirect("/login");
	} else {
		req.flash("success", "Logged in");
		res.redirect(req.session.redirectTo || '/customer/circularmay');
		delete req.session.redirectTo;
	}
});

router.post("/login/company", passport.authenticate("local", {
	successRedirect: "/admin",
	failureRedirect: "/business/auth",
	failureFlash: true
}), function(req,res) {});



// router.post("/register/customer", function(req,res) {
// 	var newCustomer = 
// 		{
// 			image: req.body.image,
// 			username: req.body.username,
// 			email: req.body.email,
// 			role: true,
// 			cards: [],
// 			campaigns: null,
// 			signup_time: Date.now()
// 		};
// 	User.register(new User(newCustomer), req.body.password, function(err, user) {
// 		if(err) {
// 			console.log(err);
// 			req.flash("error", err.message);
// 			res.redirect("/register");
// 		} else passport.authenticate("local") (req, res, function() {
// 			res.redirect("/customer");
// 		});
// 	});
// });

router.post("/register/customer", function(req,res) {
	var newCustomer = 
	{
		image: req.body.image,
		username: req.body.username,
		email: req.body.email,
		role: true,
		cards: [],
		campaigns: null,
		signup_time: Date.now()
	};
	User.register(new User(newCustomer), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function() {
				req.flash("success", "Logged in");
				res.redirect(req.session.redirectTo || '/customer');
				delete req.session.redirectTo;
			}
		)}
	});
});

router.post("/register/company", function(req,res){
	var newCompany = 
		{
			image: req.body.image,
			username: req.body.username,
			email: req.body.email,
			role: false,
			cards: null,
			campaigns: [],
			signup_time: Date.now()
		};
	User.register(new User(newCompany), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/business/auth");
		} else 	passport.authenticate("local") (req, res, function() {
			res.redirect("/admin");
		});
	});
});


router.get("/logout",function(req, res){
	req.logout();
	req.flash("success", "Logged out");
	res.redirect("/");
});



module.exports = router;