var mongodb = require('./db.js');
var markdown= require('markdown').markdown;

function Post(name, title, post) {
    this.name  = name;
    this.title = title;
    this.post  = post;
}

module.exports = Post;

// 发表文章,保存文章信息
Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        date  : date,
        year  : date.getFullYear(),
        month : date.getFullYear() + '-' + (date.getMonth() + 1),
        day   : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' '
              + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    // 文章保存文档
    var post = {
        name :this.name,
        title:this.title,
        time :time,
        post : this.post
    }

    // 连接数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        // 连接表
        db.collection('posts',function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(post, {
                safe:true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}

// 根据作者查找文章
Post.get = function (name, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if (name) {
                query.name = name;
            }

            collection.find(query).sort({
                time:-1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
}

