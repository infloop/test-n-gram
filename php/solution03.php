<?php

$startupTime = microtime(true);
$start = microtime(true);
$inputFile = new SplFileObject($argv[1]);
$inputFile->setFlags(SplFileObject::DROP_NEW_LINE);
$text = preg_split("/\s+/", $inputFile->fgets());

$inputText = explode(' ', strtoupper($text));
$inputFile = null;
$vocabulary = [];
$lengths = [];
$file = new SplFileObject('vocabulary.txt');
$file->setFlags(SplFileObject::DROP_NEW_LINE);
while (!$file->eof()) {
    $line = $file->fgets();
    $length = strlen($line);
    $vocabulary[$length][$line] = $line;
}
unset($vocabulary[0]);
$file = null;
$totalDistance = 0;
$lengthsCount = count($vocabulary);
$cache = [];
foreach ($inputText as $inputWord) {
    /** @noinspection UnSafeIsSetOverArrayInspection */
    if (isset($cache[$inputWord])) {
        $totalDistance += $cache[$inputWord];
        continue;
    }
    $wordLength = strlen($inputWord);
    /** @noinspection UnSafeIsSetOverArrayInspection */
    if (isset($vocabulary[$wordLength][$inputWord])) {
        continue;
    }
    $amplitude = 1;
    $possibleMin = 1;
    $lengthsToCheck = $lengthsCount;
    $searchLength = $wordLength;
    $min = PHP_INT_MAX;
    while ($min > $possibleMin) {
        if (isset($vocabulary[$searchLength])) {
            $minDistance = findMinDistance($vocabulary[$searchLength], $inputWord, $possibleMin);
            if ($minDistance < $min) {
                $min = $minDistance;
                if ($possibleMin === $min) {
                    break;
                }
            }
            if (!--$lengthsToCheck) {
                break;
            }
        }
        $amplitude = -$amplitude;
        $searchLength = $wordLength + $amplitude;
        $possibleMin = abs($wordLength - $searchLength);
        if (0 < $amplitude) {
            $amplitude++;
        }
    }
    $cache[$inputWord] = $min;
    $totalDistance += $min;
}
if (isset($argv[2])) {
    echo round(memory_get_peak_usage(true)/(1024 * 1024)) . "Mb\n";
    $time = microtime(true) - $start;
    echo $time . "\n";
    if ($time > 3) {
        //  throw new RuntimeException('Too slow');
    }
}
echo $totalDistance . "\n";
printf(" - Total time  %dms\n", (microtime(true) - $startupTime)*1000);
/**
 * @param array $vocabulary
 * @param string $inputWord
 * @param int $possibleMin
 * @return int
 */
function findMinDistance(array $vocabulary, $inputWord, $possibleMin)
{
    $min = PHP_INT_MAX;
    foreach ($vocabulary as $word) {
        $distance = levenshtein($word, $inputWord);
        if ($distance < $min) {
            $min = $distance;
            if ($possibleMin === $min) {
                return $min;
            }
        }
    }
    return $min;
}
