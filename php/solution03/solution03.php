<?php

/**
 * Min distance calculation by building index with word lengths and searching
 * over this index in two directions (left and right) from the input word length point.
 *
 * Also uses Levenshtein distance inside.
 *
 * Speed measurements:
 *
 * 1. On my PC takes ~900 ms to compute
 * 2. On my Laptop it takes ~1000 ms to compute
 *
 * PHP 7.0 64-bit is used.
 *
 *
 * Example:
 * LOBORTIS - length [8]
 * step 1 (initial):        word [LOBORTIS] lengthForStep[8]  offset [0]  minDistance [3]
 * step 2 (moving left):    word [LOBORTIS] lengthForStep[7]  offset [-1] minDistance [3]
 * step 3 (moving right):   word [LOBORTIS] lengthForStep[9]  offset [1]  minDistance [3]
 * step 4 (moving left):    word [LOBORTIS] lengthForStep[6]  offset [-2] minDistance [3]
 * step 5 (moving right):   word [LOBORTIS] lengthForStep[10] offset [2]  minDistance [4]
 */

/**
 * Levenshtein min distance for current ctep
 *
 * @param array $vocabularyWords
 * @param string $word
 * @param int $minDistanceForStep
 * @return int
 */
function getMinDistanceForStep(array $vocabularyWords, $word, $minDistanceForStep)
{
    // more then enough
    $minDistance = 1000;
    foreach ($vocabularyWords as $vocabularyWord) {
        $distance = levenshtein($vocabularyWord, $word);
        if ($distance < $minDistance) {
            $minDistance = $distance;
            if ($minDistanceForStep === $minDistance) {
                return $minDistance;
            }
        }
    }
    return $minDistance;
}

// vocabulary file
$vocabularyFile = new SplFileObject('./vocabulary.txt');
$vocabularyFile->setFlags(SplFileObject::DROP_NEW_LINE);

// length-indexed hashtable for vocabulary
$vocabularyIndex = [];

// not reading the whole file at once, only line by line
// for better performance
while (!$vocabularyFile->eof()) {
    $word = trim($vocabularyFile->fgets());
    $length = strlen($word);
    $vocabularyIndex[$length][$word] = $word;
}
unset($vocabularyIndex[0]);
$vocabularyFile = null;

// input file
if (!file_exists($argv[1])) {
    throw new RuntimeException('No input file specified.');
}

$inputFile = new SplFileObject($argv[1]);
$inputFile->setFlags(SplFileObject::DROP_NEW_LINE);
$inputWords = preg_split("/\s+/", strtoupper($inputFile->fgets()));

// total distance
$total = 0;

$vocabularyIndexLengthsCount = count($vocabularyIndex);
$minDistances = [];
foreach ($inputWords as $inputWord) {

    if (array_key_exists($inputWord, $minDistances)) {
        $total += $minDistances[$inputWord];
        continue;
    }
    $wordLength = strlen($inputWord);
    if (array_key_exists($wordLength, $vocabularyIndex) &&
        array_key_exists($inputWord, $vocabularyIndex[$wordLength])
    ) {
        continue;
    }

    $indexPosition = $vocabularyIndexLengthsCount;
    $minDistanceForStep = 1;
    $lengthForStep = $wordLength;

    $minDistance = 1000;
    $offset = 1;

    // searching Levenshtein distance for words that have similar lengths
    // and a little bit moving around this length
    while ($indexPosition >= 0 && $minDistanceForStep < $minDistance) {
        if (array_key_exists($lengthForStep, $vocabularyIndex)) {
            $currentStepMinDistance = getMinDistanceForStep($vocabularyIndex[$lengthForStep], $inputWord, $minDistanceForStep);
            if ($currentStepMinDistance < $minDistance) {
                $minDistance = $currentStepMinDistance;
                if ($minDistance === $minDistanceForStep) {
                    break;
                }
            }
        }

        // switching directions of movement
        $offset = -$offset;
        $lengthForStep = $wordLength + $offset;

        if ($offset > 0) {
            $offset++;
        }

        $minDistanceForStep = abs($wordLength - $lengthForStep);
        $indexPosition--;
    }
    $minDistances[$inputWord] = $minDistance;
    $total += $minDistance;
}

printf("%d\n", $total);
