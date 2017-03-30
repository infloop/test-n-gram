<?php

$vocLoadTime = microtime(true);
$file = file_get_contents('./vocabulary.txt');
// printf(" - Getting vocabulary %dms \n", (microtime(true) - $vocLoadTime)*1000);

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

foreach($vocabularyWords as $index => $vocabularyWord) {
    $invertedWordsIndex[$vocabularyWord] = $index;
}

$total = 0;
$searchTime = microtime(true);
foreach ($words as $word) {

    $minDistance = 10;
    // $mostSimilarWordIndex = -1;

    if (array_key_exists($word, $invertedWordsIndex)) {
        continue;
    }

    $vocabularyWord = '';
    for ($i = 0; $i < count($vocabularyWords) - 1; $i++ ) {
        $vocabularyWord = $vocabularyWords[$i];

        // minimum distance - skipping other steps
        if ($minDistance === 1) {
            break;
        }

        // restriction for length difference for small-length words
        if (strlen($word) <= 3 && strlen($vocabularyWord) - strlen($word) > 1) {
            continue;
        }

        // restriction for length difference for medium-length words
        if (strlen($word) >= 4 && strlen($vocabularyWord) - strlen($word) > 2) {
            continue;
        }

        // calculation of similarity/difference ratio
        $distance = levenshtein($word, $vocabularyWord);

        if ($distance < $minDistance) {
            // $mostSimilarWordIndex = $i;
            $minDistance = $distance;
        }
    }

    // printf("word: [$word] best: [$vocabularyWords[$mostSimilarWordIndex]] $minDistance \n");
    $total += $minDistance;
}

printf("%d \n", $total);
// printf(" - Calculating Levenshtein distances index %dms \n", (microtime(true) - $searchTime)*1000);
// printf(" - Total number of substitutions %d \n", $total);
// printf(" - Total time  %dms\n", (microtime(true) - $vocLoadTime)*1000);
