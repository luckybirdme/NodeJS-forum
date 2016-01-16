var config = require("../config")
var validator = require('validator');
var eventproxy = require('eventproxy');
var global = require("../common/global");
var marked = require('marked');
var proxy = require('../proxy');
var Tag = proxy.Tag;
var Topic = proxy.Topic;
var Comment = proxy.Comment;
var auth = require("../middlewares/auth");
var mongoose = require('mongoose');

exports.create = create;
exports.home = home;
exports.show = show;
exports.add = add;
exports.comment = comment;
exports.getTags = getTags;
exports.getComments = getComments;

function getComments(req,res,next){

	var topicId = req.query.topicId;
	var sort = '-update_at';

	Comment.getTopicComments(topicId,sort,function(error,comments){
		if(error){
			return next(error);
		}
		var showComments = [];
		if(comments){
			comments.forEach(function(comment){
				showComments.push({
					userName:comment.userName,
					content:comment.content,
					update_at_ago:comment.update_at_ago()
				});
			});
		}
		var data = {
			showComments : showComments
		};
		res.json(data);
	})
}

function comment(req,res,next){
	var content = validator.trim(req.body.content);
	var topicId = req.body.topicId;

	var ep = new eventproxy();
	ep.fail(next);
	ep.once('comment_error', function (name,notice) {
		global.resJsonError(res,name,notice);
	});	

	if(validator.isNull(content)){
		ep.emit("comment_error","content","Content can't be empty");
		return;
	}

	var comment = {
		content:content,
		topicId:topicId
	}

	var checkEvent = new eventproxy();
	checkEvent.all('checkComment', function (comment) {
		Topic.getById(comment.topicId,function(error,topic){
			if(error){
				return next(error);
			}
			if(topic){
				var update = {
					update_at:new Date(),
					commentCount:topic.commentCount+1
				}
				Topic.update(topic._id,update,function(error,raw){
					if(error){
						return next(error);
					}
					var url = config.url.host+"/topic/show?_id="+topic._id;
					global.jsonRedirect(res,url);	
				})
			}else{
				ep.emit("comment_error","submit","Error occurred when get topic");
			}
			
		})
	});

	auth.getUserBySession(req,function(user){
		if(user){
			comment.userName = user.userName;
			Comment.insert(comment,function(error,comment){
				if(error){
					return next(error);
				}
				if(comment){
					checkEvent.emit('checkComment',comment);
				}else{
					ep.emit("comment_error","submit","Error occurred when save comment");
				}

			});

		}else{
			ep.emit("comment_error","submit","Session is timeout, please login");		
		}
	});
}

function getTags(req,res,next){
	Tag.getAllTags(function(error,tags){
		if(error){
			return next(error);
		}
		var showTags = [];
		if(tags){
			tags.forEach(function(tag){
				showTags.push({
					_id:tag._id,
					showName:tag.showName
				});
			});
		}
		var data = {
			showTags : showTags
		};
		res.json(data);

	});
}


function add(req,res,next){
	var _id = req.query._id;

	var checkEvent = new eventproxy();
	checkEvent.all('checkTopic','checkTag', function (topicTags,hasTags) {
		var resData = {
			title : "Add",
			hasTags : hasTags
		};
		if(topicTags){
			resData.topic = topicTags.topic;
			resData.tagsName = topicTags.tagsName;
		}
		res.render('topic/create', resData);
	});




	Topic.getById(_id,function(error,topic){
		if(error){
			return next(error);
		}
		if(topic){
			var tagsId = topic.tagsId;
			var ep = new eventproxy();
			ep.after('getTags',tagsId.length,function (tagsName) {
				var topicTags = {
					topic : topic,
					tagsName : tagsName
				}
				checkEvent.emit('checkTopic',topicTags);
			});	

			
			tagsId.forEach(function(tagId){
				Tag.getById(tagId,function(error,tag){
					if(error){
						return next(error);
					}
					if(tag){
						ep.emit("getTags",tag.showName);
					}else{
						ep.emit("getTags");
					}
					
				})
			});
		}else{
			checkEvent.emit('checkTopic');
		}
		
	})

	Tag.getAllTags(function(error,tags){
		if(error){
			return next(error);
		}
		var hasTags=[];
		if(tags){
			tags.forEach(function(tag){
				hasTags.push(tag.showName);
			});
		}
		checkEvent.emit('checkTag',hasTags);
	});
}

function show(req,res,next){
	var _id = req.query._id;
	Topic.getById(_id,function(error,topic){
		if (error) {
		    return next(error);
		}
		topic.openCount = topic.openCount + 1;
		var update = {openCount:topic.openCount};

		Topic.update(topic._id,update,function(error,raw){
			if (error) {
			    return next(error);
			}

			var tagsId = topic.tagsId;
			var ep = new eventproxy();
			ep.after('getTags',tagsId.length,function (tags) {

				var resData = {
						title : topic.title,
						topic : topic,
						tags : tags
					};

					res.render('topic/show', resData);	

			});	
			
			tagsId.forEach(function(tagId){
				Tag.getById(tagId,function(error,tag){
					if(error){
						return next(error);
					}
					if(tag){
						ep.emit("getTags",tag);
					}else{
						ep.emit("getTags");
					}
					
				})
			});	





		})
		
	})
}

