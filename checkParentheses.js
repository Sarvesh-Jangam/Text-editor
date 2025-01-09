
// Check Parentheses Functionality
function checkParentheses() {
    const textContent = editor.getValue().split('\n'); // Split content into lines
    const stack = [];
    const parenthesesMap = {
        '(': ')',
        '{': '}',
        '[': ']'
    };

    let unmatchedLines = new Set(); // Set to track lines with unmatched parentheses

    for (let lineIndex = 0; lineIndex < textContent.length; lineIndex++) {
        const line = textContent[lineIndex];

        for (let charIndex = 0; charIndex < line.length; charIndex++) {
            const char = line[charIndex];
            if (parenthesesMap[char]) {
                stack.push({ char, lineIndex }); // Push opening parentheses with their line index
            } else if (Object.values(parenthesesMap).includes(char)) {
                if (stack.length === 0 || parenthesesMap[stack.pop().char] !== char) {
                    alert(`Unmatched closing parentheses found at line ${lineIndex + 1}, character ${charIndex + 1}: "${char}"`);
                    unmatchedLines.add(lineIndex); // Add line with unmatched closing parenthesis
                }
            }
        }
    }

    // Check for unmatched opening parentheses
    if (stack.length > 0) {
        const unmatchedIndices = stack.map(item => item.lineIndex);
        alert(`Unmatched opening parentheses found at lines: ${unmatchedIndices.map(i => i + 1).join(', ')}`);
        unmatchedIndices.forEach(index => unmatchedLines.add(index)); // Track unmatched opening lines
    }

    // Highlight unmatched lines in the editor
    unmatchedLines.forEach(index => {
        editor.markText({ line: index, ch: 0 }, { line: index, ch: textContent[index].length }, { className: "unmatched-line" });
    });

    if (unmatchedLines.size === 0) {
        alert("All parentheses are balanced.");
    }
}

// Event listener for checking parentheses
document.getElementById('checkParenthesesBtn').addEventListener('click', checkParentheses);
