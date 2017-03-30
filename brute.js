const fs = require('fs');
const _ = require('lodash');
const nGram = require('n-gram');
const bloom = new (require('bloomfilter').BloomFilter)(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
);
const splitSentence = require('./sentence');

function uniq(array) {
    let seen = {};
    return array.filter((item) => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });

    //return array;
}

function wrap(word, n) {
    "use strict";
    if (n <= 2) {
        return '_' + word + '_';
    } else if (n <= 3) {
        return '__' + word + '__';
    } else if (n > 3) {
        return '___' + word + '___';
    }
    return '__' + word + '__';
}

function autoNGram(word) {
    "use strict";
    let ngCount = 2;

    if (word.length <= 4) {
        ngCount = 3;
    } else if (word.length > 6) {
        ngCount = 3;
    } else if (word.length > 8) {
        ngCount = 4;
    } else if (word.length > 10) {
        ngCount = 5;
    }

    let vector = uniq(
        nGram(ngCount)(wrap(word, ngCount))
            .concat(nGram(ngCount+1)(wrap(word, ngCount)))
            .concat(nGram(ngCount+2)(wrap(word, ngCount)))
    );

    vector.push(word.length);
    vector.push(word.length-1);

    ve

    return vector;
}

function levDist(s, t) {
    let d = []; //2d matrix

    // Step 1
    let n = s.length;
    let m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (let i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (let i = n; i >= 0; i--) d[i][0] = i;
    for (let j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (let i = 1; i <= n; i++) {
        let s_i = s.charAt(i - 1);

        // Step 4
        for (let j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            let t_j = t.charAt(j - 1);
            let cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            let mi = d[i - 1][j] + 1;
            let b = d[i][j - 1] + 1;
            let c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    // Step 7
    return d[n][m];
}

let ngCount = 2;
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
    let wordIndex = {};
    words.forEach((word) => {
        word = word.trim();
        // bloom.add(word);

        wordIndex[word] = true;

        // if (word.length < 2) {
        //     word = '_' + word + '_';
        // }


        autoNGram(word).forEach((ngram) => {
            index[ngram] = index[ngram] || [];
            index[ngram].push(word);
        });
    });
    console.timeEnd(' - Building vocabulary index with bloom filter');

    console.time(' - Getting input');
    let subsctCount = 0;
    fs.readFile('./data/example_input', {encoding: 'utf8'}, (err, data) => {
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

            if (word.length <= 1 || wordIndex[word]) {
                console.log(`word: [${word}] exists`);
                return;
            }

            // console.time(' - Building n-gram index for input');
            let bestWordsIndex = {};

            if (word.length > 5) {
                ngCount = 3;
            } else if (word.length <= 5) {
                ngCount = 2;
            }

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

            let best = sortable.slice(0, 1)[0][0];
            let ld = levDist(word, best)

            console.log(`word: [${word}] best: [${best}] similar: [${(sortable.slice(0, 5)).map(item => `${item[0]} (${item[1]})`).join(',')}]`);
            console.log('   - ngrams: ', JSON.stringify(nGramsForWord));
            console.log('   - levDist: ', ld);
            // // console.log('   ', JSON.stringify(bestWordsIndex));
            // console.log('   - best: ', JSON.stringify(bestWordsIndex[word.toUpperCase()]));
            // console.log('   - top: ', JSON.stringify(sortable.slice(0, 10)));
            // console.log('   ');
            subsctCount += ld;
        });
        console.timeEnd(' - Finding similar words for input');

        console.log('subst', subsctCount);
    });
});