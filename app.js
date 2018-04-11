var express = require("express"),
	bodyParser = require("body-parser");
	app		= express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var commonRoute = require("./routes/commonRoutes");
app.use(commonRoute);

app.get("/*", function(req,res) {
	res.render("index");
});

app.listen(process.env.PORT || 3000, function() {
	console.log("Stamping");
});