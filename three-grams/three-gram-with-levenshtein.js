
const index = require('../data/indexes-three-grams.json');
const fs = require('fs');
const threeGram = require('../ngram').threeGram;
const splitSentence = require('./../sentence');
const levenshtein = require('fast-levenshtein');

console.time(' - Total time');
console.time(' - Getting vocabulary');
fs.readFile('../data/vocabulary.txt', {encoding: 'utf8'}, (err, vocabulary) => {
    "use strict";
    if (err) {
        console.log('error', err);
        return err;
    }
    console.timeEnd(' - Getting vocabulary');

    console.time(' - Splitting vocabulary');
    let vocWords = vocabulary.split(/[\r\n]+/g).map(item => item.trim());
    console.timeEnd(' - Splitting vocabulary');
    console.log('number of vocWords in vocabulary:', vocWords.length);

    let total = 0;

    console.time(' - Getting input');
    fs.readFile('../data/187', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }

        console.timeEnd(' - Getting input');

        let words = splitSentence(data).map(word => word.toUpperCase());

        console.time(' - Calculating Levenshtein distances index');
        words.forEach((word) => {

            // skipping words that exists in vocabulary
            if (index.wordIndex[word]) {
                return;
            }

            let nGramsForWord = threeGram(word);

            let nGramWords = [];
            //let nGramWordsFoundIndex = {};
            nGramsForWord.forEach((ngram) => {
                if (index.nGramIndex[ngram]) {
                    index.nGramIndex[ngram].forEach((nGramWord) => {
                        //if (!nGramWordsFoundIndex[nGramWord]) {
                            nGramWords.push(nGramWord);
                            //nGramWordsFoundIndex[nGramWord] = 1;
                        //}
                    });
                }
            });

            let minDistance = 10;
            let vocabWordBest = null;
            let nGramWord = '';
            for (let i = 0; i < nGramWords.length-1; i++ ) {
                nGramWord = nGramWords[i];

                if (minDistance === 1) {
                    break;
                }

                if (word.length <= 3 && (nGramWord.length - word.length) > 1) {
                    continue;
                }

                if (word.length >= 4 && (nGramWord.length - word.length) > 2) {
                    continue;
                }

                let distance = levenshtein.get(word, nGramWord);

                if (distance < minDistance) {
                    vocabWordBest = nGramWord;
                    minDistance = distance;
                }
            }

            console.log(`word: [${word}] best: [${vocabWordBest}] ${minDistance}`);
            //console.log(` - nGramWords.length: ${nGramWords.length}`);
            total += minDistance;

        });

        console.timeEnd(' - Calculating Levenshtein distances index');
        console.log(` - Total number of substitutions = ${total}`);
        console.timeEnd(' - Total time');
    });
});
