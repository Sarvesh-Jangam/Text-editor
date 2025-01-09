// Recent Words Functionality
const recentWords = []; // Array to store recently copied words
const recentWordsList = document.getElementById('recentWords');

// Function to show recently copied words
function showRecentWords() {
    console.log("showing");
    recentWordsList.innerHTML = ''; // Clear previous list
    recentWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.addEventListener('click', () => {
            // Replace the current cursor position with the selected word
            const cursor = editor.getCursor();
            editor.replaceRange(word, cursor);
            recentWordsList.style.display = 'none'; // Hide the list after selection
        });
        recentWordsList.appendChild(li);
    });
    recentWordsList.style.display = recentWords.length > 0 ? 'block' : 'none'; // Show or hide the list
}

// Event listener for the Show Recent Copies button
document.getElementById('recentWordsBtn').addEventListener('click', showRecentWords);

// Copying text (simulated with a simple function)
editor.on('copy', function (cm) {
    const selectedText = cm.getSelection();
    if (selectedText && !recentWords.includes(selectedText)) {
        recentWords.push(selectedText);
        if (recentWords.length > 10) { // Limit to the last 10 copied words
            recentWords.shift(); // Remove the oldest entry
        }
    }
});

// Hide recent words list on clicking outside
document.addEventListener('click', (e) => {
    if (!recentWordsList.contains(e.target) && e.target.id !== 'recentWordsBtn') {
        recentWordsList.style.display = 'none';
    }
});
