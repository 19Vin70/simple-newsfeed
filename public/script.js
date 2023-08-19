document.addEventListener('DOMContentLoaded', () => {
  const postButton = document.getElementById('post-button');
  const newsfeed = document.getElementById('newsfeed');

  let userName = localStorage.getItem('userName');
  if (!userName) {
    userName = prompt('Please enter your name:');
    if (!userName) {
      return;
    }
    localStorage.setItem('userName', userName);
  }

  postButton.addEventListener('click', async () => {
    const postContent = document.getElementById('post-content').value;
    const imageUpload = document.getElementById('image-upload').files[0];

    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('image', imageUpload);
    formData.append('userName', userName);

    await fetch('/post', {
      method: 'POST',
      body: formData,
    });

    document.getElementById('post-content').value = '';
    document.getElementById('image-upload').value = '';

    fetchPosts();
  });

  async function fetchPosts() {
    newsfeed.innerHTML = '';

    try {
      const response = await fetch('/posts');
      const posts = await response.json();


      posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const nameElement = document.createElement('h2');
        nameElement.textContent = post.userName;
        postElement.appendChild(nameElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = post.content;
        postElement.appendChild(contentElement);

        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async () => {
          const confirmation = confirm('Are you sure you want to delete this post?');
          if (confirmation) {
            await deletePost(index);
          }
        });
        postElement.appendChild(deleteButton);

        post.comments.forEach((comment) => {
          const commentElement = document.createElement('p');
          commentElement.textContent = comment;
          commentsContainer.appendChild(commentElement);
        });

        if (post.imageUrl) {
          const imageElement = document.createElement('img');
          imageElement.src = `/uploads/${post.imageUrl}`;
          postElement.appendChild(imageElement);
        }

        postElement.appendChild(commentsContainer);

        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.style.width = '95%';
        commentInput.className = 'comment-input';
        commentInput.placeholder = 'Add a comment';
        postElement.appendChild(commentInput);

        const commentButton = document.createElement('button');
        commentButton.textContent = 'Comment';
        commentButton.addEventListener('click', async () => {
          const comment = commentInput.value;
          if (comment) {
            const postId = index;
            await fetch(`/comment/${postId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ comment }),
            });
            fetchPosts();
          }
        });
        postElement.appendChild(commentButton);

        const reactionButton = document.createElement('button');
        reactionButton.textContent = '❤️ ' + post.reactions.heart;
        reactionButton.addEventListener('click', async () => {
          const postId = index;
          await fetch(`/react/${postId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reactionType: 'heart' }),
          });
          fetchPosts();
        });
        postElement.appendChild(reactionButton);

        newsfeed.appendChild(postElement);
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  async function deletePost(postIndex) {
    try {
      await fetch(`/delete/${postIndex}`, {
        method: 'DELETE',
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }

  deleteButton.addEventListener('click', async () => {
    const confirmation = confirm('Are you sure you want to delete this post?');
    if (confirmation) {
      await deletePost(index);
    }
  });



  fetchPosts();
});
