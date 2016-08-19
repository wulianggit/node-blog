var mongodb = require('./db.js');

function User(user) {
    this.name     = user.name;
    this.password = user.password;
    this.email    = user.email;
}

module.exports = User;

// 保存用户注册信息
User.prototype.save = function (callback) {
    // 用户信息保存文档
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    };

    // 连接数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        // 选择表
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(user, {
                safe:true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user[0]);
            })
        });
    });
}

// 读取用户信息
User.get = function (name, callback) {
    // 连接数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        // 选择表
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            // 通过用户名查找
            collection.findOne({
                name:name
            },function (err, user) {
                mongodb.close();
                if (err) {
                   return callback(err);
                }
                callback(null, user);
            });
        });
    });
}
