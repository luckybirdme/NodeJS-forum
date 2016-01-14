var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Base = require("./base");
var CommentSchema = new Schema({
	content: { type: String},
	userName:{type:String},
	topicId:{type:ObjectId},
	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now }

});
CommentSchema.plugin(Base);
mongoose.model('Comment', CommentSchema);