<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-5">
      <div class="card p-4">
        <h3 class="text-center mb-4 fw-bold">
          <i class="bi bi-box-arrow-in-right me-2 text-primary"></i>Welcome Back
        </h3>

        <div v-if="serverError" class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ serverError }}
        </div>

        <div v-if="redirectMessage" class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>{{ redirectMessage }}
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <!-- Email -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Email</label>
            <input
              v-model="form.email"
              @blur="touched.email = true"
              type="email"
              class="form-control"
              :class="getFieldClass('email')"
              placeholder="you@example.com"
            />
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label class="form-label fw-semibold">Password</label>
            <div class="input-group">
              <input
                v-model="form.password"
                @blur="touched.password = true"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="getFieldClass('password')"
                placeholder="Enter your password"
              />
              <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback d-block" v-if="touched.password && errors.password">
              {{ errors.password }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="text-center mt-3 mb-0">
          Don't have an account?
          <RouterLink to="/register" class="text-primary fw-semibold">Register here</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const showPassword = ref(false)
const serverError = ref('')
const loading = ref(false)

const redirectMessage = computed(() =>
  route.query.redirect ? 'Please login to access that page.' : ''
)

const errors = computed(() => {
  const e = {}
  if (!form.email.trim()) e.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
  if (!form.password) e.password = 'Password is required'
  return e
})

const getFieldClass = (field) => {
  if (!touched[field]) return ''
  return errors.value[field] ? 'is-invalid' : 'is-valid'
}

const handleLogin = async () => {
  Object.keys(touched).forEach(k => touched[k] = true)
  if (Object.keys(errors.value).length > 0) return

  loading.value = true
  serverError.value = ''

  const result = await authStore.login(form)
  loading.value = false

  if (result.success) {
    router.push(route.query.redirect || '/')
  } else {
    serverError.value = result.error
  }
}
</script>
