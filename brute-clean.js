const fs = require('fs');
const levenshtein = require('./levenshtein');
const splitSentence = require('./sentence');
const autoNGram = require('./ngram').autoNGram;
const threeGram = require('./ngram').threeGram;

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

    console.time(' - Building vocabulary index');
    let index = {};
    let wordIndex = {};
    let wordFreqIndex = {};
    vocWords.forEach((word) => {

        wordIndex[word] = true;

        // vocWords.forEach((freqWord) => {
        //     if (freqWord.indexOf(word) >=0 ) {
        //         wordFreqIndex[word] = wordFreqIndex[word] || 0;
        //         wordFreqIndex[word]++;
        //     }
        // });

        // if (word.length < 2) {
        //     word = '_' + word + '_';
        // }


        autoNGram(word).forEach((ngram) => {
            index[ngram] = index[ngram] || [];
            index[ngram].push(word);
        });
    });
    console.timeEnd(' - Building vocabulary index');

    let total = 0;

    console.time(' - Getting input');
    fs.readFile('./vocabulary/example_input', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }
        console.timeEnd(' - Getting input');

        let words = splitSentence(data).map(word => word.trim().toUpperCase());
        // testing
        // vocWords = ['accumsan', 'accumulations'];

        console.time(' - Finding similar vocWords for input');
        words.forEach((word) => {
            // word = word.trim().toUpperCase();

            if (word.length <= 1 || wordIndex[word]) {
                console.log(`word: [${word}] exists`);
                return;
            }

            // console.time(' - Building n-gram index for input');
            let bestWordsIndex = {};

            let nGramsForWord = autoNGram(word);
            nGramsForWord.forEach((ngram) => {
                if (index[ngram]) {

                    //console.log(ngram, ' ',index[ngram].length);
                    index[ngram].forEach((wordInResult) => {
                        if (wordInResult && ((word.length+1) > wordInResult.length) && wordInResult.length > (word.length-1)) {
                            bestWordsIndex[wordInResult] = bestWordsIndex[wordInResult] || 0;
                            bestWordsIndex[wordInResult]++;
                        }
                    });
                }
            });

            // console.timeEnd(' - Building n-gram index for input');

            let sortable = [];
            for (let item in bestWordsIndex) {
                sortable.push([item, bestWordsIndex[item]]);
            }

            sortable = sortable.sort(function(a, b) {
                if (a[1] > b[1]) return -1;
                if (a[1] < b[1]) return 1;
                return 0;
            });

            let bestWordsLD = [];

            sortable.slice(0, 10).forEach(bw => {
                bestWordsLD.push([bw[0], levenshtein(word, bw[0])]);
            });

            bestWordsLD = bestWordsLD.sort(function(a, b) {
                if (a[1] > b[1]) return 1;
                if (a[1] < b[1]) return -1;
                return 0;
            });

            let best = sortable.slice(0, 1)[0][0];



            console.log(`word: [${word}] best: [${best}]`);
            console.log('   - ngrams: ', JSON.stringify(nGramsForWord));
            console.log('   - distance: ');
            console.log('   - bestWordsLD: ', JSON.stringify(bestWordsLD));
            // // console.log('   ', JSON.stringify(bestWordsIndex));
            // console.log('   - best: ', JSON.stringify(bestWordsIndex[word.toUpperCase()]));
            // console.log('   - top: ', JSON.stringify(sortable.slice(0, 10)));
            // console.log('   ');
            total += bestWordsLD[0][1];
        });
        console.timeEnd(' - Finding similar vocWords for input');

        console.log('subst', total);
    });
});