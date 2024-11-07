import { backend } from "declarations/backend";

let threads = [];

async function loadThreads() {
    try {
        document.getElementById('loading').style.display = 'block';
        threads = await backend.getAllThreads();
        displayThreads(threads);
    } catch (error) {
        console.error('Error loading threads:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function displayThreads(threads) {
    const threadsList = document.getElementById('threadsList');
    threadsList.innerHTML = ''; // Clear existing threads

    threads.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
          .forEach(thread => {
        const threadElement = createThreadElement(thread);
        threadsList.appendChild(threadElement);
    });
}

function updateCommentsSection(threadCard, comments) {
    const commentsList = threadCard.querySelector('.comments-list');
    commentsList.innerHTML = ''; // Clear existing comments
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment mb-2 p-2 border-start';
        commentElement.innerHTML = `
            <p class="mb-1">${comment.content}</p>
            <small class="text-muted">
                By ${comment.author} on ${new Date(Number(comment.timestamp) / 1000000).toLocaleString()}
            </small>
        `;
        commentsList.appendChild(commentElement);
    });
}

function createThreadElement(thread) {
    const template = document.getElementById('threadTemplate');
    const threadElement = template.content.cloneNode(true);
    const threadCard = threadElement.querySelector('.thread-card');

    threadCard.setAttribute('data-thread-id', thread.id.toString());
    threadCard.querySelector('.thread-title').textContent = thread.title;
    threadCard.querySelector('.thread-content').textContent = thread.content;
    threadCard.querySelector('.thread-author').textContent = thread.author;
    threadCard.querySelector('.thread-date').textContent = new Date(Number(thread.timestamp) / 1000000).toLocaleString();

    // Display comments
    updateCommentsSection(threadCard, thread.comments);

    // Handle new comment submission
    const commentForm = threadCard.querySelector('.new-comment-form');
    commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const content = commentForm.querySelector('.comment-content').value;
        const author = commentForm.querySelector('.comment-author').value.trim() || "Anonymous";
        
        const submitButton = commentForm.querySelector('button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';

        try {
            const success = await backend.addComment(thread.id, content, author);
            if (success) {
                // Create new comment object
                const newComment = {
                    content: content,
                    author: author,
                    timestamp: BigInt(Date.now() * 1000000)
                };
                
                // Update local thread data
                const threadIndex = threads.findIndex(t => t.id === thread.id);
                if (threadIndex !== -1) {
                    threads[threadIndex].comments.push(newComment);
                    // Update only this thread's comments section
                    const threadCard = document.querySelector(`[data-thread-id="${thread.id}"]`);
                    if (threadCard) {
                        updateCommentsSection(threadCard, threads[threadIndex].comments);
                    }
                }
                
                commentForm.reset();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Add Comment';
        }
    };

    return threadCard;
}

// Handle new thread submission
document.getElementById('newThreadForm').onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('threadTitle').value;
    const content = document.getElementById('threadContent').value;
    const author = document.getElementById('authorName').value.trim() || "Anonymous";

    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';

    try {
        const threadId = await backend.createThread(title, content, author);
        // Create a new thread object
        const newThread = {
            id: threadId,
            title: title,
            content: content,
            author: author,
            timestamp: BigInt(Date.now() * 1000000),
            comments: []
        };
        
        // Add to local array and refresh display
        threads.unshift(newThread);
        displayThreads(threads);
        e.target.reset();
    } catch (error) {
        console.error('Error creating thread:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Create Thread';
    }
};

// Initial load
window.addEventListener('load', loadThreads);
