import express from 'express';
import mongoose from 'mongoose';
import { gradeEssay } from './grades.js';

var app = express();
const port = 2020;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

mongoose.connect('mongodb://localhost:27017/submissions');

var usrSchema = new mongoose.Schema({
    name: {type: String, required: true},
    content: {type: String, required: true},
    created: {type: Number, required: true},
    grade: Number,
    incorrect: String,
    comments: String
});
var UserEssay = mongoose.model('UserEssay', usrSchema); 

app.get('/', async(req, res) => {
    res.render('login');
    // await UserEssay.deleteMany({});
});

app.get('/teacher', async(req, res) => {
    let sub = await UserEssay.find();
    res.render("teacher", { submissions: sub });
}); 

app.get('/student', async(req, res) => {
    res.render('student');
});

app.post('/student', async(req, res) => {
    console.log("Inside server student post");
    let grade = gradeEssay(req.body.content);
    let newEssay = Object.assign(req.body, {
        name: req.body.name,
        content: req.body.content,
        created: new Date(),
        grade: grade
    });
    let essay = new UserEssay(newEssay);
    essay.save().then((result: any) =>{
        res.send(result);
    }).catch((err: any) => {
        console.log("Error while saving essay:" + err);
    })
    res.redirect('/view/');
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`); 
})