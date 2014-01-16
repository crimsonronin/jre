<?php

namespace Jre\Fetcher;

use \DateTime;

trait SearchTrait
{

    protected static $excludedWords = [
        'AN', 'THE', 'A', 'OF', 'AND', 'IS'
    ];
    protected $searchTerms = [];

    /**
     * 
     * @return array
     */
    public function getSearchTerms()
    {
        return $this->searchTerms;
    }

    /**
     * 
     * @param array $searchTerms
     */
    public function setSearchTerms($searchTerms = [])
    {
        $this->searchTerms = $searchTerms;
    }

    /**
     * 
     * @param string $searchTerm
     */
    public function addSearchTerm($searchTerm)
    {
        if (!in_array($searchTerm, $this->searchTerms)) {
            $this->searchTerms[] = $searchTerm;
        }
    }

    /**
     * 
     */
    public function createSearchTerms()
    {
        $strings = func_get_args();
        foreach ($strings as $string) {
            if (is_array($string) === true) {
                foreach ($string as $subString) {
                    $this->createSearchWords($subString);
                }
            } else {
                $this->createSearchWords($string);
            }
        }
    }

    protected function createSearchWords($string)
    {
        $words = explode(' ', $string);
        foreach ($words as $word) {
            $word = str_replace(['"'], '', strtoupper(trim($word)));
            if (!ctype_punct($word) && !in_array($word, self::$excludedWords) && strlen($word) > 2) {
                $this->addSearchTerm($word);
            }
        }
    }

}
