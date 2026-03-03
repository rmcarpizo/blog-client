<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-5">
      <div class="card p-4">
        <h3 class="text-center mb-4 fw-bold">
          <i class="bi bi-person-plus me-2 text-primary"></i>Create Account
        </h3>

        <div v-if="serverError" class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ serverError }}
        </div>

        <form @submit.prevent="handleRegister" novalidate>
          <!-- Username -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Username</label>
            <input
              v-model="form.username"
              @blur="touched.username = true"
              type="text"
              class="form-control"
              :class="getFieldClass('username')"
              placeholder="e.g. john_doe"
            />
            <div class="invalid-feedback">{{ errors.username }}</div>
            <div class="valid-feedback">Looks good!</div>
          </div>

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
            <div class="valid-feedback">Looks good!</div>
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Password</label>
            <div class="input-group">
              <input
                v-model="form.password"
                @blur="touched.password = true"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="getFieldClass('password')"
                placeholder="Min 6 chars, at least 1 number"
              />
              <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback d-block" v-if="touched.password && errors.password">
              {{ errors.password }}
            </div>
            <!-- Password strength bar -->
            <div class="mt-2" v-if="form.password">
              <div class="progress" style="height: 5px;">
                <div class="progress-bar" :class="strengthColor" :style="{ width: strengthWidth }"></div>
              </div>
              <small :class="'text-' + strengthTextColor">{{ strengthLabel }}</small>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="mb-4">
            <label class="form-label fw-semibold">Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              @blur="touched.confirmPassword = true"
              type="password"
              class="form-control"
              :class="getFieldClass('confirmPassword')"
              placeholder="Re-enter your password"
            />
            <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
            <div class="valid-feedback">Passwords match!</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="text-center mt-3 mb-0">
          Already have an account?
          <RouterLink to="/login" class="text-primary fw-semibold">Login here</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const touched = reactive({ username: false, email: false, password: false, confirmPassword: false })
const showPassword = ref(false)
const serverError = ref('')
const loading = ref(false)

const errors = computed(() => {
  const e = {}
  if (!form.username.trim()) e.username = 'Username is required'
  else if (form.username.length < 3) e.username = 'Username must be at least 3 characters'
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers, and underscores allowed'

  if (!form.email.trim()) e.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'

  if (!form.password) e.password = 'Password is required'
  else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
  else if (!/\d/.test(form.password)) e.password = 'Password must contain at least one number'

  if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
  else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'

  return e
})

const isFormValid = computed(() => Object.keys(errors.value).length === 0)

const getFieldClass = (field) => {
  if (!touched[field]) return ''
  return errors.value[field] ? 'is-invalid' : 'is-valid'
}

// Password strength
const strengthLevel = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++
  return score
})
const strengthColor = computed(() => ['bg-danger','bg-danger','bg-warning','bg-info','bg-success','bg-success'][strengthLevel.value])
const strengthTextColor = computed(() => ['danger','danger','warning','info','success','success'][strengthLevel.value])
const strengthLabel = computed(() => ['','Weak','Weak','Fair','Good','Strong'][strengthLevel.value])
const strengthWidth = computed(() => `${(strengthLevel.value / 5) * 100}%`)

const handleRegister = async () => {
  Object.keys(touched).forEach(k => touched[k] = true)
  if (!isFormValid.value) return

  loading.value = true
  serverError.value = ''

  const result = await authStore.register({
    username: form.username,
    email: form.email,
    password: form.password,
  })

  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    serverError.value = result.error
  }
}
</script>
