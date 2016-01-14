var config = {
	web:{
		name:"LuckyBird"
	},
	url:{
		//host:"http://10.118.27.163:3000"
		host:"http://172.20.10.2:3000"
	},
	upload:{
		uploadPath:"",
		imageFloder:"/upload/images/",
		defaultAvatar:"/images/default-avatar.png"
	},
	auth:{
		activeKey : "activeKey",
		checkActive: false
	},
	database :{
		address : "mongodb://localhost/myExpressApp"
	},
	session :{
		cookie : {
			secret: 'sessionSecret',
    		name: 'sessionName',
    		maxAge: 1000 * 60 * 60 * 24 * 30
		},
		database:{
        	address: 'mongodb://localhost/myExpressAppSession'
		}


	},
	email:{
	    host: 'smtp.qq.com',
		port: 25,
		user: '123456789@qq.com',
		pass: '123456789',
		from: 'LuckyBird<123456789@qq.com>'
	},
	topic:{
		page:{
			limit:10
		}
	}
};

module.exports = config;