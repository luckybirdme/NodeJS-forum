var auth  = require("../middlewares/auth");
var helps  = require("../common/helps");
var tools  = require("../common/tools");
var config  = require("../config");
var multer  = require('multer')


exports.image = image;

function image(req,res,next){	
	auth.getUserBySession(req,function(user){
		if (user) {
			var d = new Date();
			var fileFloder = config.upload.imageFloder+d.getFullYear()+"/"+(d.getMonth()+1)+"/";
			var fileName = user.userName+ '-' + d.valueOf()+'.png';
			var uploadPath = config.upload.uploadPath;
			if(uploadPath == ""||uploadPath==null||undefined){
				uploadPath = config.web.appRoot;
			} 
			if(uploadPath == ""||uploadPath==null||undefined){
				uploadPath = appRoot;;
			} 		
			var filePath = uploadPath+fileFloder;
			var fileUrl = fileFloder+fileName;

			tools.mkDirpath(filePath,function(error){
				if (error) {
				    return next(error);
				}
				var storage = multer.diskStorage({
					destination: function (req, file, cb) {
					cb(null, filePath)
					},
					filename: function (req, file, cb) {
					cb(null, fileName)
					}
				})

				var limits = {
					fileSize:10*1024*1024
				};
				var options = { 
						storage: storage,
						limits:limits
					};

				var upload = multer(options).single("imageInput");

				upload(req, res, function (error) {
				    if (error) {
				      // An error occurred when uploading
				      console.log("upload error:"+error);
				      helps.resJsonError(req,res,"upload",error.code);
				      return;
				    }
				    // Everything went fine
				    helps.resJsonSuccess(req,res,'upload','Successfully',fileUrl);
				});
			});

	      	
	    }else{ 
	    	 helps.resJsonError(req,res,"upload","User is not exists");
	   	}
	});



}


