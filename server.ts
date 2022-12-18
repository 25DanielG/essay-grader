import express from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { gradeEssay } from './grades.js';
import { Feedback } from './type.js';

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
    created: Number,
    inProgress: {type: Boolean, required: true},
    grade: Number,
    incorrect: Array<string>,
    comments: String
});
export var UserEssay = mongoose.model('UserEssay', usrSchema); 

app.get('/', async(req, res) => {
    res.render('login');
    // await UserEssay.deleteMany({});
});

app.post('/', async(req, res) => {
    let essays = await UserEssay.find();
    let flag: boolean = false;
    essays.forEach((essay) => {
        if(essay.name === req.body.name && !flag && !essay.inProgress) {
            res.redirect(`/student/view` + `?id=${essay._id}`);
            flag = true;
        }
    });
    if(!flag)
        res.redirect(`/student` + `?name=${req.body.name}`);
});

app.get('/teacher', async(req, res) => {
    let sub = await UserEssay.find();
    res.render("teacher", { submissions: sub });
});

app.post('/teacher', async(req, res) => {
    if(isValidObjectId(req.body.essay_id))
        res.redirect(`/teacher/view` + `?id=${req.body.essay_id}`);
    else
        res.sendStatus(502);
});

app.get('/student', async(req, res) => {
    let essays = await UserEssay.find();
    let content;
    essays.forEach((essay) => {
        if(essay.name === req.query.name) {
            content = essay.content;
        }
    });
    res.render('student', { essay: content });
});

app.get('/student/view', async(req, res) => {
    try {
        let found_essay = await UserEssay.findById(req.query.id);
        if(found_essay)
            res.render('view', { essay: found_essay, user: "student" });
        else
            res.sendStatus(404);
    } catch (err) {
        console.log("Error while finding the essay to display: " + err);
    }
});

app.get('/teacher/view', async(req, res) => {
    try {
        let found_essay = await UserEssay.findById(req.query.id);
        if(found_essay)
            res.render('view', { essay: found_essay, user: "teacher" });
        else
            res.sendStatus(404);
    } catch (err) {
        console.log("Error while finding the essay to display: " + err);
    }
});

app.post('/del', async(req, res) => {
    let essays = await UserEssay.find();
    if(isValidObjectId(req.body.id)) {
        for(let i = 0; i < essays.length; ++i) {
            if(essays[i]._id == req.body.id) {
                await UserEssay.deleteOne({_id: req.body.id});
                break;
            }
        }
    } else
        res.sendStatus(502);
    res.redirect(`/`);
});

app.post('/teacher/view', async (req, res) => {
    console.log("Inside comment post request");
    if (isValidObjectId(req.body.id)) {
      await UserEssay.updateOne({ _id: req.body.id }, { $set: { comments: req.body.comments } });
    } else {
      res.sendStatus(502);
    }
    res.redirect(`/teacher`);
});

app.post('/student', async(req, res) => {
    let newEssay;
    if(req.body.prog == 'n') {
        let grade = gradeEssay(req.body.content);
        newEssay = Object.assign(req.body, {
            name: req.body.name,
            content: req.body.content,
            created: new Date(),
            inProgress: false,
            grade: (await grade).grade,
            incorrect: (await grade).incorrect,
            comments: (await grade).comments
        });
    } else {
        newEssay = Object.assign(req.body, {
            name: req.body.name,
            content: req.body.content,
            created: new Date(),
            inProgress: true
        });
    }
    let essay = new UserEssay(newEssay);
    await essay.save().then((result: any) => {
        console.log("Saved the essay");
    }).catch((err: any) => {
        console.log("Error while saving essay:" + err);
    })
    if(!essay.inProgress)
        res.redirect(`/student/view` + `?id=${essay._id}`);
    else
        res.redirect(`/student` + `?name=${essay.name}`);
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`); 
});