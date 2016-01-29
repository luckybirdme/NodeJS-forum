exports.jsonRedirect = jsonRedirect;
exports.resJsonSuccess = resJsonSuccess;
exports.resJsonError = resJsonError;

function jsonRedirect(res,url){
	var data = {
		redirect : url
	};
	res.json(data);
}

function resJsonSuccess(req,res,name,notice,url){
	var data = {
		success : {
			name : name,
			notice : notice,
			url:url
		}
	};
	resJsonOut(req,res,data);
}

function resJsonError(req,res,name,notice){
	var data = {
		error : {
			name : name,
			notice : notice
		}
	};
	resJsonOut(req,res,data);
}

function resJsonOut(req,res,data){
	res.json(data);
}


