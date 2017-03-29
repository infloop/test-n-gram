const nGram = require('n-gram');

let vocabulary = [
    'ABAKAS',
    'ABALONE',
    'ABALONES',
    'ABAMP',
    'ABAMPERE',
    'ABAMPERES',
    'ABAMPS',
    'ABANDON',
    'ABANDONED',
    'ABANDONER',
    'ABANDONERS',
    'ABANDONING',
    'ABANDONMENT',
    'ABANDONMENTS',
];

let word = 'ABANDANIN';

console.log(nGram.bigram(vocabulary[5]));
console.log(nGram.bigram(word));