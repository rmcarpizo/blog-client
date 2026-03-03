<template>
  <div>
    <div class="d-flex align-items-center gap-3 mb-4">
      <h2 class="fw-bold mb-0"><i class="bi bi-shield-check me-2 text-warning"></i>Admin Dashboard</h2>
      <span class="badge bg-warning text-dark">Admin</span>
    </div>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card text-center p-3">
          <h3 class="fw-bold text-primary">{{ posts.length }}</h3>
          <p class="mb-0 text-muted"><i class="bi bi-journals me-1"></i>Total Posts</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center p-3">
          <h3 class="fw-bold text-success">{{ comments.length }}</h3>
          <p class="mb-0 text-muted"><i class="bi bi-chat-dots me-1"></i>Total Comments</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center p-3">
          <h3 class="fw-bold text-info">{{ uniqueAuthors }}</h3>
          <p class="mb-0 text-muted"><i class="bi bi-people me-1"></i>Active Authors</p>
        </div>
      </div>
    </div>

    <!-- All Posts table -->
    <div class="card mb-4">
      <div class="card-header bg-dark text-white fw-bold">
        <i class="bi bi-journals me-2"></i>Manage All Posts
      </div>
      <div class="card-body">
        <div v-if="loadingPosts" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>
        <div v-else-if="posts.length === 0" class="text-muted text-center py-3">No posts yet.</div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in posts" :key="post._id">
                <td>
                  <RouterLink :to="`/posts/${post._id}`" class="text-decoration-none">
                    {{ post.title }}
                  </RouterLink>
                </td>
                <td><span class="badge bg-secondary">{{ post.author?.username }}</span></td>
                <td class="text-muted small">{{ formatDate(post.createdAt) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="deletePost(post._id)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- All Comments -->
    <div class="card">
      <div class="card-header bg-dark text-white fw-bold">
        <i class="bi bi-chat-dots me-2"></i>Manage All Comments
      </div>
      <div class="card-body">
        <div v-if="loadingComments" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>
        <div v-else-if="comments.length === 0" class="text-muted text-center py-3">No comments yet.</div>
        <div v-else>
          <div
            v-for="comment in comments"
            :key="comment._id"
            class="d-flex justify-content-between align-items-start border-bottom py-2"
          >
            <div>
              <strong>{{ comment.author?.username }}</strong>
              <small class="text-muted ms-2">{{ formatDate(comment.createdAt) }}</small>
              <p class="mb-0 text-muted">{{ comment.content }}</p>
            </div>
            <button class="btn btn-sm btn-outline-danger ms-3" @click="deleteComment(comment._id)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const posts = ref([])
const comments = ref([])
const loadingPosts = ref(true)
const loadingComments = ref(true)

const uniqueAuthors = computed(() => new Set(posts.value.map(p => p.author?._id)).size)
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const fetchPosts = async () => {
  try {
    const { data } = await api.get('/posts')
    posts.value = data.posts
  } finally {
    loadingPosts.value = false
  }
}

const fetchAllComments = async () => {
  try {
    const allComments = []
    for (const post of posts.value) {
      const { data } = await api.get(`/comments/post/${post._id}`)
      allComments.push(...data.comments)
    }
    comments.value = allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } finally {
    loadingComments.value = false
  }
}

const deletePost = async (id) => {
  if (!confirm('Delete this post and all its comments?')) return
  try {
    await api.delete(`/posts/${id}`)
    posts.value = posts.value.filter(p => p._id !== id)
    comments.value = comments.value.filter(c => c.post !== id)
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete post')
  }
}

const deleteComment = async (id) => {
  if (!confirm('Delete this comment?')) return
  try {
    await api.delete(`/comments/${id}`)
    comments.value = comments.value.filter(c => c._id !== id)
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete comment')
  }
}

onMounted(async () => {
  await fetchPosts()
  await fetchAllComments()
})
</script>
