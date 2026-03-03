<template>
  <div>
    <NavBar />
    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
body {
  background-color: #f8f9fa;
}
.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
</style>
