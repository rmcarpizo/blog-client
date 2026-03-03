<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="post">
      <!-- Post content -->
      <div class="card mb-4">
        <div class="card-body p-4">
          <h1 class="fw-bold mb-2">{{ post.title }}</h1>
          <div class="d-flex align-items-center gap-3 text-muted mb-4">
            <span><i class="bi bi-person-circle me-1"></i>{{ post.author?.username }}</span>
            <span><i class="bi bi-calendar3 me-1"></i>{{ formatDate(post.createdAt) }}</span>
          </div>
          <hr />
          <p class="fs-5 lh-lg" style="white-space: pre-wrap;">{{ post.content }}</p>

          <!-- Author / Admin actions -->
          <div v-if="isAuthor || isAdmin" class="d-flex gap-2 mt-4">
            <RouterLink
              v-if="isAuthor"
              :to="`/posts/${post._id}/edit`"
              class="btn btn-sm btn-outline-secondary"
            >
              <i class="bi bi-pencil me-1"></i>Edit
            </RouterLink>
            <button class="btn btn-sm btn-outline-danger" @click="deletePost">
              <i class="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Comments section -->
      <div class="card">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-4">
            <i class="bi bi-chat-dots me-2"></i>Comments ({{ comments.length }})
          </h5>

          <!-- Add comment -->
          <div v-if="isLoggedIn" class="mb-4">
            <textarea
              v-model="newComment"
              class="form-control mb-2"
              rows="3"
              placeholder="Write a comment..."
              maxlength="500"
            ></textarea>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">{{ newComment.length }}/500</small>
              <button
                class="btn btn-primary btn-sm"
                @click="addComment"
                :disabled="commentLoading || !newComment.trim()"
              >
                <span v-if="commentLoading" class="spinner-border spinner-border-sm me-1"></span>
                Post Comment
              </button>
            </div>
            <div v-if="commentError" class="text-danger small mt-1">{{ commentError }}</div>
          </div>
          <div v-else class="alert alert-light text-center mb-4">
            <RouterLink to="/login">Login</RouterLink> to leave a comment
          </div>

          <!-- Comments list -->
          <div v-if="comments.length === 0" class="text-muted text-center py-3">
            No comments yet. Be the first!
          </div>
          <div v-for="comment in comments" :key="comment._id" class="border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <strong class="me-2"><i class="bi bi-person-circle me-1"></i>{{ comment.author?.username }}</strong>
                <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                <p class="mb-0 mt-1">{{ comment.content }}</p>
              </div>
              <button
                v-if="isAdmin || comment.author?._id === currentUser?._id"
                class="btn btn-sm btn-link text-danger p-0 ms-2"
                @click="deleteComment(comment._id)"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger">Post not found.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import api from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, isAdmin, currentUser } = storeToRefs(useAuthStore())

const post = ref(null)
const comments = ref([])
const loading = ref(true)
const newComment = ref('')
const commentLoading = ref(false)
const commentError = ref('')

const isAuthor = computed(() => post.value?.author?._id === currentUser.value?._id)

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

const fetchPost = async () => {
  try {
    const { data } = await api.get(`/posts/${route.params.id}`)
    post.value = data.post
  } catch {
    post.value = null
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const { data } = await api.get(`/comments/post/${route.params.id}`)
    comments.value = data.comments
  } catch {}
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  commentLoading.value = true
  commentError.value = ''
  try {
    const { data } = await api.post(`/comments/${route.params.id}`, { content: newComment.value })
    comments.value.unshift(data.comment)
    newComment.value = ''
  } catch (err) {
    commentError.value = err.response?.data?.message || 'Failed to post comment'
  } finally {
    commentLoading.value = false
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

const deletePost = async () => {
  if (!confirm('Are you sure you want to delete this post?')) return
  try {
    await api.delete(`/posts/${post.value._id}`)
    router.push('/')
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete post')
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchComments()
})
</script>
