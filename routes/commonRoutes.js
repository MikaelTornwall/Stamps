var express = require("express");
var router = express.Router();

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/", function(req,res){
	res.render("common/index");
});

router.get("/campaigns", function(req,res){
	res.render("common/campaigns");
});

router.get("/campaigns/:id", function(req,res) {
	res.render("common/campaign", {id:req.params.id});
});

router.get("/rewards", function(req,res){
	res.render("common/rewards");
});

router.get("/rewards/:id", function(req,res){
	res.render("common/reward", {id:req.params.id});
});

router.get("/login", function(req,res){
	res.render("common/login");
});


module.exports = router;