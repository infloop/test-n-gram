const fs = require('fs');
const levenshtein = require('./levenshtein');
const splitSentence = require('./sentence');
const vectorify = require('./ngram').threeGram;

console.time(' - Getting vocabulary');
fs.readFile('./data/vocabulary.txt', {encoding: 'utf8'}, (err, vocabulary) => {
    "use strict";
    if (err) {
        console.log('error', err);
        return err;
    }
    console.timeEnd(' - Getting vocabulary');

    console.time(' - Splitting vocabulary');
    let vocWords = vocabulary.split(/[\r\n]+/g).map(item => item.trim());
    console.timeEnd(' - Splitting vocabulary');

    // limiting the number of vocWords
    // vocWords = vocWords.slice(1, 10);

    console.log('number of vocWords in vocabulary:', vocWords.length);


    let indexes = {
        nGramIndex: {},
        wordFreqIndex: {},
        wordIndex: {},
    };

    console.time(' - Building freq vocabulary index');
    vocWords.forEach((word, i) => {
        word = word.trim();

        if (i%100===0) {console.log(`${i} of ${vocWords.length}`)};
        vocWords.forEach((freqWord) => {
            if (freqWord.indexOf(word) >= 0) {
                indexes.wordFreqIndex[word] = indexes.wordFreqIndex[word] || 0;
                indexes.wordFreqIndex[word]++;
            }
        });
    });
    console.timeEnd(' - Building freq vocabulary index');

    console.time(' - Building vocabulary index');
    vocWords.forEach((word, i) => {
        indexes.wordIndex[word] = i;
        vectorify(word).forEach((ngram) => {
            indexes.nGramIndex[ngram] = indexes.nGramIndex[ngram] || [];
            indexes.nGramIndex[ngram].push(word);
        });
    });
    console.timeEnd(' - Building vocabulary index');

    fs.writeFile('./data/indexes-three-grams.json', JSON.stringify(indexes), {encoding: 'utf8'}, (err) => {
        if (err) {
            console.log('error', err);
            return err;
        }
    });
});