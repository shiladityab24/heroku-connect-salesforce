const db = require("../models");
const  User = db.user;
const Consumer = db.consumer;


exports.checkDuplicateUsername = (req, res, next) => {
    //Username
    User.findOne({
        where: {
            userName: req.body.userName
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Username is already in use!"
            });
            return;
        }
        next();
    });
};

exports.checkConsumerUsername = (req, res, next) => {
    //Username
        Consumer.findOne({
            where: {
                userName: req.body.userName
            }
        }).then(user => {
            if (!user) {
                res.status(202).send({
                    message: "User Doesn't Exist"
                });
                return;
            }
            next();
        });
};