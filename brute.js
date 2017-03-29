const fs = require('fs');
const _ = require('lodash');
const nGram = require('n-gram');
const bloom = new (require('bloomfilter').BloomFilter)(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
);
const splitSentence = require('./sentence');

const ngCount = 2;
console.time(' - Getting vocabulary');
fs.readFile('./data/vocabulary.txt', {encoding: 'utf8'}, (err, data) => {
    "use strict";

    if (err) {
        console.log('error', err);
        return err;
    }

    console.timeEnd(' - Getting vocabulary');

    console.time(' - Splitting vocabulary');
    let words = data.split(/[\r\n]+/g);
    console.timeEnd(' - Splitting vocabulary');

    // limiting the number of words
    // words = words.slice(1, 10);

    console.log('number of words in vocabulary:', words.length);

    console.time(' - Building vocabulary index with bloom filter');
    let index = {};
    words.forEach((word) => {
        bloom.add(word);

        nGram(ngCount)('_' + word.trim() + '_').forEach((ngram) => {
            index[ngram] = index[ngram] || [];
            index[ngram].push(word);
        });
    });
    console.timeEnd(' - Building vocabulary index with bloom filter');

    console.time(' - Getting input');
    fs.readFile('./data/187', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('error', err);
            return err;
        }

        console.timeEnd(' - Getting input');
        let words = splitSentence(data);

        // testing
        // words = ['accumsan', 'accumulations'];

        console.time(' - Finding similar words for input');
        words.forEach((word) => {
            word = word.trim().toUpperCase();

            if (!bloom.test(word)) {
                return;
            }

            // console.time(' - Building n-gram index for input');
            let bestWordsIndex = [];
            let nGramsForWord = nGram(ngCount)('_' + word + '_');
            nGramsForWord.forEach((ngram) => {
                if (index[ngram]) {

                    //console.log(ngram, ' ',index[ngram].length);
                    index[ngram].forEach((wordInResult) => {
                        if (wordInResult) {
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

            // console.log(`word: [${word.toUpperCase()}] similar: [${(sortable.slice(0, 3)).map(item => `${item[0]} (${item[1]})`).join(',')}]`);
            // console.log('   - ngrams: ', JSON.stringify(nGramsForWord));
            // // console.log('   ', JSON.stringify(bestWordsIndex));
            // console.log('   - best: ', JSON.stringify(bestWordsIndex[word.toUpperCase()]));
            // console.log('   - top: ', JSON.stringify(sortable.slice(0, 10)));
            // console.log('   ');
        });
        console.timeEnd(' - Finding similar words for input');

        // console.log(words);
    });
});