function home(req,res,next){
	var query = {};
	var fields={};
	var limit = config.topic.page.limit;
	var skip = 0;
	var sort = '-update_at';

	pageUrl = "/topic/home?page=true";
	var tagId = req.query.tagId;
	if(!validator.isNull(tagId)){
		query.tagsId = mongoose.Types.ObjectId(tagId);
		pageUrl+=+pageUrl+"&tagId="+tagId;
	}

	
	var pageNum = req.query.pageNum;
	if(!validator.isNull(pageNum) && pageNum > 1){
		var prevNum = parseInt(pageNum)-1;
		skip = limit*prevNum;
	}else{
		pageNum = 1;
	}




	Topic.getByPage(query,fields,skip,limit,sort,function(error,topics){
		if (error) {
		    return next(error);
		}
		var pageInfo={
			pageNum : pageNum
		};
		if(pageNum > 1){
			pageInfo.prevUrl = pageUrl+"&pageNum="+(parseInt(pageNum)-1);
		}

		if(topics && topics.length == limit){
			pageInfo.nextUrl = pageUrl+"&pageNum="+(parseInt(pageNum)+1);
		}

		Tag.getByPage({},{},0,10,'-useCount',function(error,tags){
			if (error) {
			    return next(error);
			}
			var resData = {
				title : 'Home',
				topics : topics,
				pageInfo : pageInfo,
				tags:tags,
				tagId:tagId
			};
			res.render('topic/home', resData);			
		})


	});


}



function create(req,res,next){
	var _id = req.body._id;
	var title = validator.trim(req.body.title);
	var tags = validator.trim(req.body.tags);
	var Markdown = req.body.markdown;

	var ep = new eventproxy();
	ep.fail(next);
	ep.once('create_error', function (name,notice) {
		global.resJsonError(res,name,notice);
	});	
	
	if(validator.isNull(title)){
		ep.emit("create_error","title","Title can't be empty");
		return;
	}

	if(validator.isNull(tags)){
		ep.emit("create_error","tags","Tags can't be empty");
		return;
	}

	if(validator.isNull(Markdown)){
		ep.emit("create_error","content","Content can't be empty");
		return;
	}

	var content = marked(Markdown);

	var showNameArray = tags.split(",");
	var tagNameArray = [];
	var tagArray = [];
	showNameArray.forEach(function (showName) {
		tagName = showName.toUpperCase();
		if(!validator.isNull(tagName) && tagNameArray.indexOf(tagName) == '-1' ){
			tagNameArray.push(tagName);
			tagArray.push({
				tagName:tagName,
				showName:showName
			});
		}
	});

	var checkEvent = new eventproxy();
	checkEvent.after('checkTag',tagArray.length, function (tagsId) {
		var newTopic = {
			title : title,
			tagsId : tagsId,
			Markdown : Markdown,
			content : content,
			update_at : new Date()
		};

		auth.getUserBySession(req,function(user){
			if(user){
				newTopic.userName = user.userName;
				saveTopic(_id,newTopic,req,function(error,topic){
					if (error) {
				      	return next(error);
				    }
				    if(topic){
				    	var url = config.url.host+"/topic/home";
						global.jsonRedirect(res,url);		
				    }else{
				    	ep.emit("create_error","submit","Error occurred when save topic");
				    }							
				});
			}else{
				ep.emit("create_error","submit","Session is timeout, please login");
			}
		})


	});

	tagArray.forEach(function (tag) {

		saveTag(tag,function(error,tag){
				if (error) {
			      	return next(error);
			    }
			    if(tag){
			    	checkEvent.emit('checkTag', tag._id);
			    }else{
			    	ep.emit("create_error","tags","Error occurred when save tag"); 
			    }
		});

	});



}


function saveTag(newTag,callback){
	Tag.getByName(newTag.tagName,function(error,tag){
		if (error) {
	      	return next(error);
	    }
	    if(tag){
	    	tag.useCount = tag.useCount+1;
	    	Tag.save(tag,callback);
	    }else{
	    	Tag.insert(newTag,callback);
	    }
	    
	});	
}

function saveTopic(_id,newTopic,req,callback){

	Topic.getById(_id,function(error,topic){
		if (error) {
	      	return next(error);
	    }

		if(topic){
			if(topic.userName == newTopic.userName){
				Topic.update(_id,newTopic,callback)
			}else{
				var url = config.url.host;
				global.jsonRedirect(res,url);						
			}
			
		}else{
			Topic.insert(newTopic,callback);
		}
	});
	
}
