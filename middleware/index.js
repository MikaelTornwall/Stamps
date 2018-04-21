var middlewareObj = {};

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

module.exports = middlewareObj;