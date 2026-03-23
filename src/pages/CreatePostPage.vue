<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card p-4">
        <h3 class="fw-bold mb-5"><i class="bi bi-pencil-square me-2 text-primary"></i>Write a New Post</h3>

        <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3">
            <label class="form-label fw-semibold">Title</label>
            <input
              v-model="form.title"
              @blur="touched.title = true"
              type="text"
              class="form-control"
              :class="getFieldClass('title')"
              placeholder="Write a compelling title..."
            />
            <div class="invalid-feedback">{{ errors.title }}</div>
            <div class="d-flex justify-content-end mt-1">
              <small class="text-muted">{{ form.title.length }}/150</small>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Content</label>
            <textarea
              v-model="form.content"
              @blur="touched.content = true"
              class="form-control"
              :class="getFieldClass('content')"
              rows="12"
              placeholder="Share your story..."
            ></textarea>
            <div class="invalid-feedback">{{ errors.content }}</div>
            <div class="d-flex justify-content-between mt-1">
              <small class="text-muted">Min. 20 characters</small>
              <small class="text-muted">{{ form.content.length }} chars</small>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Publishing...' : 'Publish Post' }}
            </button>
            <RouterLink to="/" class="btn btn-outline-secondary">Cancel</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const form = reactive({ title: '', content: '' })
const touched = reactive({ title: false, content: false })
const loading = ref(false)
const serverError = ref('')

const errors = computed(() => {
  const e = {}
  if (!form.title.trim()) e.title = 'Title is required'
  else if (form.title.length < 5) e.title = 'Title must be at least 5 characters'
  else if (form.title.length > 150) e.title = 'Title cannot exceed 150 characters'
  if (!form.content.trim()) e.content = 'Content is required'
  else if (form.content.length < 20) e.content = 'Content must be at least 20 characters'
  return e
})

const isFormValid = computed(() => Object.keys(errors.value).length === 0)
const getFieldClass = (f) => {
  if (!touched[f]) return ''
  return errors.value[f] ? 'is-invalid' : 'is-valid'
}

const handleSubmit = async () => {
  Object.keys(touched).forEach(k => touched[k] = true)
  if (!isFormValid.value) return

  loading.value = true
  serverError.value = ''
  try {
    const { data } = await api.post('/posts', form)
    router.push(`/posts/${data.post._id}`)
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Failed to create post'
  } finally {
    loading.value = false
  }
}
</script>
