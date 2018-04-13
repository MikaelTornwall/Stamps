var express = require("express");
var router = express.Router();

//========================================================
//BASIC ROUTES 
//========================================================

//no root route, we dont want to list customers
// router.get("/", function(req,res){
// 	res.render("");
// });


router.get("/customers/:id", function(req,res){
	res.render("customer/profile", {id:req.params.id});
});

router.get("/customers/:id/cards", function(req, res) {
	res.render("customer/cards", {id:req.params.id});
});

router.get("/customers/:id/cards/:stampcard", function(req, res) {
	res.render("customer/stampcard", {stampcard:req.params.stampcard,id:req.params.id});
});

module.exports = router;