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
				res.locals.campaign = foundCampaign[0];
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
				var timeDifference = Date.now() - foundStamps[foundStamps.length - 1].requesting_time;
				var allowed_frequency = res.locals.campaign.stamp_get_frequency * 60000 || 5000;
				if(timeDifference > allowed_frequency) {
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

//old code. switch to using res.locals.campaign from campaignExists
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
			var start = foundCampaign.start_time;
			var end = foundCampaign.end_time;
			var now = Date.now();
			console.log("campaigns retreived");
			console.log("Start time: " + start);
			console.log("Now: " + now);
			console.log("End time: " + end);
			//end time is the beginning of the last day. to make that day still valid, + milliseconds in day
			if(start > now) {
				req.flash("error","Campaign has not started yet");
				res.redirect("/customer/" + req.params.campaign);
			} else if(end + 86400000 < now) {
				req.flash("error","Campaign has ended");
				res.redirect("/customer/" + req.params.campaign);
			} else {
				return next();
			}
		}
	});
}

//works
middlewareObj.eligibleForRedemption = function(req, res, next) {
	Stamp.find({holder:req.user.username, campaign:req.params.campaign, granting_time:null}, function(err, foundStamps) {
		if(err) {
			req.flash("error", "Not redeemable");
			console.log("not redeemable");
			res.redirect("/customer/" + req.params.campaign);
		} else {
			if(foundStamps.length >= res.locals.campaign.stamps_needed) {
				res.redirect("/customer/" + res.locals.campaign.title + "/redeem");
			} else {
				return next();
			}
		}
	});
}

//works
middlewareObj.redemptionValid = function(req, res, next) {
	Stamp.find({holder:req.user.username, campaign:req.params.campaign, granting_time:null}, function(err, foundStamps) {
		if(err) {
			req.flash("error", "Not redeemable");
			console.log("not redeemable");
			res.redirect("/customer/" + req.params.campaign);
		} else {
			if(foundStamps.length >= res.locals.campaign.stamps_needed) {
				return next();
			} else {
				res.redirect("/customer/" + req.params.campaign);
			}
		}
	});
}

//definitely broken
middlewareObj.isCustomerEntitled = function(req, res, next) {
	Stamp.find({holder:req.user.username, campaign:req.params.campaign, granting_time:{$ne:null}}, function(err, foundStamps) {
		if(err) {
			console.log("error figuring out entitlement");
			res.redirect("/customer/" + req.params.campaign);
		} else {
			if(foundStamps.length) {
				var timeDifference = Date.now() - foundStamps[foundStamps.length - 1].granting_time;
				var allowedDuration = 1000 * 60 * 15;
				if(timeDifference < allowedDuration) {
					return next();
				} else {
					res.redirect("/customer/" + req.params.campaign);
				}
			} else {
				res.redirect("/customer/" + req.params.campaign);
			}
		}
	});
}

//probably broken too
middlewareObj.redirectToRewardIfEntitled = function(req, res, next) {
	Stamp.find({holder:req.user.username, campaign:req.params.campaign, granting_time:{$ne:null}}, function(err, foundStamps) {
		if(err) {
			console.log("error figuring out entitlement");
			return next();
		} else {
			if(foundStamps.length) {
				var timeDifference = Date.now() - foundStamps[foundStamps.length - 1].granting_time;
				var allowedDuration = 1000 * 60 * 15;
				if(timeDifference < allowedDuration) {
					req.flash = ("success", "You are entitled to the reward");
					res.redirect("/customer/" + req.params.campaign + "/eligible");
				} else {
					return next();
				}
			} else {
				return next();
			}
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