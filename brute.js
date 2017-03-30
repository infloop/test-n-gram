const fs = require('fs');
const nGram = require('n-gram');
const levenshtein = require('./levenshtein');
const splitSentence = require('./sentence');

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

    let index = {};
    let wordIndex = {};
    let wordFreqIndex = {};

    console.time(' - Building freq vocabulary index');
    words.forEach((word, i) => {
        word = word.trim();

        if (i%100===0) {console.log(`${i} of ${words.length}`)};
        words.forEach((freqWord) => {
            if (freqWord.indexOf(word) >= 0) {
                wordFreqIndex[word] = wordFreqIndex[word] || 0;
                wordFreqIndex[word]++;
            }
        });
    });
    console.timeEnd(' - Building freq vocabulary index');

    console.time(' - Building n-gram vocabulary index');
    words.forEach((word) => {
        word = word.trim();

        wordIndex[word] = true;

        autoNGram(word).forEach((ngram) => {
            index[ngram] = index[ngram] || [];
            index[ngram].push(word);
        });
    });
    console.timeEnd(' - Building n-gram vocabulary index');

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
            let best2 = sortable.slice(1, 2)[0][0];
            let best3 = sortable.slice(1, 3)[0][0];
            let ld = levenshtein(word, best);
            let ld2 = levenshtein(word, best2);
            let ld3 = levenshtein(word, best3);

            console.log(`word: [${word}] best: [${best}] similar: [${(sortable.slice(0, 10)).map(item => `${item[0]} (${item[1]})`).join(',')}]`);
            console.log('   - ngrams: ', JSON.stringify(nGramsForWord));
            console.log('   - levenshtein: ', ld, ' ', ld2, ' ', ld3);
            console.log('   - bestWordsLD: ', JSON.stringify(bestWordsLD));
            // // console.log('   ', JSON.stringify(bestWordsIndex));
            // console.log('   - best: ', JSON.stringify(bestWordsIndex[word.toUpperCase()]));
            // console.log('   - top: ', JSON.stringify(sortable.slice(0, 10)));
            // console.log('   ');
            subsctCount += bestWordsLD[0][1];
        });
        console.timeEnd(' - Finding similar words for input');

        console.log('subst', subsctCount);
    });
});