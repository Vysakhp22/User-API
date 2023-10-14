const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const checkAuth = require('../middlewares/check-Auth');

router.post('/signup', (req, res) => {
    User.find({ email: req.body.email }).exec().then((v) => {
        if (v.length) {
            console.log(v);
            return res.status(409).json({
                users: v,
                message: 'User Already Exist'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save().then(() => {
                        res.status(201).json({
                            message: 'User Created'
                        });
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
});

router.post('/login', (req, res) => {
    User.find({ email: req.body.email }) //TODO: findOne
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'unauthorized'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, response) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication failed'
                    });
                }
                if (response) {
                    //jwt.sign has 3 parameters 
                    // 1 parameter is the payload 2 parameter is the secretorprivate key 3 parameter is the [options, callback]

                    console.log(process.env.JWT_KEY);
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );
                    return res.status(200).json({
                        message: 'Authentication successful',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Authentication failed'
                });
            })
        })
        .catch(err => {
            res.status(500).json({
                message: err
            });
        });
});

router.delete('/:userId', checkAuth, (req, res) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then(() => res.status(200).json({
            message: 'User deleted successfully'
        })
        ).catch(err => {
            res.status(500).json({
                message: err
            });
        });
})
module.exports = router;