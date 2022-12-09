import express from 'express';
import mongoose, { isValidObjectId, ObjectId } from 'mongoose';
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

app.post('/teacher', async(req, res) => {
    if(isValidObjectId(req.body.essay_id))
        res.redirect(`/view` + `?id=${req.body.essay_id}`);
    else
        res.sendStatus(502);
});

app.get('/student', async(req, res) => {
    res.render('student');
});

app.get('/view', async(req, res) => {
    try {
        let found_essay = await UserEssay.findById(req.query.id);
        if(found_essay)
            res.render('view', { essay: found_essay });
        else
            res.sendStatus(404);
    } catch (err) {
        console.log("Error while finding the essay to display: " + err);
    }
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
        res.redirect(`/view` + `?id=${req.body._id}`);
    }).catch((err: any) => {
        console.log("Error while saving essay:" + err);
    })
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`); 
});