<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from './services/api'

const view = ref('login')
const user = ref(null)
const accessToken = ref('')
const users = ref([])
const isLoading = ref(false)
const isRestoringSession = ref(true)
const message = ref('')
const error = ref('')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({
  fullName: '',
  email: '',
  username: '',
  phone: '',
  password: '',
})

const initials = computed(() => {
  if (!user.value?.fullName) return 'SY'
  return user.value.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()
})

function clearFeedback() {
  message.value = ''
  error.value = ''
}

function showView(nextView) {
  clearFeedback()
  view.value = nextView
}

async function setSession(session) {
  user.value = session.user
  accessToken.value = session.accessToken
  view.value = 'dashboard'
  await loadUsers()
}

async function restoreSession() {
  try {
    const session = await api.refresh()
    const profile = await api.me(session.accessToken)
    await setSession({ user: profile, accessToken: session.accessToken })
  } catch {
    user.value = null
    accessToken.value = ''
  } finally {
    isRestoringSession.value = false
  }
}

async function submitLogin() {
  clearFeedback()
  isLoading.value = true
  try {
    const session = await api.login(loginForm)
    await setSession(session)
    message.value = 'Login berhasil. Selamat datang kembali.'
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    isLoading.value = false
  }
}

async function submitRegister() {
  clearFeedback()
  isLoading.value = true
  try {
    const createdUser = await api.register(registerForm)
    loginForm.email = createdUser.email
    loginForm.password = registerForm.password
    message.value = 'Akun berhasil dibuat. Silakan masuk untuk melanjutkan.'
    view.value = 'login'
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    isLoading.value = false
  }
}

async function loadUsers() {
  users.value = []
  if (!accessToken.value) return

  try {
    users.value = await api.users(accessToken.value)
  } catch (requestError) {
    if (requestError.status !== 403) {
      console.warn('Unable to load users.', requestError)
    }
  }
}

async function logout() {
  clearFeedback()
  try {
    await api.logout()
  } finally {
    user.value = null
    accessToken.value = ''
    users.value = []
    loginForm.password = ''
    view.value = 'login'
    message.value = 'Anda sudah keluar dari sesi.'
  }
}

onMounted(restoreSession)
</script>

<template>
  <main class="app-shell">
    <section class="brand-panel">
      <a class="brand" href="/" aria-label="SYCI Auth home">
        <span class="brand-mark">S</span>
        <span>SYCI Auth</span>
      </a>

      <div class="brand-copy">
        <p class="eyebrow">Identity management</p>
        <h1>Satu akses aman untuk setiap produk SYCI.</h1>
        <p class="muted">
          Kelola sesi, peran, dan hak akses dengan autentikasi yang sederhana.
        </p>
      </div>

      <div class="security-note">
        <span class="shield" aria-hidden="true">✓</span>
        <div>
          <strong>Sesi terlindungi</strong>
          <p>Refresh token tersimpan aman dalam cookie HttpOnly.</p>
        </div>
      </div>
    </section>

    <section class="content-panel">
      <div v-if="isRestoringSession" class="loading-state" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        Memulihkan sesi Anda…
      </div>

      <template v-else>
        <section v-if="view === 'dashboard' && user" class="dashboard">
          <header class="dashboard-header">
            <div>
              <p class="eyebrow">Account overview</p>
              <h2>Selamat datang, {{ user.fullName }}</h2>
            </div>
            <button class="button button-secondary" type="button" @click="logout">
              Keluar
            </button>
          </header>

          <p v-if="message" class="notice success" role="status">{{ message }}</p>
          <p v-if="error" class="notice error" role="alert">{{ error }}</p>

          <div class="profile-card">
            <div class="avatar" aria-hidden="true">{{ initials }}</div>
            <div class="profile-details">
              <h3>{{ user.fullName }}</h3>
              <p>{{ user.email }}</p>
              <div class="badges">
                <span class="badge">{{ user.username ? `@${user.username}` : 'No username' }}</span>
                <span class="badge" :class="{ verified: user.emailVerified }">
                  {{ user.emailVerified ? 'Email verified' : 'Email belum diverifikasi' }}
                </span>
              </div>
            </div>
          </div>

          <section v-if="users.length" class="user-list">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Admin area</p>
                <h3>Pengguna terdaftar</h3>
              </div>
              <span class="count">{{ users.length }}</span>
            </div>
            <ul>
              <li v-for="registeredUser in users" :key="registeredUser.id">
                <span class="mini-avatar">{{ registeredUser.fullName.slice(0, 1) }}</span>
                <span>
                  <strong>{{ registeredUser.fullName }}</strong>
                  <small>{{ registeredUser.email }}</small>
                </span>
              </li>
            </ul>
          </section>
        </section>

        <section v-else class="auth-card">
          <header>
            <p class="eyebrow">{{ view === 'login' ? 'Welcome back' : 'Create an account' }}</p>
            <h2>{{ view === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru' }}</h2>
            <p class="muted">
              {{ view === 'login' ? 'Gunakan email dan password Anda untuk melanjutkan.' : 'Data ini digunakan untuk membuat identitas akun Anda.' }}
            </p>
          </header>

          <p v-if="message" class="notice success" role="status">{{ message }}</p>
          <p v-if="error" class="notice error" role="alert">{{ error }}</p>

          <form v-if="view === 'login'" class="auth-form" @submit.prevent="submitLogin">
            <label>
              <span>Email</span>
              <input v-model.trim="loginForm.email" type="email" autocomplete="email" required placeholder="nama@contoh.com" />
            </label>
            <label>
              <span>Password</span>
              <input v-model="loginForm.password" type="password" autocomplete="current-password" required placeholder="Minimal 8 karakter" />
            </label>
            <button class="button button-primary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Memproses…' : 'Masuk' }}
            </button>
          </form>

          <form v-else class="auth-form" @submit.prevent="submitRegister">
            <label>
              <span>Nama lengkap</span>
              <input v-model.trim="registerForm.fullName" type="text" autocomplete="name" required minlength="3" maxlength="150" placeholder="Nama Anda" />
            </label>
            <div class="form-grid">
              <label>
                <span>Email</span>
                <input v-model.trim="registerForm.email" type="email" autocomplete="email" required placeholder="nama@contoh.com" />
              </label>
              <label>
                <span>Username</span>
                <input v-model.trim="registerForm.username" type="text" autocomplete="username" minlength="3" maxlength="50" placeholder="username" />
              </label>
            </div>
            <label>
              <span>Nomor telepon <em>(opsional)</em></span>
              <input v-model.trim="registerForm.phone" type="tel" autocomplete="tel" maxlength="20" placeholder="08xxxxxxxxxx" />
            </label>
            <label>
              <span>Password</span>
              <input v-model="registerForm.password" type="password" autocomplete="new-password" required minlength="8" maxlength="100" placeholder="Minimal 8 karakter" />
            </label>
            <button class="button button-primary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Membuat akun…' : 'Buat akun' }}
            </button>
          </form>

          <p class="switch-view">
            {{ view === 'login' ? 'Belum memiliki akun?' : 'Sudah memiliki akun?' }}
            <button type="button" @click="showView(view === 'login' ? 'register' : 'login')">
              {{ view === 'login' ? 'Daftar sekarang' : 'Masuk' }}
            </button>
          </p>
        </section>
      </template>
    </section>
  </main>
</template>
