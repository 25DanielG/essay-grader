import fs from 'fs';
import { Feedback, FirstLast } from './type';
import { UserEssay } from './server.js';
import { compareTwoStrings } from 'string-similarity';
const no_nos: Array<string> = [
    ' very ', ' really ', ' get ', ' got ', ' getting ', ' I ', ' me ', ' mine ', ' my ', ' myself ',
    ' you ', ' your ', ' yours ', ' yourself ', ' yourselves ', ' lots ', ' cute ', ' fun ',
    ' great ', ' guy ', ' kid ', ' mom ', ' dad ', ' stuff ', ' good ', ' bad ', ' nice ',
    ' beautiful ', ' thing ', ' things '
];

export async function gradeEssay(essay: string) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    let replacedEssay = essay.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    let eachWord = replacedEssay.split(' ');
    let eachSentence = essay.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
    let out_words = getFirstAndLast(eachSentence);
    let erorrs: Feedback[] = [];

    erorrs.push(checkMispelling(eachWord));
    erorrs.push(checkNoNos(eachWord));
    erorrs.push(checkLength(eachWord));
    erorrs.push(endInPrep(out_words));
    erorrs.push(startWithSame(out_words));
    let plagiarizing = await checkPlag(essay);
    let plag_flag = (plagiarizing.grade > 0) ? true : false;
    erorrs.push(plagiarizing);
    erorrs.forEach((error) => {
        for(let i = 0; i < error.incorrect.length; ++i) {
            ret.incorrect.push(error.incorrect[i])
        }
        ret.grade += error.grade;
    })
    ret.grade = 100 - ret.grade;
    ret.grade = (ret.grade < -200) ? -200 : ret.grade;
    
    if(plag_flag)
        ret.grade = 0;
    return ret;
}
async function checkPlag(essay: string) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    let others = await UserEssay.find();
    for(let i = 0; i < others.length; ++i) {
        if(others[i].inProgress)
            continue;
        if(compareTwoStrings(others[i].content, essay) > 0.75) {
            ret.grade += 100;
            ret.incorrect.push(`Automatic 0 for plagiarizing ${others[i].name} `);
            break;
        }
    }
    return ret;
}
function startWithSame(out_words: FirstLast[]) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    for(let i = 0; i < out_words.length; ++i) {
        for(let j = i + 1; j < out_words.length && j < i + 3; ++j) {
            if(out_words[i].first.toLowerCase() === out_words[j].first.toLowerCase()) {
                ret.grade += 3;
                ret.incorrect.push(`3 points off for sentences ${i + 1} and ${j + 1} starting with the same word `);
            }
        }
    }
    return ret;
}
function endInPrep(outer_words: FirstLast[]) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    var content = fs.readFileSync('./dict/prepositions.txt');
    outer_words.forEach((set) => {
        var regex = new RegExp('\n' + set.last.toLowerCase() +'\n');
        if(content.toString('utf-8').match(regex)) {
            ret.grade += 5;
            ret.incorrect.push(`5 points off ending sentence with "${set.last}" `);
        }
    });
    return ret;
}
function getFirstAndLast(eachSentence: string[]) {
    var outer_words: Array<FirstLast> = [];
    for(let i = 0; i < eachSentence.length; ++i) {
        eachSentence[i] = eachSentence[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        let each: FirstLast = {first: "", last: ""}, worded_sentence: string[] = eachSentence[i].split(' ');
        each.first = worded_sentence[0]; each.last = worded_sentence[worded_sentence.length - 1];
        outer_words.push(each);
    }
    return outer_words;
}
function checkMispelling(eachWord: String[]) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    var content = fs.readFileSync('./dict/words.txt');
    for(let i = 0; i < eachWord.length; ++i) {
        var regex = new RegExp('\n' + eachWord[i].toLowerCase() +'\n');
        if(!content.toString('utf-8').match(regex)) {
            ++ret.grade;
            ret.incorrect.push(`1 point off for typo: "${eachWord[i]}" `);
        }
    }
    return ret;
}
function checkNoNos(eachWord: String[]) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    for(let i = 0; i < eachWord.length; ++i) {
        if(no_nos.indexOf(' ' + eachWord[i] + ' ') > -1) {
            ++ret.grade;
            ret.incorrect.push(`1 point off for using "${eachWord[i]}" `);
        }
    }
    return ret;
}
function checkLength(eachWord: String[]) {
    let ret: Feedback = {
        grade: 0,
        incorrect: [],
        comments: "N/A"
    }
    if(eachWord.length < 500 || eachWord.length > 1000) {
        ret.grade += 50;
        ret.incorrect.push(`50 points off for word count of ${eachWord.length} not inside 500-1000 `);
    }
    return ret;
}