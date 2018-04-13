var express = require("express");
var router = express.Router();

var User = require("../models/user");
// var Card = require("../models/card");
// var Stamp = require("../models/stamp");
// var Campaign = require("../models/campaign");
// var Reward = require("../models/reward");

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/companies/", function(req,res){
	User.find({role:false} ,function(err, allCompanies) {
		if(err) {
			console.log("error with retrieving companies");
			console.log(err);
			res.render("/");
		} else {
			console.log("RETREIVED ALL COMPANIES");
			console.log(allCompanies)
			res.render("company/index", {companies:allCompanies});
		}
	});
//	res.redirect("/");
});

router.get("/companies/:id", function(req,res){
	res.render("company/profile", {id:req.params.id});
});

router.get("/companies/:id/admin", function(req,res){
	res.render("company/admin", {id:req.params.id});
});

// router.post("/companies/:id/admin/rewards", function(req,res){
// 	var reward = {
// 				requesting: requesting,
// 				granting_date: granting_date,
// 				issuing_company: issuing_company,
// 				coupon: coupon,
// 				owner: owner
// 			};
// 	Reward.create(reward, function(err, newReward) {
// 				if(err) {
// 					console.log("error creating reward");
// 					res.redirect("/companies");
// 				} else {
// 					foundCoupon.stamps.push(createdStamp);
// 					foundCoupon.save();
// 					res.redirect("/coupons");
// 					// Coupon.findOneAndUpdate({_id:foundCoupon._id},{$addToSet: {stamps:createdStamp}},function(err,updatedCoupon) {
// 					// 	if(err) {
// 					// 		console.log("error updating coupon upon stamp request");
// 					// 		res.render("home");
// 					// 	} else {
// 					// 		console.log("Updated");
// 					// 		res.redirect("/coupons");
// 					// 	}
// 					// });
// 				}
// 			}
// 	res.render("company/admin", {id:req.params.id});
// });



module.exports = router;