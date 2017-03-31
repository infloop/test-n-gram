<?php

ini_set('memory_limit', '-1');

/**
 * More speedy solution using nGram (3) index over vocabulary.
 *
 *
 * Speed measurements:
 *
 * 1. On my PC takes ~1100 ms to compute
 * 2. On my Laptop it takes ~1400 ms to compute
 *
 * PHP 7.0 64-bit is used.
 *
 */

/**
 * @param string$word
 * @return array<string>
 */
function Trigrams($word) {
    // wrapping
    $word = '__'.$word.'__';

    $ngrams = array();
    $len = strlen($word);
    for($i=0;$i+2<$len;$i++){
        $ngrams[$i]=$word[$i].$word[$i+1].$word[$i+2];
    }
    return $ngrams;
}

$startupTime = microtime(true);

/**
 * Index object with properties:
 * nGramIndex
 */
$indexJsonData = file_get_contents('./indexes-three-grams.json');
$index = json_decode($indexJsonData, true);

$file = file_get_contents('./vocabulary.txt');
// printf(" - Getting vocabulary %dms \n", (microtime(true) - $startupTime)*1000);

// $vocSplitTime = microtime(true);
$vocabularyWords = preg_split("/[\r\n]+/", $file);
// printf(" - Splitting vocabulary %dms \n", (microtime(true) - $vocSplitTime)*1000);

// $inputFileLoadTime = microtime(true);
$input = file_get_contents('./187');
// printf(" - Getting input %dms \n", (microtime(true) - $inputFileLoadTime)*1000);

// $inputSplitTime = microtime(true);
$dirtyWords = preg_split("/\s+/", $input);
array_pop($dirtyWords);
$words = [];
foreach($dirtyWords as $word) {
    $words[] = strtoupper(trim($word));
}
// printf(" - Splitting input %dms \n", (microtime(true) - $inputSplitTime)*1000);

$invertedWordsIndex = [];
foreach($vocabularyWords as $vocabWord) {
    $invertedWordsIndex[$vocabWord] = 1;
}

$total = 0;
$searchTime = microtime(true);
foreach ($words as $word) {

    // word exists in vocabulary - skipping
    if (array_key_exists($word, $invertedWordsIndex)) {
        continue;
    }

    $nGramsForWord = Trigrams($word);

    $nGramWords = [];
    foreach($nGramsForWord as $ngram) {
        if ($index['nGramIndex'][$ngram]) {
            foreach ($index['nGramIndex'][$ngram] as $wordInNgramIndex) {
                $nGramWords[] = $wordInNgramIndex;
            }
        }
    }

    $minDistance = 10;
    // $mostSimilarWord = '';

    $vocabWord = '';
    for ($i = 0; $i < count($nGramWords) - 1; $i++ ) {
        $vocabWord = $nGramWords[$i];

        // minimum distance - skipping other steps (== is faster then ===)
        if ($minDistance == 1) {
            break;
        }

        // restriction for length difference for small-length words
        if (strlen($word) <= 3 && strlen($vocabWord) - strlen($word) > 1) {
            continue;
        }

        // restriction for length difference for medium-length words
        if (strlen($word) >= 4 && strlen($vocabWord) - strlen($word) > 2) {
            continue;
        }

        // calculation of levenshtein distance
        $distance = levenshtein($word, $vocabWord);

        if ($distance < $minDistance) {
            // $mostSimilarWord = $vocabWord;
            $minDistance = $distance;
        }
    }

    // printf("word: [$word] best: [$mostSimilarWord] $minDistance \n");
    $total += $minDistance;
}

printf("%d\n", $total);
// printf(" - Calculating Levenshtein distances index %dms \n", (microtime(true) - $searchTime)*1000);
// printf(" - Total number of substitutions %d \n", $total);
// printf(" - Total time  %dms\n", (microtime(true) - $startupTime)*1000);