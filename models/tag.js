var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
	tagName: { type: String},
	showName:{type:String},
	useCount:{type:Number,default:0},
	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now }

});

TagSchema.index({tagName: 1}, {unique: true});

mongoose.model('Tag', TagSchema);