// Bookmark Functionality
const bookmarks = {}; // Hashmap to store bookmarks

// Function to add a bookmark
function addBookmark() {
    const cursor = editor.getCursor();
    const lineNumber = cursor.line + 1; // Line numbers start from 1
    const bookmarkName = prompt("Enter a name for this bookmark:");

    if (bookmarkName) {
        bookmarks[lineNumber] = bookmarkName; // Store bookmark
        alert(`Bookmark added at line ${lineNumber}: "${bookmarkName}"`);
    }
}

// Function to show bookmarks
function showBookmarks() {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';

    for (const line in bookmarks) {
        const li = document.createElement('li');
        li.textContent = `${line}: ${bookmarks[line]}`;
        li.addEventListener('click', () => {
            editor.setCursor({ line: line - 1, ch: 0 }); // Navigate to bookmark
            editor.focus();
            bookmarkList.style.display = 'none'; // Hide the bookmark list after navigation
        });
        bookmarkList.appendChild(li);
    }

    bookmarkList.style.display = Object.keys(bookmarks).length > 0 ? 'block' : 'none';
}

// Event listeners
document.getElementById('bookmarkBtn').addEventListener('click', addBookmark);
document.getElementById('navigateBtn').addEventListener('click', showBookmarks);

// Hide bookmark list on clicking outside
document.addEventListener('click', (e) => {
    const bookmarkList = document.getElementById('bookmarkList');
    if (!bookmarkList.contains(e.target) && e.target.id !== 'navigateBtn') {
        bookmarkList.style.display = 'none';
    }
});