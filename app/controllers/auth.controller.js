const db = require("../models");
const config = require("../config/auth.config");
const  User = db.user;
const Consumer = db.consumer;
// const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


const generateToken = (payload) => {
    const token = jwt.sign(
        payload,
        config.secret,
        {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, //24 hours
        });
    return token
}
exports.signup = (req, res) => {
    // Save User to Database
    const { userName, password, firstName, lastName, dealerType } = req.body
    User.create({
        userName: userName,
        password: bcrypt.hashSync(password, 8),
        firstName: firstName,
        lastName: lastName,
        dealerType: dealerType
    })
        .then(user => {
            res.status(200).send({ message: "User was registered successfully" });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            userName: req.body.userName
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }
            const token = generateToken({
                userName: user.userName,
                dealerType: user.dealerType,
                name: `${user.firstName} ${user.lastName}`
            })
            res.status(200).send({
                message: "TVS Dealer logged in successfully",
                accessToken: token
            })
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.consumerSignUp = (req, res) => {
    // Save User to Database
    Consumer.create(req.body)
        .then(user => {
            const token = generateToken({
                userName: user.userName,
                name: `${user.firstName} ${user.lastName}`
            })
            res.status(200).send({
                message: "User was registered successfully",
                accessToken: token
            });
        })
        .catch(err => {
            res.status(401).send({ message: err.message });
        });
};

exports.consumerSignIn = (req, res) => {
    Consumer.findOne({
        where: {
            userName: req.body.userName
        }
    })
        .then(user => {
            const token = generateToken({
                userName: user.userName,
                name: `${user.firstName} ${user.lastName}`
            })
            res.status(200).send({
                message: "TVS Consumer logged in successfully",
                accessToken: token
            })
        })
        .catch(err => {
            res.status(401).send({ message: err.message });
        });
}