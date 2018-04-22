var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Campaign = require("../models/campaign");
var Stamp = require("../models/stamp");
var middleware = require("../middleware/index.js");


//========================================================
//BASIC ROUTES 
//========================================================



router.get("/customer", middleware.isAuthenticatedCustomer, function(req,res){
	Stamp.find({holder:req.user.username}, function(err, foundStamps) {
		if(err) {
			console.log("error retreiving stamps");
			res.redirect("/");
		} else {
			console.log("stamps retreived");
			res.render("customer/profile", {user:req.user, stamps:foundStamps});
		}
	});
});

router.get("/customer/:campaigntitle", middleware.isAuthenticatedCustomer, function(req,res){
	Campaign.find({title:req.params.campaigntitle}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			res.redirect("/customer");
		} else {
			console.log("campaigns retreived");
			Stamp.find({holder:req.user.username, campaign:req.params.campaigntitle}, function(err, foundStamps) {
				if(err) {
					console.log("error retreiving stamps");
					res.redirect("/customer");
				} else {
					console.log("stamps retreived");
					res.render("customer/card", {user:req.user, stamps:foundStamps, campaign:foundCampaign});
				}
			});
		}
	});
});

module.exports = router;