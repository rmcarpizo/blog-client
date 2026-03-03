<template>
  <div>
    <!-- Hero -->
    <div class="py-5 text-center bg-dark text-white rounded-3 mb-4 px-4">
      <h1 class="fw-bold"><i class="bi bi-journal-richtext me-2"></i>BlogApp</h1>
      <p class="lead text-secondary mb-3">Discover stories from our community</p>
      <RouterLink v-if="isLoggedIn" to="/posts/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Write a Post
      </RouterLink>
      <RouterLink v-else to="/register" class="btn btn-primary">
        Join the Community
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Loading posts...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="posts.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-journal-x display-4"></i>
      <p class="mt-2">No posts yet. Be the first to write one!</p>
    </div>

    <!-- Posts grid -->
    <div v-else class="row g-4">
      <div v-for="post in posts" :key="post._id" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title fw-bold">{{ post.title }}</h5>
            <p class="card-text text-muted flex-grow-1">
              {{ post.content.substring(0, 120) }}{{ post.content.length > 120 ? '...' : '' }}
            </p>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="bi bi-person-circle me-1"></i>{{ post.author?.username }}
              <span class="ms-2">
                <i class="bi bi-calendar3 me-1"></i>{{ formatDate(post.createdAt) }}
              </span>
            </small>
            <RouterLink :to="`/posts/${post._id}`" class="btn btn-sm btn-outline-primary">
              Read <i class="bi bi-arrow-right ms-1"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import api from '../api'
import { useAuthStore } from '../stores/auth'

const { isLoggedIn } = storeToRefs(useAuthStore())
const posts = ref([])
const loading = ref(true)
const error = ref('')

const fetchPosts = async () => {
  try {
    const { data } = await api.get('/posts')
    posts.value = data.posts
  } catch {
    error.value = 'Failed to load posts. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

onMounted(fetchPosts)
</script>
