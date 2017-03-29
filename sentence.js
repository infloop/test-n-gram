/**
 *
 * @param {string} sentence
 * @returns {Array<string>}
 */
function splitSentence(sentence) {
    "use strict";

    return sentence.split(/\s+/g);
}

// console.log(splitSentence('tihs   sententcnes iss  nout varrry goud'));


module.exports = splitSentence;