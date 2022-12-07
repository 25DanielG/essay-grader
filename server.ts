import express from 'express';
import mongoose from 'mongoose';

var app = express();
const port = 2020;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('views'));

mongoose.connect('mongodb://localhost:2021');

var usrSchema = new mongoose.Schema({
    name: {type: String, required: true},
    content: {type: String, required: true},
    created: {type: Number, required: true},
    grade: Number,
    incorrect: String,
    comments: String
});

var UserEssay = mongoose.model('UserEssay', usrSchema); 

app.get('/', async(req: any, res: any) => {
    res.render('login');
});

app.get('/teacher', async(req: any, res: any) => {
    /*UserEssay.find().then(function(essays) {
        res.render('teacher', {items: essays});
    });*/
    let submissions = UserEssay.find();
    res.render("teacher", submissions);
}); 

app.get('/student', async(req: any, res: any) => {
    res.render('student');
});

app.post('/student', async(req: any, res: any) => {
    let grade = gradeEssay(req.body.content);
    let newEssay = Object.assign(req.body, {
        creationTime: new Date(),
        grade: grade
    });
    let essay = new UserEssay(newEssay);
    essay.save().then((result: any) =>{
        res.send(result);
    }).catch((err: any) => {
        console.log("Error while saving essay:" + err);
    })
    res.redirect('/view');
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`); 
})