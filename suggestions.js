const suggestionsList = document.getElementById('suggestions');
let currentIndex = -1; // To track the currently highlighted suggestion

const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    lineNumbers: true,
    mode: "javascript",
    theme: "default",
    lineWrapping: true, // Enable line wrapping

});


// Event listener for the CodeMirror editor
editor.on('inputRead', function (cm, change) {
    const cursor = cm.getCursor();
    const inserted = change.text[0]; // The text that was just inserted

    // Map for opening and closing parentheses
    const parenthesesMap = {
        '(': ')',
        '{': '}',
        '[': ']'
    };

    // Check if the inserted character is an opening parenthesis
    if (parenthesesMap[inserted]) {
        // Insert the corresponding closing parenthesis
        cm.replaceRange(parenthesesMap[inserted], cursor);
        cm.setCursor(cursor.line, cursor.ch);
    }

    // Handle suggestions
    const token = cm.getTokenAt(cursor);
    const currentText = token.string; // The current text of the token

    if (currentText.length > 0) {
        const suggestions = trie.getSuggestions(currentText);
        suggestionsList.innerHTML = ''; // Clear previous suggestions
        currentIndex = -1; // Reset current index

        if (suggestions.length > 0) {
            // Add suggestions from the Trie
            suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.addEventListener('click', () => {
                    replaceToken(suggestion, token, cursor);
                    addWordToTrie(suggestion); // Optional: update frequency
                });
                suggestionsList.appendChild(li);
            });
        } else {
            addWordToTrie(currentText);
            incrementWordFrequency(currentText);
        }

        // Update current index and highlight suggestions
        currentIndex = suggestions.length > 0 ? 0 : -1; // Reset if no suggestions
        highlightSuggestion(suggestionsList.querySelectorAll('li'));

        // Position the suggestions dropdown
        //1
        const { left, top } = cm.cursorCoords(cursor, "local");
        const lineHeight = cm.defaultTextHeight();
        const navbarHeight = document.querySelector('.navbar').getBoundingClientRect().height;
        const totalTopPosition = top + lineHeight + navbarHeight;

        suggestionsList.style.left = `${left}px`;
        suggestionsList.style.top = `${totalTopPosition + lineHeight}px`;
        suggestionsList.style.display = (suggestions.length > 0) ? 'block' : 'none';

    } else {
        suggestionsList.style.display = 'none'; // Hide if no token
    }
});

// Handle keyboard events for suggestions
editor.on('keydown', function (cm, event) {
    const items = suggestionsList.querySelectorAll('li');
    if (suggestionsList.style.display === 'block') {
        if (event.key === 'ArrowDown') {
            currentIndex = (currentIndex + 1) % items.length; // Move down
            highlightSuggestion(items);
            scrollToSuggestion(items[currentIndex]);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            currentIndex = (currentIndex - 1 + items.length) % items.length; // Move up
            highlightSuggestion(items);
            scrollToSuggestion(items[currentIndex]);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            if (currentIndex >= 0) {
                const selectedSuggestion = items[currentIndex].textContent;
                incrementWordFrequency(selectedSuggestion);
                const actualSuggestion = selectedSuggestion.startsWith("Did you mean: ") ? 
                    selectedSuggestion.replace("Did you mean: ", "").replace("?", "") : 
                    selectedSuggestion;
                replaceToken(actualSuggestion, cm.getTokenAt(cm.getCursor()), cm.getCursor());
                event.preventDefault();
            }
        } else if (event.key === ' ') {
            const currentWord = getCurrentWord(cm);
            addWordToTrie(currentWord);
            incrementWordFrequency(currentWord);
            suggestionsList.innerHTML = ''; // Clear suggestions
            suggestionsList.style.display = 'none'; // Hide suggestions
            currentIndex = -1; // Reset index
        }
        else if (event.key === '-') {
            if (currentIndex >= 0) {
                const selectedSuggestion = items[currentIndex].textContent;
                
                // Remove from trie
                trie.delete(selectedSuggestion);
                
                // Remove from suggestions list
                items[currentIndex].remove();
                
                // Update suggestions list to reflect the change
                const updatedItems = suggestionsList.querySelectorAll('li');
                if (updatedItems.length === 0) {
                    suggestionsList.style.display = 'none'; // Hide if no items left
                } else {
                    // Update currentIndex if needed
                    currentIndex = (currentIndex >= updatedItems.length) ? updatedItems.length - 1 : currentIndex;
                    highlightSuggestion(updatedItems); // Highlight the new current suggestion
                }
        
                event.preventDefault(); // Prevent default action
            }
        }
    }
});

// Function to scroll to the currently highlighted suggestion
function scrollToSuggestion(suggestionItem) {
    if (suggestionItem) {
        const suggestionListHeight = suggestionsList.clientHeight;
        const itemTop = suggestionItem.offsetTop;
        const itemHeight = suggestionItem.clientHeight;

        if (itemTop < suggestionsList.scrollTop) {
            suggestionsList.scrollTop = itemTop; // Scroll up to the item
        } else if (itemTop + itemHeight > suggestionsList.scrollTop + suggestionListHeight) {
            suggestionsList.scrollTop = itemTop + itemHeight - suggestionListHeight; // Scroll down to the item
        }
    }
}

// Function to highlight the currently selected suggestion
function highlightSuggestion(items) {
    items.forEach((item, index) => {
        item.classList.remove('highlighted');
        if (index === currentIndex) {
            item.classList.add('highlighted');
        }
    });
}

// Function to replace the token with the selected suggestion
function replaceToken(suggestion, token, cursor) {
    editor.replaceRange(suggestion + ' ', { line: cursor.line, ch: token.start }, { line: cursor.line, ch: token.end });
    suggestionsList.innerHTML = ''; // Clear suggestions
    suggestionsList.style.display = 'none'; // Hide suggestions
    currentIndex = -1; // Reset index after selection
}

// Hide suggestions on click outside
document.addEventListener('click', (e) => {
    if (!suggestionsList.contains(e.target)) {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none'; // Hide suggestions
        currentIndex = -1; // Reset index on hide
    }
});

// Function to get the current word at the cursor in the editor
function getCurrentWord(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    return token.string; // Return the current token string
}

// Function to show the modal
function showAddWordModal() {
    document.getElementById('addWordModal').style.display = 'flex';
}

// Function to close the modal
function closeAddWordModal() {
    document.getElementById('addWordModal').style.display = 'none';
}

// Function to add a word to both the words array and the Trie
function addWordToTrie(word) {
    trie.insert(word); // Add to Trie
}

// Function to add words to the trie and words array
function addWordsFromInput() {
    const input = document.getElementById('wordInput').value;
    const wordsToAdd = input.split(',').map(word => word.trim()).filter(word => word !== '');

    wordsToAdd.forEach(word => {
        addWordToTrie(word); // Assuming this function is defined to add words
    });

    // Clear the input
    document.getElementById('wordInput').value = '';
    closeAddWordModal(); // Close the modal
}

// Event listener for the "Add Words" button
document.getElementById('addWordsButton').addEventListener('click', addWordsFromInput);

// Event listener for the close button
document.getElementById('closeModal').addEventListener('click', closeAddWordModal);

// Optional: Event listener to show the modal
document.addEventListener('keydown', function (event) {
    if (event.key === '+') { // Press '+' to show the modal as an example
        showAddWordModal();
    }
});
document.getElementById('addWordsBtn').addEventListener('click', showAddWordModal);
