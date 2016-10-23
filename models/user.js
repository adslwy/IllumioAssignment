/**
 * Created by wuyue on 16/10/20.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    firstname: {
        //optional choice for register.
        //user full name may be used to implemented some other featured in the future.
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin:   {
        //admin has the authorization to view/delete/update any info for any user,
        //for later implementation
        type: Boolean,
        default: false
    }
});
User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);