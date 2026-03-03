<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card p-4">
        <h3 class="fw-bold mb-4"><i class="bi bi-pencil me-2 text-warning"></i>Edit Post</h3>

        <div v-if="fetchError" class="alert alert-danger">{{ fetchError }}</div>
        <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <form v-else @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3">
            <label class="form-label fw-semibold">Title</label>
            <input
              v-model="form.title"
              @blur="touched.title = true"
              type="text"
              class="form-control"
              :class="getFieldClass('title')"
            />
            <div class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Content</label>
            <textarea
              v-model="form.content"
              @blur="touched.content = true"
              class="form-control"
              :class="getFieldClass('content')"
              rows="12"
            ></textarea>
            <div class="invalid-feedback">{{ errors.content }}</div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-warning" :disabled="saving || !isFormValid">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Saving...' : 'Update Post' }}
            </button>
            <RouterLink :to="`/posts/${route.params.id}`" class="btn btn-outline-secondary">Cancel</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()
const form = reactive({ title: '', content: '' })
const touched = reactive({ title: false, content: false })
const loading = ref(true)
const saving = ref(false)
const serverError = ref('')
const fetchError = ref('')

const errors = computed(() => {
  const e = {}
  if (!form.title.trim()) e.title = 'Title is required'
  else if (form.title.length < 5) e.title = 'Must be at least 5 characters'
  else if (form.title.length > 150) e.title = 'Cannot exceed 150 characters'
  if (!form.content.trim()) e.content = 'Content is required'
  else if (form.content.length < 20) e.content = 'Must be at least 20 characters'
  return e
})
const isFormValid = computed(() => Object.keys(errors.value).length === 0)
const getFieldClass = (f) => {
  if (!touched[f]) return ''
  return errors.value[f] ? 'is-invalid' : 'is-valid'
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/posts/${route.params.id}`)
    form.title = data.post.title
    form.content = data.post.content
  } catch {
    fetchError.value = 'Failed to load post'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  Object.keys(touched).forEach(k => touched[k] = true)
  if (!isFormValid.value) return
  saving.value = true
  serverError.value = ''
  try {
    await api.put(`/posts/${route.params.id}`, form)
    router.push(`/posts/${route.params.id}`)
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Failed to update post'
  } finally {
    saving.value = false
  }
}
</script>
