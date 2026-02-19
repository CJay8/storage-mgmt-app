<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Categories</h2>
        <p class="text-gray-600">Manage series, characters, and rarity types</p>
      </div>
      
      <button @click="showAddModal = true" class="btn-primary flex items-center whitespace-nowrap">
        <PlusIcon class="h-5 w-5 mr-2" />
        Add Category
      </button>
    </div>

    <!-- Category Type Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8 overflow-x-auto">
        <button 
          v-for="type in categoryTypes" 
          :key="type.value"
          @click="selectedType = type.value"
          class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition"
          :class="selectedType === type.value 
            ? 'border-primary text-primary' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          <component :is="type.icon" class="h-5 w-5 inline-block mr-2" />
          {{ type.label }}
        </button>
      </nav>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="category in filteredCategories" :key="category.id" 
           class="card hover:shadow-lg transition group relative overflow-hidden">
        
        <!-- Category Image -->
        <div class="relative h-32 bg-gradient-to-br from-primary/10 to-pink-100 rounded-lg mb-3 overflow-hidden">
          <img 
            v-if="category.image_url"
            :src="category.image_url" 
            :alt="category.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <component :is="getTypeIcon(category.type)" class="h-12 w-12 text-primary/30" />
          </div>
          
          <!-- Type Badge -->
          <span class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-white shadow-sm">
            {{ category.type }}
          </span>
        </div>

        <!-- Category Info -->
        <div>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">{{ category.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ category.description || 'No description' }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div class="bg-gray-50 p-2 rounded">
              <span class="text-gray-500">Products</span>
              <p class="font-semibold">{{ getProductCount(category.id) }}</p>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <span class="text-gray-500">Value</span>
              <p class="font-semibold">{{ formatCurrency(getCategoryValue(category.id)) }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex space-x-1">
            <button @click="editCategory(category)" 
                    class="p-1.5 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800">
              <PencilIcon class="h-4 w-4" />
            </button>
            <button @click="deleteCategory(category.id)" 
                    class="p-1.5 bg-white rounded-full shadow-md text-red-600 hover:text-red-800">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCategories.length === 0" class="card text-center py-12">
      <TagIcon class="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
      <p class="text-gray-500 mb-4">Get started by creating your first category</p>
      <button @click="showAddModal = true" class="btn-primary inline-flex items-center">
        <PlusIcon class="h-5 w-5 mr-2" />
        Add Category
      </button>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ editingCategory ? 'Edit' : 'Add' }} Category</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="saveCategory" class="space-y-4">
            <!-- Category Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.name" 
                type="text" 
                required 
                class="input-field"
                placeholder="e.g., Molly, Dimoo, Skullpanda"
              >
            </div>

            <!-- Category Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Type <span class="text-red-500">*</span>
              </label>
              <select v-model="form.type" required class="input-field">
                <option value="">Select type</option>
                <option value="Series">Series</option>
                <option value="Character">Character</option>
                <option value="Rarity">Rarity</option>
                <option value="Collection">Collection</option>
                <option value="Theme">Theme</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                class="input-field"
                placeholder="Brief description of this category..."
              ></textarea>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input 
                v-model="form.image_url" 
                type="url" 
                class="input-field"
                placeholder="https://example.com/image.jpg"
              >
              <p class="text-xs text-gray-500 mt-1">Optional: Add a representative image</p>
            </div>

            <!-- Color (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
              <input 
                v-model="form.color" 
                type="color" 
                class="w-full h-10 rounded-lg border border-gray-300"
              >
            </div>

            <!-- Form Actions -->
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">
                {{ editingCategory ? 'Update' : 'Create' }} Category
              </button>
              <button type="button" @click="closeModal" 
                      class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Category Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ selectedCategory?.name }}</h3>
            <button @click="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Category Details -->
          <div class="space-y-4">
            <!-- Image -->
            <div class="h-48 bg-gradient-to-r from-primary/20 to-pink-100 rounded-lg flex items-center justify-center">
              <img 
                v-if="selectedCategory?.image_url"
                :src="selectedCategory.image_url" 
                :alt="selectedCategory.name"
                class="w-full h-full object-contain"
              >
              <component v-else :is="getTypeIcon(selectedCategory?.type)" class="h-20 w-20 text-primary/40" />
            </div>

            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-500">Type</p>
                <p class="font-semibold">{{ selectedCategory?.type }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-500">Total Products</p>
                <p class="font-semibold">{{ getProductCount(selectedCategory?.id) }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-500">Total Value</p>
                <p class="font-semibold">{{ formatCurrency(getCategoryValue(selectedCategory?.id)) }}</p>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-500">Created</p>
                <p class="font-semibold">{{ formatDate(selectedCategory?.created_at) }}</p>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedCategory?.description" class="bg-gray-50 p-4 rounded">
              <p class="text-sm text-gray-500 mb-1">Description</p>
              <p>{{ selectedCategory.description }}</p>
            </div>

            <!-- Products in this Category -->
            <div>
              <h4 class="font-medium text-gray-700 mb-3">Products in this Category</h4>
              <div class="space-y-2">
                <div v-for="product in categoryProducts" :key="product.id" 
                     class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p class="font-medium">{{ product.name }}</p>
                    <p class="text-xs text-gray-500">{{ product.quantity }} units</p>
                  </div>
                  <span class="text-sm font-semibold">{{ formatCurrency(product.purchase_price) }}</span>
                </div>
                <div v-if="categoryProducts.length === 0" class="text-center py-4 text-gray-500">
                  No products in this category yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  TagIcon,
  CubeIcon,
  SparklesIcon,
  SwatchIcon,
  FolderIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

// State
const categories = ref([])
const products = ref([])
const selectedType = ref('Series')
const showAddModal = ref(false)
const showDetailsModal = ref(false)
const editingCategory = ref(null)
const selectedCategory = ref(null)

// Inject notification
const showNotification = inject('showNotification')

// Form state
const form = ref({
  name: '',
  type: 'Series',
  description: '',
  image_url: '',
  color: '#ff4d6d'
})

// Category types with icons
const categoryTypes = [
  { value: 'Series', label: 'Series', icon: CubeIcon },
  { value: 'Character', label: 'Characters', icon: SwatchIcon },
  { value: 'Rarity', label: 'Rarity', icon: SparklesIcon },
  { value: 'Collection', label: 'Collections', icon: FolderIcon },
  { value: 'Theme', label: 'Themes', icon: TagIcon }
]

// Computed
const filteredCategories = computed(() => {
  return categories.value.filter(c => c.type === selectedType.value)
})

const categoryProducts = computed(() => {
  if (!selectedCategory.value) return []
  return products.value.filter(p => 
    p.category_id === selectedCategory.value.id || 
    p.series_id === selectedCategory.value.id
  )
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTypeIcon = (type) => {
  const icons = {
    'Series': CubeIcon,
    'Character': SwatchIcon,
    'Rarity': SparklesIcon,
    'Collection': FolderIcon,
    'Theme': TagIcon
  }
  return icons[type] || TagIcon
}

const getProductCount = (categoryId) => {
  return products.value.filter(p => 
    p.category_id === categoryId || p.series_id === categoryId
  ).length
}

const getCategoryValue = (categoryId) => {
  return products.value
    .filter(p => p.category_id === categoryId || p.series_id === categoryId)
    .reduce((sum, p) => sum + (p.purchase_price * p.quantity), 0)
}

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    showNotification('Error loading categories: ' + error.message, 'error')
  } else {
    categories.value = data
  }
}

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (!error) {
    products.value = data
  }
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      const { error } = await supabase
        .from('categories')
        .update(form.value)
        .eq('id', editingCategory.value.id)
      
      if (error) throw error
      showNotification('Category updated successfully!', 'success')
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([form.value])
      
      if (error) throw error
      showNotification('Category created successfully!', 'success')
    }
    
    closeModal()
    fetchCategories()
  } catch (error) {
    showNotification('Error: ' + error.message, 'error')
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  form.value = { ...category }
  showAddModal.value = true
}

const viewCategory = (category) => {
  selectedCategory.value = category
  showDetailsModal.value = true
}

const deleteCategory = async (id) => {
  // Check if category has products
  const productCount = getProductCount(id)
  
  if (productCount > 0) {
    if (!confirm(`This category has ${productCount} products. Moving them will unset their category. Continue?`)) {
      return
    }
    
    // Update products to remove category
    const { error: updateError } = await supabase
      .from('products')
      .update({ category_id: null, series_id: null })
      .or(`category_id.eq.${id},series_id.eq.${id}`)
    
    if (updateError) {
      showNotification('Error updating products: ' + updateError.message, 'error')
      return
    }
  }
  
  // Delete category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    showNotification('Error deleting category: ' + error.message, 'error')
  } else {
    showNotification('Category deleted successfully!', 'success')
    fetchCategories()
    fetchProducts()
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingCategory.value = null
  form.value = {
    name: '',
    type: 'Series',
    description: '',
    image_url: '',
    color: '#ff4d6d'
  }
}

// Initialize
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>