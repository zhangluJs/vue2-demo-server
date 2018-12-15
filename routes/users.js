/**
 * @file users接口子路由
 * @author zhanglu
 */

let express = require('express');
let router = express.Router();
let User = require('../models/user');
require('../util/util.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    };
    User.findOne(param, function (err, doc) {
        return new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(doc);
            }
        });
    }).then(doc => {
        res.cookie('userId', doc.userId, {
            path: '/',
            maxAge: 1000 * 60 * 60
        });
        res.cookie('userName', doc.userName, {
            path: '/',
            maxAge: 1000 * 60 * 60
        });
        res.json({
            status: '0',
            msg: '',
            result: {
                userName: doc.userName
            }
        });
    }).catch(err => {
        res.json({
            status: '1',
            msg: err.message
        });
    });
});

router.post('/logout', function (req, res, next) {
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    });
    res.json({
        status: '0',
        msg: '',
        result: ''
    });
});

router.get('/checkLogin', function (req, res, next) {
    if (req.cookies.userId) {
        res.json({
            status: '0',
            msg: '',
            result: req.cookies.userName
        });
    }
    else {
        res.json({
            status: '1',
            msg: '未登录',
            result: ''
        });
    }
});

router.get('/cartList', function (req, res, next) {
    let userId = req.cookies.userId;

    User.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            res.json({
                status: '0',
                msg: '',
                result: doc.cartList
            });
        }
    });
});

// 获取购物车商品数量
router.get('/getCartNum', function (req, res, next) {
    let userId = req.cookies.userId;

    User.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            let cartNum = 0;
            doc.cartList.map(item => {
                cartNum += Number(item.productNum);
            });
            res.json({
                status: '0',
                msg: '',
                result: {
                    cartNum
                }
            });
        }
    });
});

// 删除购物车中的商品
router.post('/del', function (req, res, next) {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    User.update({
        userId: userId
    }, {
        $pull: {
            cartList: {
                productId: productId
            }
        }
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            res.json({
                status: '0',
                msg: '',
                result: doc
            });
        }
    });
});


// 修改购物车中商品的数量
router.post('/cartEdit', function (req, res, next) {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    let productNum = req.body.productNum;
    let checked = req.body.checked;

    User.update({
        'userId': userId,
        'cartList.productId': productId
    }, {
        'cartList.$.productNum': productNum,
        'cartList.$.checked': checked
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            res.json({
                status: '0',
                msg: '',
                result: doc
            });
        }
    });
});

// 修改购物车中所有的商品是否选中
router.post('/cartEditCheckAll', function (req, res, next) {
    let userId = req.cookies.userId;
    let checkAll = req.body.checkAll;

    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            doc.cartList.forEach(element => {
                element.checked = checkAll;
            });
            doc.save(function (err1, doc1) {
                if (err) {
                    res.json({
                        status: '1',
                        msg: err1.message,
                        result: ''
                    });
                } else {
                    res.json({
                        status: '0',
                        msg: '',
                        result: 'success'
                    });
                }
            });
        }
    });
});


// 获取用户地址接口
router.get('/addressList', function (req, res, next) {
    let userId = req.cookies.userId;

    User.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            res.json({
                status: '0',
                msg: '',
                result: doc.addressList
            });
        }
    });
});

// 设置默认地址接口
router.post('/setDefault', function (req, res, next) {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;

    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            let addressList = doc.addressList;
            addressList.forEach(item => {
                if (item.addressId === addressId) {
                    item.isDefault = true;
                }
                else {
                    item.isDefault = false;
                }
            });

            doc.save(function (err1, doc1) {
                if (err) {
                    res.json({
                        status: '1',
                        msg: err1.message,
                        result: ''
                    });
                } else {
                    res.json({
                        status: '0',
                        msg: '',
                        result: ''
                    });
                }
            });
        }
    });
});

// 删除地址接口
router.post('/delAddress', function (req, res, next) {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;

    if (!userId) {
        res.json({
            status: '1',
            msg: 'address is null',
            result: ''
        });
    } else {
        User.update({
            userId: userId
        }, {
            $pull: {
                addressList: {
                    addressId: addressId
                }
            }
        }, function (err, doc) {
            if (err) {
                res.json({
                    status: '1',
                    msg: err.message,
                    result: ''
                });
            } else {
                res.json({
                    status: '0',
                    msg: '',
                    result: doc
                });
            }
        });
    }

});

// 添加地址接口
router.post('/setUpAddress', function (req, res, next) {
    let userId = req.cookies.userId;
    let addressId = req.body.form.addressId;
    let userName = req.body.form.userName;
    let streetName = req.body.form.streetName;
    let postCode = req.body.form.postCode;
    let tel = req.body.form.tel;

    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            let hasOwn = false;
            doc.addressList.forEach(item => {
                if (item.addressId !== addressId) {
                    hasOwn = true;
                }
            });
            if (!hasOwn) {
                res.json({
                    status: '1',
                    msg: '该id已经存在',
                    result: ''
                });
            }
            else {
                doc.addressList.push({
                    addressId,
                    userName,
                    streetName,
                    postCode,
                    tel,
                    isDefault: false
                });
                doc.save(function (err1, doc1) {
                    if (err) {
                        res.json({
                            status: '1',
                            msg: err1.message,
                            result: ''
                        });
                    } else {
                        res.json({
                            status: '0',
                            msg: '',
                            result: ''
                        });
                    }
                });
            }
        }
    });

});

// 订单支付
router.post('/payMent', function (req, res, next) {
    let userId = req.cookies.userId;
    let orderTotal = req.body.orderTotal;
    let addressId = req.body.addressId;
    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            let address = null;
            let goodsList = [];
            // 获取用户当前的地址信息
            doc.addressList.forEach(item => {
                if (addressId === item.addressId) {
                    address = item;
                }
            });
            // 获取用户的购买物品
            doc.cartList.forEach(item => {
                if (item.checked === '1') {
                    goodsList.push(item);
                }
            });

            let r1 = Math.floor(Math.random() * 10);
            let r2 = Math.floor(Math.random() * 10);
            let sysDate = new Date().Format('yyyyMMddhhmmss');
            let orderDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
            let orderId = `622${r1}${sysDate}${r2}`;

            let order = {
                orderId: orderId,
                orderTotal: orderTotal,
                addressInfo: address,
                goodsList: goodsList,
                orderStatus: '1',
                createDate: orderDate

            };

            doc.orderList.push(order);

            doc.save(function (err1, doc1) {
                if (err1) {
                    res.json({
                        status: '1',
                        msg: err.message,
                        result: ''
                    });
                }
                else {
                    res.json({
                        status: '0',
                        msg: '',
                        result: {
                            orderId: order.orderId,
                            orderTotal: order.orderTotal
                        }
                    });
                }
            });
        }
    });
});

// 订单信息
router.get('/orderDetail', function (req, res, next) {
    let userId = req.cookies.userId;
    let orderId = req.param('orderId');
    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            if (doc.orderList.length > 0) {
                let orderTotal = 0;
                doc.orderList.forEach(item => {
                    if (item.orderId === orderId) {
                        orderTotal = item.orderTotal;
                    }
                });
                if (orderTotal > 0) {
                    res.json({
                        status: '0',
                        msg: '',
                        result: {
                            orderId,
                            orderTotal
                        }
                    });
                }
                else {
                    res.json({
                        status: '12002',
                        msg: '无此订单',
                        result: ''
                    });
                }
            }
            else {
                res.json({
                    status: '12001',
                    msg: '当前用户未创建订单',
                    result: ''
                });
            }
        }
    });
});

module.exports = router;
