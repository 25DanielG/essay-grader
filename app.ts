import express from 'express';
import url, { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { gradeEssay } from './util/grades.js';
import router from './router.js';
import { API_KEY, CLIENT_ID, CLIENT_SECRET } from './util/keys.js';
import { UserEssay } from './util/schema.js';

const googleAuthClient = new OAuth2Client(CLIENT_ID);
const app = express();
const port = 2020;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/submissions');

app.get('/', async(req, res) => {
    res.render('login', { API_KEY: API_KEY, CLIENT_ID: CLIENT_ID, CLIENT_SECRET: CLIENT_SECRET });
    // await UserEssay.deleteMany({});
});

app.post('/', async(req, res) => {
    let essay = (await UserEssay.find({ name: req.body.name }).limit(1)).at(0);
    if(essay) {
        if(!essay.inProgress) {
            res.redirect(url.format({
                pathname:`/student/view/${essay._id.toString()}`,
            }));
        } else {
            res.redirect(url.format({
                pathname:'/student',
                query: {
                    'name': essay.name,
                    'access_token': req.body.token
                }
            }));
        }
    } else {
        let newEssay = Object.assign(req.body, {
            name: req.body.name,
            content: " ",
            created: new Date(),
            inProgress: true
        });
        await new UserEssay(newEssay).save();
        res.redirect(url.format({
            pathname:'/student',
            query: {
               'name': req.body.name,
               'access_token': req.body.token
            }
        }));
    }
});

app.get('/teacher', async(req, res) => {
    let essays = await UserEssay.find();
    res.render('teacher', {
        submissions: essays,
        token: req.query.token,
        API_KEY: API_KEY,
        CLIENT_ID: CLIENT_ID,
        CLIENT_SECRET: CLIENT_SECRET,
    });
});

app.post('/teacher', async(req, res) => {
    res.redirect(url.format({
        pathname:`/teacher/view/${req.body.essay_id}`,
        query: {
            'token': req.body.token
        }
    }));
});

app.get('/student', async(req, res) => {
    let doc = (await UserEssay.find({ name: req.query.name }).limit(1)).at(0);
    if(doc)
        res.render('student', { API_KEY: API_KEY, CLIENT_ID: CLIENT_ID, CLIENT_SECRET: CLIENT_SECRET, essay: doc });
    else
        res.sendStatus(404);
});

app.get('/student/view/:id', async(req, res) => {
    let found_essay = await UserEssay.findById(req.params.id);
    if(found_essay)
        res.render('view', { essay: found_essay, user: "student" });
    else
        res.sendStatus(404);
});

app.get('/teacher/view/:id', async(req, res) => {
    if(req.query.token == undefined)
        res.redirect('/');
    let found_essay = await UserEssay.findById(req.params.id);
    if(found_essay)
        res.render('view', { essay: found_essay, user: "teacher", token: req.query.token });
    else
        res.sendStatus(404);
});

app.post('/student', async(req, res) => {
    let grade = gradeEssay(req.body.content);
    let essay = (await UserEssay.find({ name: req.body.name }).limit(1)).at(0);
    await UserEssay.updateOne({ name: req.body.name }, 
    { 
        $set: { 
            grade: (await grade).grade,
            incorrect: (await grade).incorrect,
            comments: (await grade).comments,
            inProgress: false,
            content: req.body.content
        }
    }).then((res) => {
        console.log("Saved the essay");
    }).catch((err) => {
        console.log("Error while saving essay:" + err);
    });
    res.redirect(url.format({
        pathname:`/student/view/${essay._id.toString()}`
    }));
});

app.use('/api', router);

app.listen(port, () => { console.log(`Listening on port: ${port}`); });