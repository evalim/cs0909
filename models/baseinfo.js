var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');
	
// var db = mongoose.createConnection("mongodb://localadmin:password@localhost:27017/test");

var BaseinfoSchema = new Schema({
	username:  { type: String,  default: ''},
	md5pswd:   { type: String,  default: ''},
	md5salt:   { type: String,  default: ''},
	truename:  { type: String,  default: ''},
	phone:     { type: String,  default: ''},
	address:   { type: String,  default: ''},
	authtoken: { type: String,  default: ''},
	imageurl:  { type: String,  default: ''},
	message:   { type: String,  default: ''},
	weibolink: { type: String,  default: ''},
	lastmodify:{ type: Date,    default: Date.now},
	activation:{ type: Boolean, default: false}
},{
	collection: 'base_info'
});

BaseinfoSchema
	.virtual('password')
	.set(function(password) {
		this.md5salt = this.makeSalt();
		this.md5pswd = this.encryptPswd(password);
	})
	.get(function(){
		return this.md5pswd;
	});

function ASSERT(value) { return value && value.length; }

BaseinfoSchema.methods = {

	authenticate: function(inputPassword) {
		if(this.encryptPswd(inputPassword) === this.md5pswd){
			this.authtoken = Math.floor(Math.random() * new Date().valueOf()).toString(13);
			return true;
		} else {
			return false;
		}
	},

	makeSalt: function() {
		return Math.floor(Math.random() * new Date().valueOf()).toString(13);
	},

	encryptPswd: function(password) {
		if(!ASSERT(password))	return '';
		var encrypred;
		try {
			encrypred = crypto.createHmac('sha1', this.md5salt).update(password).digest('hex');
			return encrypred;
		} catch (err) {
			return '';
		}
	}
}

mongoose.model('Baseinfo', BaseinfoSchema);

module.exports = function(connection) {
	return (connection || mongoose).model('Baseinfo');
};