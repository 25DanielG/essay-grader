const http = require('http');
const fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var app = express();
const port = 2020;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname + "/views"));

(async() => {
    await mongoose.connect('mongodb://localhost:2020/');
})

app.get('/', async(req, res) => {
    res.render('login');
});

app.get('/teacher', async(req, res) => {
    res.render('teacher');
});

app.get('/student', async(req, res) => {
    res.render('student');
});

app.listen(port, (err) => {
    if(err)
        console.log("Error: " + err);
    else
        console.log("Listening on port: " + port); 
})