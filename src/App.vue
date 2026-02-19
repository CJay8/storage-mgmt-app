<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">PopMart Reseller Pro</h1>
            <p class="text-sm opacity-90">Professional Inventory Management</p>
          </div>
          
          <!-- Mobile Menu Button -->
          <button @click="showMobileMenu = !showMobileMenu" class="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Desktop User Menu -->
          <div class="hidden md:flex items-center space-x-4">
            <span class="text-sm">{{ userEmail || 'Guest' }}</span>
            <button @click="syncData" class="bg-white text-primary px-3 py-1 rounded-lg text-sm font-semibold hover:bg-opacity-90">
              <span v-if="syncing">Syncing...</span>
              <span v-else>Sync</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Dropdown -->
    <div v-if="showMobileMenu" class="md:hidden bg-white border-b shadow-lg">
      <div class="px-4 py-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.name"
          @click="currentTab = tab.name; showMobileMenu = false"
          class="block w-full text-left px-4 py-3 rounded-lg mb-1"
          :class="currentTab === tab.name ? 'bg-primary text-white' : 'hover:bg-gray-100'"
        >
          <div class="flex items-center">
            <component :is="tab.icon" class="h-5 w-5 mr-3" />
            {{ tab.label }}
          </div>
        </button>
        
        <!-- Mobile User Info -->
        <div class="border-t mt-2 pt-2">
          <div class="px-4 py-2 text-sm text-gray-600">
            {{ userEmail || 'Not logged in' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:block bg-white shadow-sm sticky top-16 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex space-x-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.name"
            @click="currentTab = tab.name"
            class="flex items-center px-3 py-4 text-sm font-medium border-b-2 transition"
            :class="currentTab === tab.name 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <Dashboard v-if="currentTab === 'dashboard'" />
      <Inventory v-if="currentTab === 'inventory'" />
      <Categories v-if="currentTab === 'categories'" />
      <Sales v-if="currentTab === 'sales'" />
      <Predictions v-if="currentTab === 'predictions'" />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div class="grid grid-cols-5 gap-1 px-2 py-1">
        <button 
          v-for="tab in tabs" 
          :key="tab.name"
          @click="currentTab = tab.name"
          class="flex flex-col items-center py-2 px-1 rounded-lg transition-colors"
          :class="currentTab === tab.name ? 'text-primary' : 'text-gray-500 hover:text-gray-700'"
        >
          <component :is="tab.icon" class="h-5 w-5" />
          <span class="text-xs mt-1">{{ tab.shortLabel }}</span>
        </button>
      </div>
    </nav>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-700">{{ loadingMessage }}</span>
      </div>
    </div>

    <!-- Notification Toast -->
    <Transition name="slide-up">
      <div v-if="notification.show" 
           class="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border-l-4 z-50"
           :class="{
             'border-green-500': notification.type === 'success',
             'border-yellow-500': notification.type === 'warning',
             'border-red-500': notification.type === 'error',
             'border-blue-500': notification.type === 'info'
           }">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-gray-700">{{ notification.message }}</p>
            </div>
            <button @click="notification.show = false" class="ml-4 text-gray-400 hover:text-gray-500">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { 
  HomeIcon, 
  CubeIcon, 
  TagIcon,
  CurrencyDollarIcon,
  ChartBarIcon 
} from '@heroicons/vue/24/outline'

import Dashboard from './components/Dashboard.vue'
import Inventory from './components/Inventory.vue'
import Categories from './components/Categories.vue'
import Sales from './components/Sales.vue'
import Predictions from './components/Predictions.vue'

import { supabase } from './lib/supabase'

// State
const currentTab = ref('dashboard')
const showMobileMenu = ref(false)
const loading = ref(false)
const syncing = ref(false)
const loadingMessage = ref('Loading...')
const userEmail = ref('')

const notification = ref({
  show: false,
  message: '',
  type: 'info'
})

// Navigation tabs
const tabs = [
  { name: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: HomeIcon },
  { name: 'inventory', label: 'Inventory', shortLabel: 'Stock', icon: CubeIcon },
  { name: 'categories', label: 'Categories', shortLabel: 'Cats', icon: TagIcon },
  { name: 'sales', label: 'Sales', shortLabel: 'Sales', icon: CurrencyDollarIcon },
  { name: 'predictions', label: 'Predictions', shortLabel: 'AI', icon: ChartBarIcon }
]

// Methods
const showNotification = (message, type = 'info') => {
  notification.value = {
    show: true,
    message,
    type
  }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const syncData = async () => {
  syncing.value = true
  try {
    // Implement sync logic here
    await new Promise(resolve => setTimeout(resolve, 1500))
    showNotification('Data synced successfully!', 'success')
  } catch (error) {
    showNotification('Sync failed: ' + error.message, 'error')
  } finally {
    syncing.value = false
  }
}

// Check session on mount
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    userEmail.value = session.user.email
  }
})

// Expose notification to children
provide('showNotification', showNotification)
provide('setLoading', (message, isLoading) => {
  loading.value = isLoading
  if (message) loadingMessage.value = message
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>