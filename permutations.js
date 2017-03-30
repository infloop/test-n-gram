function computePermutations(word, editDistance, maxEditDistance) {
    editDistance = (editDistance || 0) + 1;
    var permutations = [], l = word.length, i, j, m;
    if (l > 1) {
        for (i = 0; i < l; i++) {
            var p = new EditItem();
            p.term = word.slice(0, i) + word.slice(i+1);
            p.distance = editDistance;
            if (permutations.indexOf(p) === -1) {
                permutations.push(p);
                if (typeof maxEditDistance !== 'undefined' && editDistance < maxEditDistance) {
                    var nextPermutations = computePermutations(p.term, editDistance, maxEditDistance);
                    for (j = 0, m = nextPermutations.length; j < m; j++) {
                        if (permutations.indexOf(nextPermutations[j]) === -1) {
                            permutations.push(nextPermutations[j]);
                        }
                    }
                }
            }
        }
    }
    return permutations;
}

console.log(computePermutations('anaconda', 2, 3));