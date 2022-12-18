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
import fs from 'fs';
import { UserEssay } from './server.js';
import { compareTwoStrings } from 'string-similarity';
var no_nos = [
    ' very ', ' really ', ' get ', ' got ', ' getting ', ' I ', ' me ', ' mine ', ' my ', ' myself ',
    ' you ', ' your ', ' yours ', ' yourself ', ' yourselves ', ' lots ', ' cute ', ' fun ',
    ' great ', ' guy ', ' kid ', ' mom ', ' dad ', ' stuff ', ' good ', ' bad ', ' nice ',
    ' beautiful ', ' thing ', ' things '
];
export function gradeEssay(essay) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, replacedEssay, eachWord, eachSentence, i, out_words, erorrs, plagiarizing, plag_flag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ret = {
                        grade: 0,
                        incorrect: [],
                        comments: "N/A"
                    };
                    essay = essay.trim();
                    replacedEssay = essay.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
                    eachWord = replacedEssay.split(' ');
                    eachSentence = essay.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
                    for (i = 0; i < eachSentence.length; ++i)
                        eachSentence[i] = eachSentence[i].trim();
                    out_words = getFirstAndLast(eachSentence);
                    erorrs = [];
                    erorrs.push(checkMispelling(eachWord));
                    erorrs.push(checkNoNos(eachWord));
                    erorrs.push(checkLength(eachWord));
                    erorrs.push(endInPrep(out_words));
                    erorrs.push(startWithSame(out_words));
                    return [4, checkPlag(essay)];
                case 1:
                    plagiarizing = _a.sent();
                    plag_flag = (plagiarizing.grade > 0) ? true : false;
                    erorrs.push(plagiarizing);
                    erorrs.forEach(function (error) {
                        for (var i = 0; i < error.incorrect.length; ++i) {
                            ret.incorrect.push(error.incorrect[i]);
                        }
                        ret.grade += error.grade;
                    });
                    ret.grade = 100 - ret.grade;
                    ret.grade = (ret.grade < -200) ? -200 : ret.grade;
                    if (plag_flag)
                        ret.grade = 0;
                    return [2, ret];
            }
        });
    });
}
function checkPlag(essay) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, others, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ret = {
                        grade: 0,
                        incorrect: [],
                        comments: "N/A"
                    };
                    return [4, UserEssay.find()];
                case 1:
                    others = _a.sent();
                    for (i = 0; i < others.length; ++i) {
                        if (others[i].inProgress)
                            continue;
                        if (compareTwoStrings(others[i].content, essay) > 0.75) {
                            ret.grade += 100;
                            ret.incorrect.push("Automatic 0 for plagiarizing ".concat(others[i].name, " "));
                            break;
                        }
                    }
                    return [2, ret];
            }
        });
    });
}
function startWithSame(out_words) {
    var ret = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    };
    for (var i = 0; i < out_words.length; ++i) {
        for (var j = i + 1; j < out_words.length && j < i + 3; ++j) {
            if (out_words[i].first.toLowerCase() === out_words[j].first.toLowerCase()) {
                ret.grade += 3;
                ret.incorrect.push("3 points off for sentences ".concat(i + 1, " and ").concat(j + 1, " starting with the same word "));
            }
        }
    }
    return ret;
}
function endInPrep(outer_words) {
    var ret = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    };
    var content = fs.readFileSync('./dict/prepositions.txt');
    outer_words.forEach(function (set) {
        var regex = new RegExp('\n' + set.last.toLowerCase() + '\n');
        if (content.toString('utf-8').match(regex)) {
            ret.grade += 5;
            ret.incorrect.push("5 points off ending sentence with \"".concat(set.last, "\" "));
        }
    });
    return ret;
}
function getFirstAndLast(eachSentence) {
    var outer_words = [];
    for (var i = 0; i < eachSentence.length; ++i) {
        eachSentence[i] = eachSentence[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        var each = { first: "", last: "" }, worded_sentence = eachSentence[i].split(' ');
        each.first = worded_sentence[0];
        each.last = worded_sentence[worded_sentence.length - 1];
        outer_words.push(each);
    }
    return outer_words;
}
function checkMispelling(eachWord) {
    var ret = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    };
    var content = fs.readFileSync('./dict/words.txt');
    for (var i = 0; i < eachWord.length; ++i) {
        if (eachWord[i].trim() === '')
            continue;
        var regex = new RegExp('\n' + eachWord[i].toLowerCase().trim() + '\n');
        if (!content.toString('utf-8').match(regex)) {
            ++ret.grade;
            ret.incorrect.push("1 point off for typo: \"".concat(eachWord[i], "\" "));
        }
    }
    return ret;
}
function checkNoNos(eachWord) {
    var ret = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    };
    for (var i = 0; i < eachWord.length; ++i) {
        if (no_nos.indexOf(' ' + eachWord[i] + ' ') > -1) {
            ++ret.grade;
            ret.incorrect.push("1 point off for using \"".concat(eachWord[i], "\" "));
        }
    }
    return ret;
}
function checkLength(eachWord) {
    var ret = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    };
    if (eachWord.length < 500 || eachWord.length > 1000) {
        ret.grade += 50;
        ret.incorrect.push("50 points off for word count of ".concat(eachWord.length, " not inside 500-1000 "));
    }
    return ret;
}
//# sourceMappingURL=grades.js.map