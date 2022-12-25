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
import session from 'express-session';
import url from 'url';
import mongoose, { isValidObjectId } from 'mongoose';
import { gradeEssay } from './grades.js';
import { OAuth2Client } from 'google-auth-library';
import { CLIENT_ID } from './keys.js';
var googleAuthClient = new OAuth2Client(CLIENT_ID);
var app = express();
var port = 2020;
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true
}));
mongoose.connect('mongodb://localhost:27017/submissions');
var usrSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    created: Number,
    inProgress: { type: Boolean, required: true },
    googleId: String,
    grade: Number,
    incorrect: (Array),
    comments: String
});
export var UserEssay = mongoose.model('UserEssay', usrSchema);
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('login');
        return [2];
    });
}); });
app.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var essays, flag, newEssay, essay;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, UserEssay.find()];
            case 1:
                essays = _a.sent();
                flag = false;
                essays.forEach(function (essay) {
                    if (essay.name === req.body.name && !flag) {
                        if (!essay.inProgress) {
                            res.redirect(url.format({
                                pathname: '/student/view',
                                query: {
                                    'id': essay._id,
                                    'access_token': req.body.token,
                                    'document_id': essay.googleId
                                }
                            }));
                        }
                        else {
                            res.redirect(url.format({
                                pathname: '/student',
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
                if (!!flag) return [3, 3];
                newEssay = Object.assign(req.body, {
                    name: req.body.name,
                    content: " ",
                    created: new Date(),
                    inProgress: true
                });
                essay = new UserEssay(newEssay);
                return [4, essay.save()];
            case 2:
                _a.sent();
                res.redirect(url.format({
                    pathname: '/student',
                    query: {
                        'name': essay.name,
                        'access_token': req.body.token
                    }
                }));
                _a.label = 3;
            case 3: return [2];
        }
    });
}); });
app.post('/update-id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var essays;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, UserEssay.find()];
            case 1:
                essays = _a.sent();
                essays.forEach(function (essay) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(essay.name === req.body.name)) return [3, 2];
                                essay.googleId = req.body.docId;
                                return [4, essay.save()];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2];
                        }
                    });
                }); });
                return [2];
        }
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
    return __generator(this, function (_a) {
        if (isValidObjectId(req.body.essay_id))
            res.redirect("/teacher/view" + "?id=".concat(req.body.essay_id));
        else
            res.sendStatus(502);
        return [2];
    });
}); });
app.get('/student', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.render('student');
        return [2];
    });
}); });
app.get('/student/view', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var found_essay, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, UserEssay.findById(req.query.id)];
            case 1:
                found_essay = _a.sent();
                if (found_essay)
                    res.render('view', { essay: found_essay, user: "student" });
                else
                    res.sendStatus(404);
                return [3, 3];
            case 2:
                err_1 = _a.sent();
                console.log("Error while finding the essay to display: " + err_1);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
app.get('/teacher/view', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var found_essay, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, UserEssay.findById(req.query.id)];
            case 1:
                found_essay = _a.sent();
                if (found_essay)
                    res.render('view', { essay: found_essay, user: "teacher" });
                else
                    res.sendStatus(404);
                return [3, 3];
            case 2:
                err_2 = _a.sent();
                console.log("Error while finding the essay to display: " + err_2);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
app.post('/del', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var essays, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, UserEssay.find()];
            case 1:
                essays = _a.sent();
                if (!isValidObjectId(req.body.id)) return [3, 6];
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < essays.length)) return [3, 5];
                if (!(essays[i]._id == req.body.id)) return [3, 4];
                return [4, UserEssay.deleteOne({ _id: req.body.id })];
            case 3:
                _a.sent();
                return [3, 5];
            case 4:
                ++i;
                return [3, 2];
            case 5: return [3, 7];
            case 6:
                res.sendStatus(502);
                _a.label = 7;
            case 7:
                res.redirect("/");
                return [2];
        }
    });
}); });
app.post('/teacher/view', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isValidObjectId(req.body.id)) return [3, 2];
                return [4, UserEssay.updateOne({ _id: req.body.id }, { $set: { comments: req.body.comments } })];
            case 1:
                _a.sent();
                return [3, 3];
            case 2:
                res.sendStatus(502);
                _a.label = 3;
            case 3:
                res.redirect("/teacher");
                return [2];
        }
    });
}); });
app.post('/student', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newEssay, grade, _a, _b, _c, essay;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                console.log("Inside post submit");
                grade = gradeEssay(req.body.content);
                _b = (_a = Object).assign;
                _c = [req.body];
                _d = {
                    name: req.body.name,
                    content: req.body.content,
                    created: new Date(),
                    inProgress: false
                };
                return [4, grade];
            case 1:
                _d.grade = (_e.sent()).grade;
                return [4, grade];
            case 2:
                _d.incorrect = (_e.sent()).incorrect;
                return [4, grade];
            case 3:
                newEssay = _b.apply(_a, _c.concat([(_d.comments = (_e.sent()).comments,
                        _d)]));
                essay = new UserEssay(newEssay);
                return [4, essay.save().then(function (result) {
                        console.log("Saved the essay");
                    })["catch"](function (err) {
                        console.log("Error while saving essay:" + err);
                    })];
            case 4:
                _e.sent();
                if (!essay.inProgress)
                    res.redirect("/student/view" + "?id=".concat(essay._id));
                else
                    res.redirect("/student" + "?name=".concat(essay.name));
                return [2];
        }
    });
}); });
app.listen(port, function () {
    console.log("Listening on port: ".concat(port));
});
//# sourceMappingURL=server.js.map