<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-journal-richtext me-2"></i>BlogApp
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto align-items-center gap-2">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>

          <template v-if="isLoggedIn">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/posts/create">
                <i class="bi bi-plus-circle me-1"></i>New Post
              </RouterLink>
            </li>
            <li v-if="isAdmin" class="nav-item">
              <RouterLink class="nav-link text-warning" to="/admin">
                <i class="bi bi-shield-check me-1"></i>Admin
              </RouterLink>
            </li>
            <li class="nav-item">
              <span class="nav-link text-secondary">
                <i class="bi bi-person-circle me-1"></i>{{ currentUser?.username }}
              </span>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm" @click="handleLogout">
                <i class="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/login">Login</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="btn btn-primary btn-sm" to="/register">Register</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const router = useRouter()
const { isLoggedIn, isAdmin, currentUser } = storeToRefs(authStore)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
