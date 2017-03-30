const fs = require('fs');
const levenshtein = require('fast-levenshtein');
const splitSentence = require('./../sentence');

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

    console.time(' - Getting input');
    fs.readFile('./data/187', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }

        console.timeEnd(' - Getting input');


        let distanceIndex = [];
        let words = splitSentence(data).map(word => word.trim().toUpperCase());

        let wordIndex = {};
        vocabularyWords.forEach((vocabularyWord, i) => {
            wordIndex[vocabularyWord] = i+1;
        });

        let total = 0;

        console.time(' - Calculating levenshtein distances index');
        words.forEach((word, j) => {
            if (!word) {
                return;
            }

            if (wordIndex[word]) {
                return;
            }

            vocabularyWords.forEach((vocabularyWord, i) => {
                let distance = levenshtein.get(word, vocabularyWord);

                if (i === 0) {
                    distanceIndex[j] = [];
                }

                if (distanceIndex[j][i] === 1) {
                    return;
                }

                if (distance < 5) {
                    distanceIndex[j][i] = [i, distance];
                }
            });

            let index = [];
            distanceIndex[j].forEach((item) => {
                let wIndex = item[0];
                let distance = item[1];
                if (!index[distance]) {
                    index[distance] = wIndex;
                }
            });

            let bestWordIndex = -1;

            let d = 0;
            for (d = 0; d < 4; d++) {
                if ((index[d])>=0) {
                    bestWordIndex = index[d];
                    break;
                }
            }

            console.log(`word: [${word}] best: [${vocabularyWords[bestWordIndex]}]`);
            console.log('   - bestWordIndex: ', bestWordIndex);
            console.log('   - index: ', JSON.stringify(index));
            console.log('   - d: ', d);
            // console.log('   - distanceIndex: ', JSON.stringify(distanceIndex));

            total += d;
        });

        // console.log(distanceIndex);

        console.timeEnd(' - Calculating levenshtein distances index');
        console.log(`total = ${total}`);
    });
});