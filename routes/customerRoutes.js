var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Campaign = require("../models/campaign");
var Stamp = require("../models/stamp");
var middleware = require("../middleware/index.js");


/*
Unnecessary profile page disabled
*/
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

/*
Find the latest stamp and redirect to the campaign of that stamp
If no stamps are found, redirect to the campaigns list page instead
*/
router.get("/customer/recent", middleware.isAuthenticatedCustomer, middleware.stickyFlash, function(req,res){
	Stamp.find({holder:req.user.username}, function(err, foundStamps) {
		if(err || !foundStamps.length) {
			console.log("No stamps found, probably new customer");
			res.redirect("/campaigns");
		} else {
			console.log("stamps retreived");
			res.redirect("/customer/" + foundStamps[foundStamps.length - 1].campaign);
		}
	});
});

/*
The main view for customers. Gets the relevant stamps and draws them on a card template
*/
router.get("/customer/:campaign", 
middleware.isAuthenticatedCustomer, 
middleware.redirectToRewardIfEntitled,
function(req,res){
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

/*
Trying different indentation.
Redeems stamps as per instructions and takes you to the main stamp card view
*/
//using old code, switch to using res.locals.campaign instead of retreiving from server
router.get("/customer/:campaign/redeem",
middleware.isAuthenticatedCustomer,
middleware.campaignExists,
middleware.campaignIsActive,
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
				Stamp.update({holder:req.user.username, campaign:req.params.campaign, granting_time:null}, 
					{
						$set: {
							granting_time:Date.now()
						}
					}, function(err, foundStamps) {
					if(err) {
						console.log("Failed to redeem a stamp");
					} else {
						console.log("A stamp redeemed");
					}
				});
			}
			req.flash("success", "Stamps are redeemed, please collect your reward!");
			res.redirect("/customer/" + req.params.campaign);
		}
	});
});

router.get("/customer/:campaign/eligible", 
middleware.isAuthenticatedCustomer, 
middleware.isCustomerEntitled, 
function(req, res) {
	res.render("partials/coffeereward");
});

module.exports = router;