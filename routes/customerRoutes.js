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
	var DISABLED = true;
	if(DISABLED) {
		req.flash("error", "page not available");
		res.redirect("/customer/recent");
	} else {
		/*
		PROFILE PAGE DISABLED
		*/
		Stamp.find({holder:req.user.username}, function(err, foundStamps) {
			if(err) {
				console.log("error retreiving stamps");
				res.redirect("/");
			} else {
				console.log("stamps retreived");
				res.render("customer/profile", {user:req.user, stamps:foundStamps});
			}
		});
	}
});

router.get("/customer/recent", middleware.isAuthenticatedCustomer, middleware.stickyFlash, function(req,res){
	Stamp.find({holder:req.user.username}, function(err, foundStamps) {
		if(err) {
			console.log("error retreiving stamps");
			res.redirect("/");
		} else {
			if(!foundStamps.length) {
				console.log("No stamps found. New customer?");
				res.redirect("/");
			} else {
				console.log("stamps retreived");
				res.redirect("/customer/" + foundStamps[foundStamps.length - 1].campaign);
			}
		}
	});
});

router.get("/customer/:campaign", middleware.isAuthenticatedCustomer, function(req,res){
	Campaign.find({title:req.params.campaign}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Error finding the campaign");
			res.redirect("/campaigns");
		} else if(!foundCampaign.length) {
			console.log("no campaigns found");
			req.flash("error", "Campaign not found");
			res.redirect("/campaigns")
		} else {
			console.log("campaigns retreived");
			Stamp.find({holder:req.user.username, campaign:req.params.campaign, granting_time:null}, function(err, foundStamps) {
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

router.get("/customer/:campaign/redeem",
middleware.isAuthenticatedCustomer,
middleware.campaignExists,
middleware.redemptionValid,
function(req,res){
	console.log("Attempting to redeem");
	Campaign.find({title:req.params.campaign}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Error finding the campaign");
			res.redirect("/campaigns");
		} else if(!foundCampaign.length) {
			console.log("no campaigns found");
			req.flash("error", "Campaign not found");
			res.redirect("/campaigns")
		} else {
			console.log("campaigns retreived");
			for(var i = 0; i < foundCampaign[0].stamps_needed; i++) {
				Stamp.update({holder:req.user.username, campaign:req.params.campaign, granting_time:null}, {$set: {granting_time:Date.now()}}, function(err, foundStamps) {
					if(err) {
						req.flash("error", "Failed to redeem stamps");
					} else {
						req.flash("success", "Stamps redeemed. Collect your reward!");
					}
					
				});
			}
			res.redirect("/customer/" + req.params.campaign);
		}
	});
});



module.exports = router;