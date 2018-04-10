var express = require("express"),
	app		= express();

app.set("view engine", "ejs");

var commonRoute = require("./routes/common");
app.use(commonRoute);

app.get("/*", function(req,res) {
	res.render("index");
});

app.listen(process.env.PORT || 3000, function() {
	console.log("Stamping");
});