const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req,res, next) => {
let token = req.headers["x-access-token"];
if(!token) {
    return res.status(403).send({
        message: "No token provided!"
    });
}

jwt.verify(token,
            config.secret,
            (err,decoded) => {
                if(err) {
                    return res.status(401).send({
                        message: "Unauthorizeed!",
                    });
                }
                req.userId = decoded.userName;
                next();
                });
};

const authJwt = {
    verifyToken: verifyToken
};
module.exports = authJwt;

middleware/index.js
const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");

module.exports = {
    authJwt,
    verifySignUp
};