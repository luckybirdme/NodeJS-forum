var models  = require('../models');
var Tag    = models.Tag;


exports.getByName = function (tagName,callback){
	Tag.findOne({tagName: tagName}, callback);
};

exports.insert = function(tag,callback){
	var newTag = new Tag(tag);
 	newTag.save(callback);
}

exports.save = function(tag,callback){
	tag.save(callback);
}

exports.update = function(_id,update,callback){
	Tag.update({_id:_id},{$set:update},callback);
}

exports.getAllTags = function(callback){
	Tag.find({},callback);
}

exports.getById = function(_id,callback){
	Tag.findById(_id, callback);
}

exports.getByPage = function(query,fields,skip,limit,sort,callback){
	Tag.find(query, fields, { skip: skip, limit: limit,sort:sort }, callback);
}

