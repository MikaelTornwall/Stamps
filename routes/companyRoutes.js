var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Stamp = require("../models/stamp");
var Campaign = require("../models/campaign");
var middleware = require("../middleware/index.js");

//========================================================
//MIDDLEWARE
//========================================================


router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


//========================================================
//BASIC ROUTES 
//========================================================

//get company page by id
// router.get("/companies/:id/admin", middleware.isAuthenticatedCompany, function(req,res){
// 	res.render("company/admin", {user:req.user, id:req.params.id, campaigns:req.user.campaigns});
// });

//get company page by username
router.get("/admin", middleware.isAuthenticatedCompany, function(req,res){
	Campaign.find({"company.username":req.params.username}, function(err, foundCampaigns) {
	// Campaign.find({}, function(err, foundCampaigns) {
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

router.post("/admin/campaigns", middleware.isAuthenticatedCompany, function(req,res){
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
			res.redirect("/campaigns");
		}
	})
});

/**********************************************************************************************************
Old routes, don't use
/**********************************************************************************************************/

router.get("/companies/:id/admin/campaigns/:campaignid", middleware.isAuthenticatedCompany, function(req,res){
	Campaign.findById(req.params.campaignid, function(err, foundCampaign) {
		if(err) {
			console.log("error reaching admin campaigns");
			res.redirect("/companies/COMPANYNAME/admin");
		} else {
			console.log("campaign found for admin page");
			res.render("company/campaign", {user:req.user, id:req.params.id, campaign:foundCampaign});
		}
	});
});

router.put("/companies/:id/admin/campaigns/:campaignid/stamps/:stampid/", middleware.isAuthenticatedCompany, function(req,res){
	Stamp.findById(req.params.stampid, function(err, foundStamp) {
		if(err) {
			console.log("STAMP NOT FOUND WHILE GRANTING STAMP");
			res.redirect("/companies/"+req.params.id+"/admin/campaigns/"+req.params.campaignid);
		} else {
			// stamp = foundStamp;
			if(foundStamp !== null) {
				foundStamp.granting_time = Date.now();
				foundStamp.save();
				console.log("stamp given a granting_time");
				Card.findByIdAndUpdate(foundStamp.card.id,
					{
						$addToSet: {
							stamps: {
								_id:foundStamp._id
							}
						}
					}, function(err, foundCard) {
						if(err) {
						console.log("CARD TO BE GRANTED STAMP NOT FOUND, THUS NOT UPDATED");
					} else {
						//remove the stamp request from the requests array
						Campaign.findById(req.params.campaignid, function(err, foundCampaign) {
							if(err) {} else {
								console.log("searching for request");
								// res.redirect("/companies/"+req.params.id+"/admin/campaigns/"+req.params.campaignid);
								for(var i = 0; i < foundCampaign.requests.length; i++) {
									if(foundCampaign.requests[i]._id == req.params.stampid) {
										console.log("stamp found in campaign requests");
										foundCampaign.requests.splice(i,1);;
										foundCampaign.save();
									}
								}
								res.render("company/campaign", {user:req.user, id:req.params.id, campaign:foundCampaign});
							}
						});
					}}
				);
			} else {
				console.log("no stamp found, nothing updated");
			}
		}
		
	});
});



module.exports = router;
