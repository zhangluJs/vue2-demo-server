/**
 * @file goods接口子路由
 * @author zhanglu
 */

let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Goods = require('../models/good');

// 链接mongodb数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall');

mongoose.connection.on('connected', function () {
    console.log('MongoDB connected success');
});

mongoose.connection.on('error', function () {
    console.log('MongoDB connected error');
});

mongoose.connection.on('disconnected', function () {
    console.log('MongoDB connected disconnected');
});

// 获取商品列表/分页功能
router.get('/list', function (req, res, next) {
    let page = parseInt(req.param('page'), 10);
    let pageSize = parseInt(req.param('pageSize'), 10);
    let sort = parseInt(req.param('sort'), 10);
    let priceLevel = req.param('priceLevel');
    let priceGT = '';
    let priceLT = '';
    let skip = (page - 1) * pageSize;
    let params = {};
    if (priceLevel !== 'all') {
        switch (priceLevel) {
            case '0':
                priceGT = 0;
                priceLT = 100;
                break;
            case '1':
                priceGT = 100;
                priceLT = 500;
                break;
            case '2':
                priceGT = 500;
                priceLT = 1000;
                break;
            case '3':
                priceGT = 1000;
                priceLT = 5000;
                break;
        }
        params = {
            salePrice: {
                $gt: priceGT,
                $lte: priceLT
            }
        };
    }

    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);

    goodsModel.sort({
        salePrice: sort
    });

    goodsModel.exec({}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            });
        }
        else {
            res.json({
                status: '0',
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            });
        }
    });
});

// 添加到购物车
router.post('/addCart', function (req, res, next) {
    // let userId = req.body.userId;
    let userId = '100000077';
    let Users = require('../models/user');
    let productId = req.body.productId;

    Users.findOne({
        userId: userId
    }, function (err, userDoc) {
        return new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(userDoc);
            }
        });
    }).then(userDoc => {
        let goodsItem;
        userDoc.cartList.forEach(item => {
            if (item.productId === productId) {
                item.productNum++;
                goodsItem = item;
            }

        });
        if (goodsItem) {
            cartListSave(userDoc);
        }
        else {
            Goods.findOne({
                productId
            }, function (productErr, productDoc) {
                return new Promise((resolve, reject) => {
                    if (productErr) {
                        reject(productErr);
                    }
                    else {
                        productDoc.productNum = 1;
                        productDoc.checked = 1;
                        userDoc.cartList.push(productDoc);
                        cartListSave(userDoc);
                    }
                });
            });
        }
    }).catch(err => {
        res.json({
            status: '1',
            msg: err.message
        });
    });

    function cartListSave(userDoc) {
        userDoc.save(function (saveErr, saveUserDoc) {
            if (saveErr) {
                res.json({
                    status: '1',
                    msg: saveErr.message
                });
            }
            else {
                res.json({
                    status: '0',
                    msg: '',
                    result: 'success'
                });
            }
        });
    }
});

module.exports = router;
