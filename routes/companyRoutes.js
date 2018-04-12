var express = require("express");
var router = express.Router();

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/", function(req,res){
	res.render("company/index");
});

router.get("/:id", function(req,res){
	res.render("company/profile", {id:req.params.id});
});

router.get("/:id/admin", function(req,res){
	res.render("company/admin", {id:req.params.id});
});


module.exports = router;