var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import express from 'express';
import mongoose from 'mongoose';
import { gradeEssay } from './grades.js';
var app = express();
var port = 2020;
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
mongoose.connect('mongodb://localhost:27017/submissions');
var usrSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    created: { type: Number, required: true },
    grade: Number,
    incorrect: String,
    comments: String
});
var UserEssay = mongoose.model('UserEssay', usrSchema);
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('login');
        return [2];
    });
}); });
app.get('/teacher', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sub;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, UserEssay.find()];
            case 1:
                sub = _a.sent();
                res.render("teacher", { submissions: sub });
                return [2];
        }
    });
}); });
app.post('/teacher', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var essays, found_essay, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log("Trying to find essay by id: " + req.body.essayId);
                return [4, UserEssay.find()];
            case 1:
                essays = _a.sent();
                essays.forEach(function (essay) {
                    console.log(essay.name + ", id: " + essay._id);
                });
                return [4, UserEssay.findById(req.body.essayId)];
            case 2:
                found_essay = _a.sent();
                if (found_essay) {
                    console.log("Found the essay!");
                    res.render("view/".concat(req.body.essayId), { submissions: found_essay });
                }
                else
                    res.sendStatus(404);
                return [3, 4];
            case 3:
                err_1 = _a.sent();
                console.log("Error while finding the essay: " + err_1);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
app.get('/student', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('student');
        return [2];
    });
}); });
app.get('/view/:essayId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('view');
        return [2];
    });
}); });
app.post('/student', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var grade, newEssay, essay;
    return __generator(this, function (_a) {
        console.log("Inside server student post");
        grade = gradeEssay(req.body.content);
        newEssay = Object.assign(req.body, {
            name: req.body.name,
            content: req.body.content,
            created: new Date(),
            grade: grade
        });
        essay = new UserEssay(newEssay);
        essay.save().then(function (result) {
            res.send(result);
        })["catch"](function (err) {
            console.log("Error while saving essay:" + err);
        });
        res.redirect('/view/');
        return [2];
    });
}); });
app.listen(port, function () {
    console.log("Listening on port: ".concat(port));
});
//# sourceMappingURL=server.js.map