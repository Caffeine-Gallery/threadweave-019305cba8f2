import { backend } from "declarations/backend";

document.getElementById('newThreadForm').onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('threadTitle').value;
    const content = document.getElementById('threadContent').value;
    const author = document.getElementById('authorName').value.trim() || "Anonymous";

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';

    try {
        await backend.createThread(title, content, author);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error creating thread:', error);
        alert('Failed to create thread. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Create Thread';
    }
};
