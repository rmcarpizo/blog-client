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
            <i class="bi bi-chat-dots me-2"></i>Comments ({{ topLevelComments.length }})
          </h5>

          <!-- Add top-level comment -->
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
                @click="submitComment(null)"
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

          <!-- Empty state -->
          <div v-if="topLevelComments.length === 0" class="text-muted text-center py-3">
            No comments yet. Be the first!
          </div>

          <!-- Comments list -->
          <div
            v-for="comment in topLevelComments"
            :key="comment._id"
            class="mb-3"
          >
            <!-- Top-level comment -->
            <div class="border-bottom pb-2">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <strong class="me-2">
                    <i class="bi bi-person-circle me-1"></i>{{ comment.author?.username }}
                  </strong>
                  <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                  <p class="mb-2 mt-1">{{ comment.content }}</p>

                  <!-- Action buttons row -->
                  <div class="d-flex align-items-center gap-3">
                    <!-- Reply button -->
                    <button
                      v-if="isLoggedIn"
                      class="btn btn-link btn-sm p-0 text-primary"
                      style="font-size: 0.8rem;"
                      @click="toggleReply(comment._id)"
                    >
                      <i class="bi bi-reply me-1"></i>
                      {{ replyingTo === comment._id ? 'Cancel' : 'Reply' }}
                    </button>

                    <!-- Show/Hide replies button -->
                    <button
                      v-if="getReplies(comment._id).length > 0"
                      class="btn btn-link btn-sm p-0 text-muted"
                      style="font-size: 0.8rem;"
                      @click="toggleReplies(comment._id)"
                    >
                      <i :class="visibleReplies[comment._id] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" class="me-1"></i>
                      {{ visibleReplies[comment._id] ? 'Hide' : 'Show' }}
                      {{ getReplies(comment._id).length }}
                      {{ getReplies(comment._id).length === 1 ? 'reply' : 'replies' }}
                    </button>
                  </div>
                </div>

                <!-- Delete comment -->
                <button
                  v-if="isAdmin || comment.author?._id === currentUser?._id"
                  class="btn btn-sm btn-link text-danger p-0 ms-2"
                  @click="deleteComment(comment._id)"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- Reply input box -->
            <div
              v-if="replyingTo === comment._id"
              class="ms-4 mt-2 mb-2 p-3 rounded"
              style="background: #f8f9fa; border-left: 3px solid #0d6efd;"
            >
              <small class="text-muted d-block mb-2">
                <i class="bi bi-reply-fill text-primary me-1"></i>
                Replying to <strong>{{ comment.author?.username }}</strong>
              </small>
              <textarea
                v-model="replyText"
                class="form-control form-control-sm mb-2"
                rows="2"
                placeholder="Write a reply..."
                maxlength="500"
              ></textarea>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">{{ replyText.length }}/500</small>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" @click="cancelReply">
                    Cancel
                  </button>
                  <button
                    class="btn btn-sm btn-primary"
                    @click="submitComment(comment._id)"
                    :disabled="replyLoading || !replyText.trim()"
                  >
                    <span v-if="replyLoading" class="spinner-border spinner-border-sm me-1"></span>
                    Post Reply
                  </button>
                </div>
              </div>
            </div>

            <!-- Nested replies (shown/hidden by toggle) -->
            <div
              v-if="visibleReplies[comment._id] && getReplies(comment._id).length > 0"
              class="ms-4 mt-1"
              style="border-left: 2px solid #dee2e6; padding-left: 1rem;"
            >
              <div
                v-for="reply in getReplies(comment._id)"
                :key="reply._id"
                class="border-bottom pb-2 pt-2"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <strong class="me-2">
                      <i class="bi bi-person-circle me-1"></i>{{ reply.author?.username }}
                    </strong>
                    <span class="badge bg-primary bg-opacity-10 text-primary me-1" style="font-size: 0.65rem;">
                      <i class="bi bi-reply me-1"></i>reply
                    </span>
                    <small class="text-muted">{{ formatDate(reply.createdAt) }}</small>
                    <p class="mb-0 mt-1">{{ reply.content }}</p>
                  </div>
                  <button
                    v-if="isAdmin || reply.author?._id === currentUser?._id"
                    class="btn btn-sm btn-link text-danger p-0 ms-2"
                    @click="deleteComment(reply._id)"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
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
const replyText = ref('')
const replyingTo = ref(null)
const commentLoading = ref(false)
const replyLoading = ref(false)
const commentError = ref('')

// Tracks which comment's replies are visible
// e.g. { 'abc123': true, 'def456': false }
const visibleReplies = ref({})

// Toggle show/hide replies
const toggleReplies = (commentId) => {
  visibleReplies.value[commentId] = !visibleReplies.value[commentId]
}

// Separate top-level comments from replies
const topLevelComments = computed(() =>
  comments.value.filter(c => !c.parentComment)
)

// Fixed comparison - handles both string ID and populated object
const getReplies = (commentId) =>
  comments.value.filter(c =>
    c.parentComment === commentId ||
    c.parentComment?._id === commentId
  )

const isAuthor = computed(() => post.value?.author?._id === currentUser.value?._id)

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

// Toggle reply box open/close
const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    cancelReply()
  } else {
    replyingTo.value = commentId
    replyText.value = ''
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
}

// Submit comment OR reply
// parentCommentId = null → top-level comment
// parentCommentId = comment._id → reply
const submitComment = async (parentCommentId) => {
  const isReply = parentCommentId !== null
  const text = isReply ? replyText.value : newComment.value

  if (!text.trim()) return

  if (isReply) replyLoading.value = true
  else commentLoading.value = true
  commentError.value = ''

  try {
    const { data } = await api.post(`/comments/${route.params.id}`, {
      content: text,
      parentComment: parentCommentId,
    })
    comments.value.push(data.comment) // push = adds to bottom

    if (isReply) {
      replyText.value = ''
      replyingTo.value = null
      // Auto show replies after posting one
      visibleReplies.value[parentCommentId] = true
    } else {
      newComment.value = ''
    }
  } catch (err) {
    commentError.value = err.response?.data?.message || 'Failed to post comment'
  } finally {
    commentLoading.value = false
    replyLoading.value = false
  }
}

const deleteComment = async (id) => {
  if (!confirm('Delete this comment?')) return
  try {
    await api.delete(`/comments/${id}`)
    // Remove comment and its replies from the list
    comments.value = comments.value.filter(c =>
      c._id !== id &&
      c.parentComment !== id &&
      c.parentComment?._id !== id
    )
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

onMounted(async () => {
  await fetchPost()
  await fetchComments()
})
</script>