const vectorify = require('./ngram').vectorify;

let words = [
    'AB',
    'APPLE',
    'MOTHER',
    'SENTENCE',
    'SENTENTCNES'
];

words.forEach(word => {
    'use strict';
    console.log(`${word} - ${JSON.stringify(vectorify(word))}`);
});