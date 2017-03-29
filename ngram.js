module.exports = function nGram(n) {
    if (typeof n !== 'number' || isNaN(n) || n < 1 || n === Infinity) {
        throw new Error('`' + n + '` is not a valid argument for n-gram');
    }

    return grams;

    /* Create n-grams from a given value. */
    function grams(value) {
        var nGrams = [];
        var index;

        if (value === null || value === undefined) {
            return nGrams;
        }

        value = String(value);
        index = value.length - n + 1;

        if (index < 1) {
            return nGrams;
        }

        while (index--) {
            nGrams[index] = value.substr(index, n);
        }

        return nGrams;
    }
}