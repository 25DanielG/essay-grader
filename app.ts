import express from 'express';
import url from 'url';
import mongoose, { isValidObjectId, ObjectId } from 'mongoose';
import { gradeEssay } from './util/grades.js';
import { Feedback } from './util/type.js';
import { OAuth2Client } from 'google-auth-library';
import { API_KEY, CLIENT_ID, CLIENT_SECRET } from './util/keys.js'

const googleAuthClient = new OAuth2Client(CLIENT_ID);
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
    googleId: String,
    grade: Number,
    incorrect: Array<string>,
    comments: String
});
export var UserEssay = mongoose.model('UserEssay', usrSchema); 

// RENDER LOGIN
app.get('/', async(req, res) => {
    res.render('login');
    // await UserEssay.deleteMany({});
});

// RENDER STUDENT & IN PROGRESS
app.post('/', async(req, res) => {
    let essays = await UserEssay.find();
    let flag: boolean = false;
    essays.forEach((essay) => {
        if(essay.name === req.body.name && !flag) {
            if(!essay.inProgress) {
                res.redirect(url.format({
                    pathname:'/student/view',
                    query: {
                        'id': essay._id.toString(),
                        'document_id': essay.googleId
                    }
                }));
            } else {
                res.redirect(url.format({
                    pathname:'/student',
                    query: {
                        'name': essay.name,
                        'access_token': req.body.token,
                        'document_id': essay.googleId
                    }
                }));
            }
            flag = true;
        }
    });
    if(!flag) {
        let newEssay = Object.assign(req.body, {
            name: req.body.name,
            content: " ",
            created: new Date(),
            inProgress: true
        });
        let essay = new UserEssay(newEssay);
        await essay.save();
        res.redirect(url.format({
            pathname:'/student',
            query: {
               'name': essay.name,
               'access_token': req.body.token
            }
        }));
    }
});

// UPDATE THE GOOGLE DOCUMENT ID
app.post('/update-id', async(req, res) => {
    let essays = await UserEssay.find();
    essays.forEach(async (essay) => {
        if(essay.name === req.body.name) {
            essay.googleId = req.body.docId;
            await essay.save();
        }
    });
});

// RENDER TEACHER PAGE
app.get('/teacher', async(req, res) => {
    let sub = await UserEssay.find();
    res.render("teacher", { submissions: sub, token: req.query.token });
});

// TEACHER VIEW PREPROCESS
app.post('/teacher', async(req, res) => {
    if(isValidObjectId(req.body.essay_id)) {
        res.redirect(url.format({
            pathname:'/teacher/view',
            query: {
                'id': req.body.essay_id,
                'document_id': req.body.googleId,
                'token': req.body.token
            }
        }));
    } else
        res.sendStatus(502);
});

// RENDER STUDENT PAGE
app.get('/student', async(req, res) => {
    res.render('student');
});

// VIEWS
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
        if(req.query.token == undefined)
            res.redirect('/');
        let found_essay = await UserEssay.findById(req.query.id);
        if(found_essay)
            res.render('view', { essay: found_essay, user: "teacher", token: req.query.token });
        else
            res.sendStatus(404);
    } catch (err) {
        console.log("Error while finding the essay to display: " + err);
    }
});

// DELETE AN ESSAY
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

// TEACHER COMMENTS
app.post('/teacher/view', async (req, res) => {
    if (isValidObjectId(req.body.id)) {
      await UserEssay.updateOne({ _id: req.body.id }, { $set: { comments: req.body.comments } });
    } else {
      res.sendStatus(502);
    }
    res.redirect(`/teacher`);
});

// SUBMIT ESSAY
app.post('/student', async(req, res) => {
    let grade = gradeEssay(req.body.content);
    let essays = await UserEssay.find();
    essays.forEach(async (essay) => {
        if(essay.name === req.body.name) {
            console.log("Found the essay to submit");
            essay.grade = (await grade).grade;
            essay.incorrect = (await grade).incorrect;
            essay.comments = (await grade).comments;
            essay.inProgress = false;
            await essay.save().then((res: any) => {
                console.log("Saved the essay");
            }).catch((err: any) => {
                console.log("Error while saving essay:" + err);
            })
            res.redirect(url.format({
                pathname:'/student/view',
                query: {
                    'id': essay._id.toString(),
                    'document_id': essay.googleId
                }
            }));
        }
    });
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`); 
});