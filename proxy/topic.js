var models  = require('../models');
var Topic    = models.Topic;


exports.insert = function(topic,callback){
	var newTopic = new Topic(topic);
 	newTopic.save(callback);
}

exports.save = function(topic,callback){
	Topic.save(callback);
}

exports.update = function(_id,update,callback){
	Topic.update({_id:_id},{$set:update},callback);
}

exports.getByPage = function(query,fields,skip,limit,sort,callback){
	Topic.find(query, fields, { skip: skip, limit: limit,sort }, callback);
}

exports.getById = function(_id,callback){
	Topic.findById(_id, callback);
}

exports.getUserTopics = function(userName,callback){
	Topic.find({userName:userName}, callback);
}
