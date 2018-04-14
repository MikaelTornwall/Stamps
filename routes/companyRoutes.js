var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Card = require("../models/card");
var Stamp = require("../models/stamp");
var Campaign = require("../models/campaign");
var Reward = require("../models/reward");

//========================================================
//MIDDLEWARE
//========================================================
function isAuthenticatedCompany(req,res,next) {
	if(req.isAuthenticated() && !req.user.role) {
		return next();
	}
	res.redirect("/login");
}

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


//========================================================
//BASIC ROUTES 
//========================================================


router.get("/companies/:id/admin", isAuthenticatedCompany, function(req,res){
	res.render("company/admin", {user:req.user, id:req.params.id, campaigns:req.user.campaigns});
});

router.get("/companies/:id/admin/campaigns/:campaignid", isAuthenticatedCompany, function(req,res){
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

router.put("/companies/:id/admin/campaigns/:campaignid/stamps/:stampid/", isAuthenticatedCompany, function(req,res){
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
					}, function(err, foundCard) {if(err) {} else {}}
				);
			} else {
				console.log("no stamp found, nothing updated");
			}
		}
	});
	//remove the stamp request from the requests array
	Campaign.findById(req.params.campaignid, function(err, foundCampaign) {
		if(err) {} else {
			console.log("searching for request");
			res.redirect("/companies/"+req.params.id+"/admin/campaigns/"+req.params.campaignid);
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
	
	
});

router.post("/rewards", isAuthenticatedCompany, function(req,res){
	var reward = {
		title: req.body.title,
		image: req.body.image,
		description: req.body.description,
		company: {
			id: req.user.id_,
			name: req.user.username
		}
	};
	Reward.create(reward, function(err, newReward) {
		if(err) {
			console.log("error creating reward");
			res.redirect("/companies/COMPANYNAME/admin");
		} else {
			res.redirect("/rewards");
		}
	})
});

router.post("/campaigns", isAuthenticatedCompany, function(req,res){
	var campaign = {
		title: req.body.title,
		image: req.body.image,
		start_time: req.body.start,
		end_time: req.body.end,
		description: req.body.description,
		reward: req.body.reward,
		stamps_needed: req.body.stamps,
		requests: []
	};
	Campaign.create(campaign, function(err, newCampaign) {
		if(err) {
			console.log("error creating reward");
			res.redirect("/companies/COMPANYNAME/admin");
		} else {
			User.findByIdAndUpdate(req.user._id,
				{
					$addToSet: {
						campaigns: {
							_id:newCampaign._id,
							title:newCampaign.title
						}
					}
				},
				function(err,updatedUser) {if(err) {} else {}}
			);
			res.redirect("/campaigns");
		}
	})
});

module.exports = router;
