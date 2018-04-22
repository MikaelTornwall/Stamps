var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Stamp = require("../models/stamp");
var Campaign = require("../models/campaign");
var middleware = require("../middleware/index.js");

//========================================================
//BASIC ROUTES 
//========================================================


//get company page by username
router.get("/admin", middleware.isAuthenticatedCompany, function(req,res){
	Campaign.find({"user.username":req.params.username}, function(err, foundCampaigns) {
		if(err) {
			console.log("error retreiving campaigns");
			req.flash("error","error retreiving campaigns");
		} else {
			console.log("campaigns retreived");
			req.flash("success","found the campaigns");
			res.render("company/admin", {user:req.user, campaigns:foundCampaigns});
		}
	});
	
});

router.get("/admin/:campaigntitle", middleware.isAuthenticatedCompany, function(req,res){
	Campaign.find({title:req.params.campaigntitle}, function(err, foundCampaign) {
	// Campaign.find({}, function(err, foundCampaigns) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error","error retreiving campaign");
			res.redirect("/admin");
		} else {
			console.log("campaigns retreived");
			req.flash("success","found the campaign");
			res.render("company/campaign", {user:req.user, campaign:foundCampaign});
		}
	});
});

router.post("/admin/campaigns", middleware.isAuthenticatedCompany, middleware.campaignNameAvailable, function(req,res){
	var campaign = {
		title: req.body.title,
		image: req.body.image,
		start_time: req.body.start,
		end_time: req.body.end,
		description: req.body.description,
		reward: req.body.reward,
		stamps_needed: req.body.stamps,
		company: req.user,
		locations: []
	};
	Campaign.create(campaign, function(err, newCampaign) {
		if(err) {
			console.log("Campaign creation failed");
			req.flash("error", "Campaign creation failed");
			res.redirect("/companies/COMPANYNAME/admin");
		} else {
			console.log("Campaign created");
			req.flash("success", "Campaign successfully created");
			res.redirect("/admin/" + newCampaign.title);
		}
	})
});

module.exports = router;
