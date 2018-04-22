var middlewareObj = {};
var Campaign = require("../models/campaign");
var Stamp = require("../models/stamp");

middlewareObj.isAuthenticatedCustomer = function (req,res,next) {
	if(req.isAuthenticated() && req.user.role) {
		return next();
	}
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
	var companyName = req.body.company;
	Company.find({username:companyName}, function(err, foundCompany) {
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

//doesnt seem to work??
middlewareObj.campaignExists = function(req, res, next) {
	var campaignTitle = req.body.campaign;
	Campaign.find({title:campaignTitle}, function(err, foundCampaign) {
		if(err) {
			console.log("error retreiving campaign");
			req.flash("error", "Campaign " + campaignTitle + " does not exist");
			res.redirect("/campaigns");
		} else {
			if(!foundCampaign.length) {
				req.flash("error", "Campaign " + campaignTitle + " does not exist");
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

module.exports = middlewareObj;