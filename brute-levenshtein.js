const fs = require('fs');
const nGram = require('n-gram');
//const levenshtein = require('./levenshtein');
const splitSentence = require('./sentence');
const levenshtein = require('fast-levenshtein');
function uniq(array) {
    let seen = {};
    return array.filter((item) => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function wrap(word, n) {
    "use strict";
    if (n > 1 && n <= 2) {
        return '_' + word + '_';
    } else if (n <= 3) {
        return '__' + word + '__';
    } else if (n > 3) {
        return '___' + word + '___';
    } else if (n > 4) {
        return '____' + word + '____';
    } else if (n > 5) {
        return '_____' + word + '_____';
    }
    return word;
}

function autoNGram(word) {
    "use strict";
    let ngCount = 3;

    let vectors = nGram(ngCount)(wrap(word, ngCount));

    if (word.length <= 6) {
        vectors = vectors.concat(nGram(ngCount-1)(wrap(word, ngCount-1)))
    }
    if (word.length > 7) {
        vectors = vectors.concat(nGram(ngCount+1)(wrap(word, ngCount+1)))
    }
    if (word.length > 8) {
        //vectors = vectors.concat(nGram(ngCount+2)(wrap(word, ngCount+2)))
    }
    if (word.length > 9) {
        //vectors = vectors.concat(nGram(ngCount+3)(wrap(word, ngCount+3)))
    }
    if (word.length > 11) {
        //vectors = vectors.concat(nGram(ngCount+4)(wrap(word, ngCount+4)))
    }

    vectors.forEach((vector) => {
        if (vector.length < 4 || vector.indexOf('_') >= 0) {
            return;
        }

        for (let i = 1; i < vector.length-2; i++) {
            vectors.push(vector.substr(0, i) + '_' + vector.substr(i + 1));
        }

        for (let i = 1; i < vector.length-2; i++) {
            vectors.push(vector.substr(0, i) + vector.substr(i + 1));
        }

        for (let i = 0; i < vector.length-1; i++) {
            if ('AEUIO'.split('').indexOf(vector.charAt(i)) >=0) {
                vectors.push(vector.substr(0, i) + vector.substr(i + 1));
            }
        }
    });

    vectors = uniq(vectors);

    //vector.push(word.length);
    //vector.push(word.length-1);
    //vector.push(word.length-2);

    return vectors;
}

let ngCount = 2;
console.time(' - Getting vocabulary');
fs.readFile('./data/vocabulary.txt', {encoding: 'utf8'}, (err, vocabulary) => {
    "use strict";

    if (err) {
        console.log('error', err);
        return err;
    }

    console.timeEnd(' - Getting vocabulary');

    console.time(' - Splitting vocabulary');
    let vocabularyWords = vocabulary.split(/[\r\n]+/g);
    console.timeEnd(' - Splitting vocabulary');

    let total = 0;

    console.time(' - Getting input');
    fs.readFile('./data/187', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }

        console.timeEnd(' - Getting input');


        let words = splitSentence(data).map(word => word.trim().toUpperCase());
        let wordIndex = {};
        vocabularyWords.forEach((vocabularyWord, i) => {
            wordIndex[vocabularyWord] = i+1;
        });

        console.time(' - Calculating levenshtein distances index');
        words.forEach((word) => {

            //let distanceIndex = [];
            let minDistance = 100;
            let vocabWordWithMinDistance = null;
            // vocabularyWords.forEach((vocabularyWord, i) => {
            //
            //     distanceIndex[i] = levenshtein(word, vocabularyWord);
            // });

            if (wordIndex[word]) {
                return;
            }

            for (let i = 0; i < vocabularyWords.length-1; i++ ) {
                let vocabularyWord = vocabularyWords[i];

                if (minDistance === 1) {
                    break;
                }

                if (word.length == 1 && vocabularyWord.length > 3) {
                    continue;
                }

                if (word.length == 2 && vocabularyWord.length > 4) {
                    continue;
                }

                if (word.length == 4 && vocabularyWord.length > 7) {
                    continue;
                }

                if (word.length == 5 && vocabularyWord.length > 8) {
                    continue;
                }

                if (word.length == 6 && vocabularyWord.length > 9) {
                    continue;
                }

                if (word.length == 7 && vocabularyWord.length > 10) {
                    continue;
                }

                if (word.length == 8 && vocabularyWord.length > 11) {
                    continue;
                }

                if (word.length == 9 && vocabularyWord.length > 12) {
                    continue;
                }

                if (word.length == 10 && vocabularyWord.length > 13) {
                    continue;
                }

                if (word.length == 11 && vocabularyWord.length > 14) {
                    continue;
                }

                if (word.length == 12 && vocabularyWord.length > 15) {
                    continue;
                }

                let distance = levenshtein.get(word, vocabularyWord);

                if (distance < minDistance) {
                    vocabWordWithMinDistance = i;
                    minDistance = distance;
                }
            }

            //console.log(`word: [${word}] best: [${vocabularyWords[vocabWordWithMinDistance]}] ${minDistance}`);
            total += minDistance;

        });

        console.timeEnd(' - Calculating levenshtein distances index');
        console.log(`total = ${total}`);
    });
});