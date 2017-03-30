const fs = require('fs');
const levenshtein = require('./levenshtein');
const splitSentence = require('./sentence');
const autoNGram = require('./ngram').autoNGram;
const threeGram = require('./ngram').threeGram;

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

    console.log('number of words in vocabulary:', vocabularyWords.length);

    let nGramIndex = {};
    let wordIndex = {};
    let wordFreqIndex = {};

    // console.time(' - Building freq vocabulary index');
    // vocabularyWords.forEach((word, i) => {
    //     word = word.trim();
    //
    //     if (i%100===0) {console.log(`${i} of ${vocabularyWords.length}`)};
    //     vocabularyWords.forEach((freqWord) => {
    //         if (freqWord.indexOf(word) >= 0) {
    //             wordFreqIndex[word] = wordFreqIndex[word] || 0;
    //             wordFreqIndex[word]++;
    //         }
    //     });
    // });
    // console.timeEnd(' - Building freq vocabulary index');

    console.time(' - Building n-gram vocabulary index');
    vocabularyWords.forEach((vocabularyWord, vocabularyWordIndex) => {
        if(!vocabularyWord) {
            return;
        }

        wordIndex[vocabularyWord] = true;

        autoNGram(vocabularyWord).forEach((ngram) => {
            nGramIndex[ngram] = nGramIndex[ngram] || [];
            nGramIndex[ngram].push(vocabularyWordIndex + 1);
        });
    });
    console.timeEnd(' - Building n-gram vocabulary index');

    console.time(' - Getting input');
    let total = 0;
    fs.readFile('./data/example_input', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }
        console.timeEnd(' - Getting input');

        let words = splitSentence(data).map(word => word.trim().toUpperCase());

        console.time(' - Finding similar vocabularyWords for input');
        words.forEach((word) => {
            if (word.length <= 1 || wordIndex[word]) {
                console.log(`word: [${word}] exists`);
                return;
            }

            // console.time(' - Building n-gram index for input');
            let bestWordsIndex = [];

            if (word.length > 5) {
                ngCount = 3;
            } else if (word.length <= 5) {
                ngCount = 2;
            }

            let nGramsForWord = autoNGram(word);
            nGramsForWord.forEach((ngram) => {
                if (nGramIndex[ngram]) {

                    nGramIndex[ngram].forEach((wordIndex) => {
                        if (!bestWordsIndex[wordIndex]) {
                            bestWordsIndex[wordIndex] = [i, 0, levenshtein(word, vocabularyWords[wordIndex-1])];
                        } else {
                            bestWordsIndex[wordIndex][1]++;
                        }
                    });
                }
            });

            let invertedIndex = [];
            bestWordsIndex.forEach((wordIndex) => {
                invertedIndex
            });

            // console.timeEnd(' - Building n-gram index for input');
            let sortable = bestWordsIndex.sort(function(a, b) {
                if (a[1] > b[1]) return -1;
                if (a[1] < b[1]) return 1;
                return 0;
            });

            let bestWordInfo = sortable.slice(0, 1)[0];
            let best = vocabularyWords[bestWordInfo[0] - 1];
            let distance = bestWordInfo[2];

            console.log(`word: [${word}] best: [${best}]`);
            console.log('   - ngrams: ', JSON.stringify(nGramsForWord));
            console.log('   - similar: ', JSON.stringify(sortable));
            console.log('   - distance: ', distance);

        });
        console.timeEnd(' - Finding similar vocabularyWords for input');

        console.log('subst', total);
    });
});