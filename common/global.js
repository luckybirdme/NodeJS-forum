exports.jsonRedirect = jsonRedirect;
exports.resJsonSuccess = resJsonSuccess;
exports.resJsonError = resJsonError;

function jsonRedirect(res,url){
	var data = {
		redirect : url
	};
	res.json(data);
}

function resJsonSuccess(res,name,notice,url){
	var data = {
		success : {
			name : name,
			notice : notice,
			url:url
		}
	};
	res.json(data);
}

function resJsonError(res,name,notice){
	var data = {
		error : {
			name : name,
			notice : notice
		}
	};
	res.json(data);
}


