const nGram = require('n-gram');

let uniq = function (array) {
    let seen = {};
    return array.filter((item) => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

let wrap = function (word, n) {
    "use strict";
    if (n === 1) {
        return  word;
    } else if (n < 3) {
        return '_' + word + '_';
    } else if (n < 4) {
        return '__' + word + '__';
    } else if (n < 5) {
        return '___' + word + '___';
    } else if (n < 6) {
        return '____' + word + '____';
    } else if (n < 7) {
        return '_____' + word + '_____';
    } else if (n < 8) {
        return '______' + word + '______';
    } else if (n >= 8) {
        return '_______' + word + '_______';
    }
    return word;
};

let vectorify = function(word) {
    "use strict";
    let ngCount = 3;

    let vectors = nGram(ngCount)(wrap(word, ngCount));

    if (word.length <= 2) {
        vectors = vectors.concat(nGram(1)(wrap(word, 1)))
    }
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

        // for (let i = 0; i < vector.length-1; i++) {
        //     if ('AEUIO'.split('').indexOf(vector.charAt(i)) >=0) {
        //         vectors.push(vector.substr(0, i) + vector.substr(i + 1));
        //     }
        // }
    });

    vectors = uniq(vectors);

    //vector.push(word.length);
    //vector.push(word.length-1);
    //vector.push(word.length-2);

    return vectors;
};

let threeGram = function(word) {
    'use strict';
    return nGram(3)(wrap(word, 3));
};

module.exports = {
    wrap,
    vectorify,
    threeGram
};