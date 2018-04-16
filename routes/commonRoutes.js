var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
// // var Card = require("../models/card");
// // var Stamp = require("../models/stamp");
var Campaign = require("../models/campaign");
var Reward = require("../models/reward");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//========================================================
//BASIC ROUTES 
//========================================================


router.get("/companies/", function(req,res){
	User.find({role:false}, function(err, allCompanies) {
		if(err) {
			console.log("error with retrieving companies");
			console.log(err);
			res.render("index");
		} else {
			if(!allCompanies.length) {
				console.log("NO COMPANIES FOUND");	
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL COMPANIES");
				res.render("company/index", {companies:allCompanies});
			}
		}
	});
});

router.get("/companies/:id", function(req,res){
	User.findById(req.params.id, function(err, foundCompany) {
		if(err) {
			res.redirect("/companies");
		} else {
			if(!foundCompany) {
				console.log("COMPANY NOT FOUND");
				res.render("common/notfound");
			} else {
				res.render("company/profile", {company:foundCompany});
			}
		}
	});
});


router.get("/", function(req,res){
	res.render("common/index");
});

router.get("/campaigns", function(req,res){
	Campaign.find({}, function(err, allCampaigns) {
		if(err) {
			console.log("error with retrieving campaigns");
			console.log(err);
			res.render("index");
		} else {
			if(!allCampaigns.length) {
				console.log("NO CAMPAIGNS FOUND");	
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL CAMPAIGNS");
				res.render("common/campaigns", {campaigns:allCampaigns});
			}
		}
	});
});

router.get("/campaigns/:id", function(req,res) {
	Campaign.findById(req.params.id, function(err, foundCampaign) {
		if(err) {
			res.redirect("/campaigns");
		} else {
			if(!foundCampaign) {
				console.log("CAMPAIGN NOT FOUND");
				res.render("common/notfound");
			} else {
				res.render("common/campaign", {campaign:foundCampaign});
			}
		}
	});
});

router.get("/rewards", function(req,res){
	Reward.find({}, function(err, allRewards) {
		if(err) {
			console.log("error with retrieving rewards");
			console.log(err);
			res.render("index");
		} else {
			if(!allRewards.length) {
				console.log("NO REWARDS FOUND");	
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL REWARDS");
				res.render("common/rewards", {rewards:allRewards});
			}
		}
	});
});



router.get("/rewards/:id", function(req,res){
	Reward.findById(req.params.id, function(err, foundReward) {
		if(err) {
			res.redirect("/rewards");
		} else {
			if(!foundReward) {
				console.log("REWARD NOT FOUND");
				res.render("common/notfound");
			} else {
				res.render("common/reward", {reward:foundReward});
			}
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

router.post("/login/customer", passport.authenticate("local", {
	successRedirect: "/customers/" + "USERNAME" + "/cards",
	failureRedirect: "/login",
}), function(req,res) {});

router.post("/login/company", passport.authenticate("local", {
	successRedirect: "/companies/" + "COMPANYNAME" + "/admin",
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
			res.redirect("/customers/" + user.username + "/cards");
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
			res.redirect("/companies/" + user.username + "/admin");
		});
	});
	res.redirect("/");
});


router.get("/logout",function(req, res){
	req.logout();
	res.redirect("/");
});



module.exports = router;