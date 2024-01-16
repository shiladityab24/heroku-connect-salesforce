const { checkDuplicateUsername, checkConsumerUsername } = require('../middleware/verifySignUp')
const { signin, signup, consumerSignUp, consumerSignIn } = require("../controllers/auth.controller");


module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token,Origin,Content-Type,Accept"
        );
        next();
    });
    app.post(
        "/api/auth/signup",
        checkDuplicateUsername,
        signup
    );
    app.post("/api/auth/signin", signin);
    app.post(
        "/api/auth/consumersignin",
        checkConsumerUsername,
        consumerSignIn
    );

    app.post("/api/auth/consumersignup", consumerSignUp)
};