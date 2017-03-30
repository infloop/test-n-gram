const fs = require('fs');
const nGram = require('n-gram');
const splitSentence = require('./../sentence');
const levenshtein = require('fast-levenshtein');

console.time(' - Total time');
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


        let words = splitSentence(data).map(word => word.toUpperCase());
        let wordIndex = {};
        vocabularyWords.forEach((vocabularyWord, i) => {
            wordIndex[vocabularyWord] = i;
        });

        console.time(' - Calculating Levenshtein distances index');
        words.forEach((word) => {

            let minDistance = 10;
            let vocabWordWithMinDistance = null;

            if (wordIndex[word]) {
                return;
            }

            for (let i = 0; i < vocabularyWords.length-1; i++ ) {
                let vocabularyWord = vocabularyWords[i];

                if (minDistance === 1) {
                    break;
                }

                if (word.length <= 3 && (vocabularyWord.length - word.length) > 1) {
                    continue;
                }

                if (word.length >= 4 && (vocabularyWord.length - word.length) > 2) {
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

        console.timeEnd(' - Calculating Levenshtein distances index');
        console.log(` - Total number of substitutions = ${total}`);
        console.timeEnd(' - Total time');
    });
});