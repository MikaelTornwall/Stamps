var middlewareObj = {};
var Campaign = require("../models/campaign");
var User = require("../models/user");
var Stamp = require("../models/stamp");

middlewareObj.isAuthenticatedCustomer = function (req,res,next) {
	if(req.isAuthenticated() && req.user.role) {
		return next();
	}
	req.session.redirectTo = req.path;
	req.flash("error", "Please login first");
	res.redirect("/login");
}

middlewareObj.isAuthenticatedCompany = function(req,res,next) {
	if(req.isAuthenticated() && !req.user.role) {
		return next();
	}
	req.flash("error", "Please login or register as a business first");
	res.redirect("/business/auth");
}

middlewareObj.companyExists = function(req, res, next) {
	var companyName = req.body.company || req.params.company;
	User.find({username:companyName}, function(err, foundCompany) {
		if(err) {
			console.log("error retreiving company");
			req.flash("error", "Company " + companyName + " does not exist");
			res.redirect("/");
		} else {
			if(!foundCompany.length) {
				req.flash("error", "Company " + companyName + " does not exist");
				res.redirect("/");
			} else {
				console.log("companies retreived");
				return next();
			}
		}
	});
}

//Probably doesn't work
middlewareObj.campaignExists = function(req, res, next) {
	var campaign = req.body.campaign || req.params.campaign;
	Campaign.find({title:campaign}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Campaign " + campaign + " does not exist");
			res.redirect("/campaigns");
		} else {
			if(foundCampaign && !foundCampaign.length) {
				req.flash("error", "Campaign " + campaign + " does not exist");
				res.redirect("/campaigns");
			} else {
				console.log("campaigns retreived");
				return next();
			}
		}
	});
}

middlewareObj.campaignNameAvailable = function(req, res, next) {
	var title = req.body.title;
	Campaign.find({title:title}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Couldnt search for Campaign " + title);
			res.redirect("/admin");
		} else {
			if(foundCampaign.length === 0) {
				console.log("Campaign name still available");
				return next();
			} else {
				console.log("Campaign name taken");
				req.flash("error", "Campaign name \'" + title + "\' already taken");
				res.redirect("/admin");
			}
		}
	});
}

//NOT USED ANYWHERE?? if so then remove
middlewareObj.isStampGetAllowed = function(req, res, next) {
	Stamp.find({holder:req.user.username}, function(err, foundStamps) {
		if(err) {
			res.redirect("/");
		} else {
			//If the last stamp gotten (in the array at index .length - 1) has 
			if(!foundStamps.length && foundStamps[foundStamps.length - 1].requesting_time < Date.now() - 60000) {
				console.log("A minute has passed since the last stamp get");
				return next();
			} else {
				console.log("You must wait for a minute before getting another stamp");
				req.flash("error", "You must wait for at least a minute before getting another stamp");
				res.redirect("back");
			}
		}
	});
}
/*
Stamps can only be collected: 
	-in the activity frame of the campaign
	-if enough time has passed since the previous stamp get
*/
middlewareObj.checkStampGetValidity = function(req, res, next) {
	Stamp.find({holder:req.user.username}, function(err, foundStamps) {
		if(err) {
			res.redirect("/");
		} else {
			//If the last stamp gotten (in the array at index .length - 1) has 
			if(foundStamps && foundStamps.length) {
				if(foundStamps[foundStamps.length - 1].requesting_time < Date.now() - 5000) {
					console.log("A minute has passed since the last stamp get");
					return next();
				} else {
					console.log("You have already collected your stamp!");
					req.flash("error", "You have already collected your stamp!");
					res.redirect("/customer/recent");
				}
			} else {
				console.log("No stamps found: new customer?");
				return next();
			}
		}
	});
}

middlewareObj.campaignIsActive = function(req, res, next) {
	Campaign.findOne({title:req.params.campaign}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Error finding the campaign");
			res.redirect("/campaigns");
		} else if(!foundCampaign) {
			console.log("no campaigns found");
			req.flash("error", "Campaign not found");
			res.redirect("/campaigns")
		} else {
			console.log("campaigns retreived");
			//end time is the beginning of the last day. to make that day still valid, + milliseconds in day
			if(foundCampaign.start_time < Date.now() && foundCampaign.end_time  + 86400000 > Date.now()) {
				return next();
			} else {
				req.flash("error","Campaign is currently not ongoing");
				res.redirect("/customer/" + req.params.campaign);
			}
		}
	});
}

middlewareObj.redemptionValid = function(req, res, next) {
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
					req.flash("error", "Not redeemable");
					console.log("not redeemable");
					res.redirect("/customer/" + req.params.campaign);
				} else {
					if(foundStamps.length >= foundCampaign[0].stamps_needed) {
						return next();
					}
				}
			});
		}
	});
}



middlewareObj.stickyFlash = function(req, res, next) {
	console.log(res.locals);
	if(res.locals.success && res.locals.success.length) {
		req.flash("success", res.locals.success);
	}
	if(res.locals.error && res.locals.error.length) {
		req.flash("error", res.locals.error);
	}
	return next();
}

middlewareObj.usernameToLowerCase = function(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    next();
}

module.exports = middlewareObj;