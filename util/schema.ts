import mongoose from 'mongoose';

var usrSchema = new mongoose.Schema({
    name: {type: String, required: true},
    content: {type: String, required: true},
    created: Number,
    inProgress: {type: Boolean, required: true},
    googleId: String,
    grade: Number,
    incorrect: Array<string>,
    comments: String
});

export var UserEssay = mongoose.model('UserEssay', usrSchema); 