class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    // Insert
    enqueue(element) {
        this.elements.push(element);
        this.heapifyUp(this.elements.length - 1); // Restore heap
    }

    // Remove
    dequeue() {
        if (this.isEmpty()) return null;
        const max = this.elements[0];
        const end = this.elements.pop(); // Remove the last element
        if (!this.isEmpty()) {
            this.elements[0] = end; // Move the last element to the root
            this.heapifyDown(0); // Restore heap property
        }
        return max;
    }

    // Get the highest priority element without removing it
    peek() {
        return this.isEmpty() ? null : this.elements[0];
    }

    // Check if the queue is empty
    isEmpty() {
        return this.elements.length === 0;
    }

    // Restore the max-heap property by heapifying up
    heapifyUp(index) {
        const element = this.elements[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.elements[parentIndex];
            if (element.frequency <= parent.frequency) break;
            this.elements[parentIndex] = element;
            this.elements[index] = parent;
            index = parentIndex;
        }
    }

    // Restore the max-heap by heapifying down
    heapifyDown(index) {
        const length = this.elements.length;
        const element = this.elements[index];
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let largestIndex = index;
            if (leftChildIndex < length && this.elements[leftChildIndex].frequency > this.elements[largestIndex].frequency) {
                largestIndex = leftChildIndex;
            }
            if (rightChildIndex < length && this.elements[rightChildIndex].frequency > this.elements[largestIndex].frequency) {
                largestIndex = rightChildIndex;
            }
            if (largestIndex === index) break;
            this.elements[index] = this.elements[largestIndex];
            this.elements[largestIndex] = element;
            index = largestIndex;
        }
    }
}
