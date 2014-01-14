<?php

namespace Jre\Fetcher;

use \DateTime;

trait SearchTrait
{

    private $searchTerms = [];

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
        $strings = func_num_args();
        foreach ($strings as $string) {
            $words = explode(' ', $string);
            foreach ($words as $word) {
                $this->addSearchTerm(str_replace(['"'], '', strtoupper(trim($word))));
            }
        }
    }

}
