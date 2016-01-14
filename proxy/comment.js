var models  = require('../models');
var Comment    = models.Comment;



exports.insert = function(comment,callback){
	var newComment = new Comment(comment);
 	newComment.save(callback);
}

exports.save = function(comment,callback){
	comment.save(callback);
}

exports.getById = function(_id,callback){
	Comment.findById(_id, callback);
}

exports.getTopicComments = function(topicId,sort,callback){
	Comment.find({topicId:topicId},'',{sort:sort}, callback);
}


