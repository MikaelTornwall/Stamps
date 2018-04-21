var express = require("express");
var router = express.Router();

var User = require("../models/user");
var Card = require("../models/card");
var Campaign = require("../models/campaign");
var Stamp = require("../models/stamp");


//========================================================
//MIDDLEWARE
//========================================================
function isAuthenticatedCustomer(req,res,next) {
	if(req.isAuthenticated() && req.user.role) {
		return next();
	}
	req.flash("error", "Please login first");
	res.redirect("/login");
}

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//========================================================
//BASIC ROUTES 
//========================================================






router.get("/customers/:id", isAuthenticatedCustomer, function(req,res){
	res.redirect("/customers/" + req.params.id + "/cards");
	// res.render("customer/profile", {id:req.params.id});
});
//require login
router.get("/customers/:id/cards", isAuthenticatedCustomer, function(req, res) {
	Card.find({"owner.username":req.user.username}, function(err, userCards) {
		if(err) {
			console.log("error with retrieving user's cards");
			console.log(err);
			res.render("index");
		} else {
			if(!userCards.length) {
				console.log("NO CARDS FOUND");
				res.render("common/notfound");
			} else {
				console.log("RETREIVED ALL USER'S CARDS");
				res.render("customer/cards", {user:req.user,cards:userCards});
			}
		}
	});
});

router.get("/customers/:id/cards/:cardid", isAuthenticatedCustomer, function(req, res) {
	Card.findById(req.params.cardid, function(err, userCard) {
		if(err) {
			console.log("error with retrieving user's card");
			console.log(err);
			res.redirect("/customers/"+ req.params.id + "/cards");
		} else {
			console.log("RETREIVED ALL USER'S CARDS");
			res.render("customer/card", {user:req.user, card:userCard});
		}
	});
	//res.render("customer/card", {card:req.params.card,id:req.params.id,user:req.user});
});


//Request stamp
router.post("/customers/:id/cards/:cardid", isAuthenticatedCustomer, function(req, res) {
	Card.findById(req.params.cardid, function(err, userCard) {
		if(err) {
			console.log("error with retrieving user's card");
			console.log(err);
			res.redirect("/customers/"+ req.params.id + "/cards");
		} else {
			console.log("RETREIVED ALL USER'S CARDS");
			var stampRequest = {
				id: 0,
				card: {
					id: req.params.cardid
				},
				requesting_time: Date.now(),
				granting_time: null
			};
			Stamp.create(stampRequest, function(err, newStampRequest) {
				Campaign.findByIdAndUpdate(userCard.campaign.id, {
					$addToSet: {
						requests: {
							_id:newStampRequest._id,
							username:req.user.username
						}
					}
				}, 
				function(err, updatedCampaign) {if(err) {
					res.render("customer/card", {user:req.user, card:userCard});
				} else {
					req.flash("success", "Stamp requested");
					res.redirect("/customers/" + req.params.id + "/cards/" + req.params.cardid);
				}}
				);
			});
		}
	});
	
});


//Gets a card and requests a stamp
router.post("/campaigns/:id", isAuthenticatedCustomer, function(req,res){
	Campaign.findById(req.params.id, function(err, foundCampaign) {
		if(err) {
			console.log(err)
		} else {
			var card = {
				id: req.user.cards.length,
				stamps: [],
				owner: {
					id:req.user._id,
					username:req.user.username
				},
				campaign: {
					id:foundCampaign._id,
					title:foundCampaign.title
				},
				stamps_needed: foundCampaign.stamps_needed,
				redeemed: false,
				redeem_time: null
			};
			Card.create(card, function(err, newCard) {
				if(err) {
					console.log("error creating card");
					res.redirect("/campaigns/" + req.params.id);
				} else {
					User.findByIdAndUpdate(req.user._id,
						{
							$addToSet: {
								cards: {
									_id:newCard._id,
									title:newCard.campaign.title
								}
							}
						},
						function(err,updatedUser) {if(err) {} else {}}
					);
					var stampRequest = {
						id: 0,
						card: {
							id: newCard._id
						},
						requesting_time: Date.now(),
						granting_time: null
					};
					Stamp.create(stampRequest, function(err, newStampRequest) {
						Campaign.findByIdAndUpdate(req.params.id, {
							$addToSet: {
								requests: {
									_id:newStampRequest._id,
									username:req.user.username
								}
							}
						}, 
						function(err, updatedCampaign) {if(err) {} else {}}
						);
					});
					res.redirect("/campaigns");
				}
			})
			
		}
	});
});


module.exports = router;