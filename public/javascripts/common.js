$(function(){  
	init();
})

function init(){

	var registerObj = $("#registerForm");
	if(registerObj.length > 0 ){
		registerObj.submit(function(e) {
			ajaxPost(e,registerObj,"/users/register");
		});
	}

	var loginObj = $("#loginForm");
	if(loginObj.length > 0 ){
		loginObj.submit(function(e) {
			ajaxPost(e,loginObj,"/users/login");
		});
	}


	var activeObj = $("#activeForm");
	if(activeObj.length > 0 ){
		activeObj.submit(function(e) {
			ajaxPost(e,activeObj,"/users/active");
		});
	}

	var settingObj = $("#settingForm");
	if(settingObj.length > 0 ){
		settingObj.submit(function(e) {
			ajaxPost(e,settingObj,"/users/setting");
		});
	}

	var createObj = $("#createForm");
	if(createObj.length > 0 ){
		createObj.submit(function(e) {
			ajaxPost(e,createObj,"/topic/create");
		});
	}

	var commentObj = $("#commentForm");
	if(commentObj.length > 0 ){
		commentObj.submit(function(e) {
			ajaxPost(e,commentObj,"/topic/comment");
		});
	}

	var uploadUserAvatar = $("#uploadUserAvatar");
	if(uploadUserAvatar.length > 0 ){

		uploadUserAvatar.click(function(){
			$("#imageInput").click();
		});

		changeUploadImage()
	}


    // init editor    
    var editorObj = $("#editor");

    if(editorObj.length > 0){
        
        var editor = new Editor({
            element: editorObj.get(0),
            status:false
        });
        editor.render();

		$("#imageLocalButton").click(function(){
		 	return  $("#imageInput").click();
		});

        changeUploadImage();

    }  


    var tagObj = $("#tags-container") 

    if( tagObj.length > 0 ){
        var hasTags = $("#hasTags").text();
        var option = {
            singleField: true,
            singleFieldNode: $('#tags')
        };
        if(hasTags.length > 0){
        	var availableTags = hasTags.split(",");
        	option.availableTags = availableTags;
        }
        
        tagObj.tagit(option);
    }

    var showTags = $("#showTags");
    if(showTags.length > 0 ){
    	var url = "/topic/getTags";
    	getSidebarTags(showTags,url);
    }

    var showComments = $("#showComment");
    var topicId = $("#topicId").val();
    if(showComments.length > 0 ){
    	var url = "/topic/getComments?topicId="+topicId;
    	getTopicComments(showComments,url);
    }

	var csrfToken = $("meta[name='csrfToken']").attr('content');

	var CSRF_HEADER = 'csrf-token';

	var setCSRFToken = function (csrfToken) {
	  $(document).ajaxSend(function (event,xhr,options) {
	  	console.log("ajaxSend");
	  	
	  	var type = options.type.toUpperCase();
	  	console.log("type:"+type);
	    if (type == 'POST') {
	    	console.log("xhr:"+xhr);
	      	xhr.setRequestHeader(CSRF_HEADER, csrfToken);
	    }
	  });
	};

	setCSRFToken(csrfToken);

}

function getTopicComments(obj,url){
	$.ajax({
		type: "get",
		url: url,
		timeout : 10000,
		dataType: "json",
		success: function(data){				
			var showComments = data.showComments;
			var str="";
			showComments.forEach(function(comment){
				str+="<div class='comment-list-item'>"
				str+="<div class='meta'>";
				str+="<a href='/users/home?userName="+comment.userName+"'><i class='glyphicon glyphicon-user'></i><span>"+comment.userName+"</span></a>";
				str+="<i class='glyphicon glyphicon-time'></i><span>"+comment.update_at_ago+"</span>";
				str+="</div>";
				str+="<p class='comment-content'>"+comment.content+"</p>";
				str+="</div>";

			});
			obj.html(str);
		},
       	error:function(error) {

        },
		complete : function(XMLHttpRequest,status){
		}
    });
}

function getSidebarTags(obj,url){
	$.ajax({
		type: "get",
		url: url,
		timeout : 10000,
		dataType: "json",
		success: function(data){				
			var showTags = data.showTags;
			var str="";
			var tagStyle = ["btn-info","btn-success","btn-warning","btn-disabled"];
			var num = 0;
			showTags.forEach(function(tag){
				num = parseInt(3*Math.random());
				str+="<a href='/topic/home?tagId="+tag._id+"'>"
				str+="<span class='btn btn-sm btn-tags "+tagStyle[num]+"'>"+tag.showName+"</span>";
				str+="</a>"
			});
			obj.html(str);
		},
       	error:function(error) {

        },
		complete : function(XMLHttpRequest,status){
		}
    });
}

function ajaxPost(e,obj,url){

		hideAlertNotice();

		showBtnLoading();

		var data = obj.serialize();
		$.ajax({
			type: "POST",
			url: url,
			timeout : 10000,
			dataType: "json",
			data: data, // serializes the form's elements.

			success: function(data){
				if(data.error){
					showAlertNotice(data.error);
				}else if(data.success){
					showSuccessNotice(data.success);
				}else if(data.redirect){
					location.href = data.redirect;
				};				

			},
           	error:function(error) {

            },
			complete : function(XMLHttpRequest,status){
				hideBtnLoading();
			}
        });
		e.preventDefault(); // avoid to execute the actual submit of the form.
		
}

function showBtnLoading(){
	var btn = $(":submit");
	btn.attr("data-loading-text","Going...");
	btn.button("loading");
}

function hideBtnLoading(){
	var btn = $(":submit");
	btn.button("reset");
}


function hideAlertNotice(){
	$(".alert-required").each(function(){
	    var value = $(this).hide(); 
	});
}

function showAlertNotice(data){
	$("#"+data.name+"Alert").html(data.notice).show();
}

function showSuccessNotice(data){
	$("#"+data.name+"Success").html(data.notice).show();
}


function changeUploadImage(){
	$("#imageInput").off("change");
	$("#imageInput").on("change", function () {
		ajaxUploadImage();
	});	
}


function ajaxUploadImage(){
	hideAlertNotice();
	showBtnLoading();
	var url = "/upload/image";
	var data = {
	};
	$.ajaxFileUpload({
		url:url,
		timeout:60000,
		secureuri:false,                       
		fileElementId:["imageInput"],            
		dataType:"json",
		type : "post",                       
		data:data,
		success:function(data, status ){ 
				if(data.error){
					showAlertNotice(data.error);
				}else if(data.success){
					if($("#avatar").length > 0 ){
						$("#avatar").attr("src",data.success.url);
						$("#userAvatar").val(data.success.url);
					};
					if($("#imageUrl").length > 0)
					{
						$("#imageUrl").val(data.success.url);
					}

				}			
		},
		error:function(data, status, e ,w){

		},
		
		complete:function(data, status){
			hideBtnLoading();
			changeUploadImage();
		}
		
		
	  
	});
}
