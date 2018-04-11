var express = require("express");
var router = express.Router();

//========================================================
//BASIC ROUTES 
//========================================================

router.get("/companies", function(req,res){
	res.render("company/index");
});

router.get("/companies/:id", function(req,res){
	res.render("company/profile", {id:req.params.id});
});


module.exports = router;