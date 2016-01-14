var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Base = require("./base");
var UserSchema = new Schema({
	userName: { type: String},
	userEmail: { type: String},
	passWord: { type: String },
	userAvatar:{type:String},
	activeState : {type: Boolean, default: false},
	create_at: { type: Date, default: Date.now },
  	update_at: { type: Date, default: Date.now }

});

UserSchema.index({userName: 1}, {unique: true});
UserSchema.index({userEmail: 1}, {unique: true});
UserSchema.plugin(Base);

mongoose.model('Users', UserSchema);

