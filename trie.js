// Sample words to be inserted into the trie
const words = [
    "function", "for", "if", "else", "while", "do", "return", "const", "let", "var",
    "class", "constructor", "extends", "super", "static", "this", "import", "export",
    "async", "await", "try", "catch", "finally", "throw", "promise", "map", "filter",
    "reduce", "object", "array", "string", "number", "boolean", "null", "undefined",
    "setTimeout", "setInterval", "clearTimeout", "clearInterval", "console", "log",
    "debugger", "document", "getElementById", "querySelector", "addEventListener",
    "removeEventListener", "JSON", "parse", "stringify", "Math", "random", "floor",
    "ceil", "round", "push", "pop", "shift", "unshift", "splice", "slice", "join",
    "indexOf", "lastIndexOf", "includes", "some", "every", "find", "findIndex",
    "map", "filter", "reduce", "sort", "reverse", "toString", "toFixed", "toUpperCase",
    "toLowerCase", "trim", "split", "replace", "match", "exec", "myVariable", "algorithm",
    "binary", "compile", "debug", "exception", "function", "git", "hash", "iteration", "javadoc",
    "keyword", "library", "method", "namespace", "object", "parameter", "query", "recursion",
    "syntax", "token", "variable", "while", "XML", "yield", "zip","Function", "For", "If", "Else",
    "While", "Do", "Return", "Const", "Let", "Var", "Class", "Constructor", "Extends", "Super", "Static",
    "This", "Import", "Export", "Async", "Await", "Try", "Catch", "Finally", "Throw", "Promise", "Map",
   "Filter", "Reduce", "Object", "Array", "String", "Number", "Boolean", "Null", "Undefined", "SetTimeout",
    "SetInterval", "ClearTimeout", "ClearInterval", "Console", "Log", "Debugger", "Document", "GetElementById",
    "QuerySelector", "AddEventListener", "RemoveEventListener", "JSON", "Parse", "Stringify", "Math", "Random",
    "Floor", "Ceil", "Round", "Push", "Pop", "Shift", "Unshift", "Splice", "Slice", "Join", "IndexOf",
    "LastIndexOf", "Includes", "Some", "Every", "Find", "FindIndex", "Map", "Filter", "Reduce", "Sort",
    "Reverse", "ToString", "ToFixed", "ToUpperCase", "ToLowerCase", "Trim", "Split", "Replace", "Match",
    "Exec", "MyVariable", "Algorithm", "Binary", "Compile", "Debug", "Exception", "Function", "Git", "Hash", 
    "Iteration", "Javadoc", "Keyword", "Library", "Method", "Namespace", "Object", "Parameter", "Query", "Recursion",
     "Syntax", "Token", "Variable", "While", "XML", "Yield", "Zip"
];

class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.frequency = 0; // Frequency count
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    delete(word) {
        const deleteHelper = (node, word, depth) => {
            // Base case: if the node is null, return null
            if (!node) return null;

            // If we have reached the end of the word
            if (depth === word.length) {
                // If the word is marked as end of word
                if (node.isEndOfWord) {
                    node.isEndOfWord = false; // Unmark the end of word
                }

                // Return true if this node has no children, indicating it can be deleted
                return Object.keys(node.children).length === 0;
            }

            const char = word[depth];
            // Recursively delete the character from the children
            const shouldDeleteCurrentNode = deleteHelper(node.children[char], word, depth + 1);

            // If true is returned, delete the mapping of the character
            if (shouldDeleteCurrentNode) {
                delete node.children[char];
                // Return true if no children left, indicating this node can also be deleted
                return Object.keys(node.children).length === 0 && !node.isEndOfWord;
            }

            return false; // Node is not deleted
        };

        deleteHelper(this.root, word, 0);
    }

    getSuggestions(prefix) {
        const queue = new PriorityQueue();
        const node = this.findNode(prefix);
        if (node) {
            this.suggestionsHelper(node, prefix, queue);
        }
    
        // Collect suggestions from the priority queue
        const suggestions = [];
        while (!queue.isEmpty()) {
            suggestions.push(queue.dequeue());
        }
    
        // Limit to top 15 suggestions
        const topSuggestions = suggestions.slice(0, 15).map(suggestion => suggestion.word);
    
        // Find the closest word if no suggestions are found
        if (topSuggestions.length === 0) {
            // console.log("closestWord");
            const closestWord = this.findClosestWord(prefix);
            // console.log("closestWord  2");
            if (closestWord) {
                topSuggestions.push(closestWord);
            }
        }
        
        return topSuggestions; // Return only the top suggestions
    }
    

    findNode(prefix) {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children[char]) {
                return null;
            }
            node = node.children[char];
        }
        return node;
    }

    suggestionsHelper(node, prefix, queue) {
        if (node.isEndOfWord) {
            queue.enqueue({ word: prefix, frequency: node.frequency });
        }
        for (const char in node.children) {
            this.suggestionsHelper(node.children[char], prefix + char, queue);
        }
    }

    findClosestWord(word) {
        let closestWord = null;
        let maxSequentialMatch = 0;
    
        for (const candidate of words) {
            const distance = this.levenshteinDistance(word, candidate);
            const sequentialMatchLength = this.getSequentialMatchLength(word, candidate);
    
            if (sequentialMatchLength > maxSequentialMatch || 
                (sequentialMatchLength === maxSequentialMatch && distance < this.levenshteinDistance(word, closestWord))) {
                maxSequentialMatch = sequentialMatchLength;
                closestWord = candidate;
            }
        }
        return closestWord;
    }
    
    getSequentialMatchLength(word, candidate) {
        let maxLength = 0;
        let currentLength = 0;
        let candidateIndex = 0;

        for (let i = 0; i < word.length; i++) {
            if (candidateIndex < candidate.length && word[i] === candidate[candidateIndex]) {
                currentLength++;
                candidateIndex++;
            } else if (currentLength > 0) {
                maxLength = Math.max(maxLength, currentLength);
                currentLength = 0;
                candidateIndex = 0; // Reset for the next match
            }
        }
        maxLength = Math.max(maxLength, currentLength);
        return maxLength;
    }

    levenshteinDistance(a, b) {
        // if (a === null || b === null) { console.error("Invalid input: one of the strings is null"); return Infinity; // Or some other error handling }
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
}

// Create the trie and insert the words
const trie = new Trie();
words.forEach(word => trie.insert(word));

// Function to increment the frequency of a word when it is selected
function incrementWordFrequency(word) {
    const node = trie.findNode(word);
    if (node) {
        node.frequency++; // Increment frequency if the word exists
    }
}

