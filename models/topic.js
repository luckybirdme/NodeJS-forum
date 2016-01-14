var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Base = require("./base");
var TopicSchema = new Schema({
	title: { type: String},
	content:{type:String},
	tagsId:{type:Array},
	userName:{type:String},
	Markdown:{type:String},
	openCount:{type:Number,default:0},
	commentCount:{type:Number,default:0},
	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now }

});

TopicSchema.plugin(Base);

mongoose.model('Topic', TopicSchema);