/**
 * Created by wuyue on 16/10/20.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Secret = new Schema({
    // to ask user input username here is ridiculous,
    // this document is only for test purpose that we can easily know which user does
    //CRUD operation. Should be deleted in real deployment.
    // username:  {
    //     type: String,
    //     required: true
    // },
    secrets:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
var Secrets = mongoose.model('Secret', Secret);
module.exports = Secrets;