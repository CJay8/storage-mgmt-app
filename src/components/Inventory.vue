<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Inventory</h2>
        <p class="text-gray-600">Manage your plushie collection</p>
      </div>
      
      <!-- Search and Add -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search products..." 
            class="input-field pl-10"
          >
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>
        <button @click="showAddModal = true" class="btn-primary flex items-center justify-center whitespace-nowrap">
          <PlusIcon class="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Filter by:</span>
          <select v-model="filters.series" class="input-field !w-auto !py-1.5">
            <option value="">All Series</option>
            <option v-for="series in seriesList" :key="series.id" :value="series.id">
              {{ series.name }}
            </option>
          </select>
          
          <select v-model="filters.rarity" class="input-field !w-auto !py-1.5">
            <option value="">All Rarity</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Ultra Rare">Ultra Rare</option>
            <option value="Secret">Secret</option>
          </select>
          
          <select v-model="filters.status" class="input-field !w-auto !py-1.5">
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2 ml-auto">
          <span class="text-sm text-gray-500">Sort by:</span>
          <select v-model="sortBy" class="input-field !w-auto !py-1.5">
            <option value="name">Name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="date">Date Added</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="product in filteredProducts" :key="product.id" 
           class="card hover:shadow-lg transition group">
        
        <!-- Product Image -->
        <div class="relative">
          <img 
            :src="product.image_url || 'https://via.placeholder.com/300x300?text=PopMart'"
            :alt="product.name"
            class="w-full h-48 object-cover rounded-lg"
          >
          <span class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full"
                :class="getRarityClass(product.rarity)">
            {{ product.rarity || 'Common' }}
          </span>
        </div>

        <!-- Product Info -->
        <div class="mt-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">{{ product.name }}</h3>
              <p class="text-sm text-gray-500">{{ getSeriesName(product.series_id) }}</p>
            </div>
            <span class="text-lg font-bold text-primary">{{ formatCurrency(product.purchase_price) }}</span>
          </div>

          <!-- Details -->
          <div class="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div>
              <span class="text-gray-500">Quantity:</span>
              <span class="ml-1 font-semibold" :class="getQuantityColor(product.quantity)">
                {{ product.quantity || 0 }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">Box:</span>
              <span class="ml-1 font-mono">{{ product.box_number || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-500">Hint:</span>
              <span class="ml-1">{{ product.hint || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-500">SN:</span>
              <span class="ml-1 font-mono text-xs">{{ product.serial_number || 'N/A' }}</span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="mt-3 flex items-center justify-between">
            <span class="px-2 py-1 text-xs rounded-full"
                  :class="getStatusClass(product.status)">
              {{ formatStatus(product.status) }}
            </span>
            
            <!-- Actions -->
            <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
              <button @click="editProduct(product)" class="p-1 text-blue-600 hover:text-blue-800">
                <PencilIcon class="h-5 w-5" />
              </button>
              <button @click="duplicateProduct(product)" class="p-1 text-green-600 hover:text-green-800">
                <DocumentDuplicateIcon class="h-5 w-5" />
              </button>
              <button @click="deleteProduct(product.id)" class="p-1 text-red-600 hover:text-red-800">
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProducts.length === 0" class="card text-center py-12">
      <CubeIcon class="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-700 mb-2">No products found</h3>
      <p class="text-gray-500 mb-4">Get started by adding your first plushie</p>
      <button @click="showAddModal = true" class="btn-primary inline-flex items-center">
        <PlusIcon class="h-5 w-5 mr-2" />
        Add Product
      </button>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ editingProduct ? 'Edit' : 'Add' }} Product</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="saveProduct" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Left Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input v-model="form.name" type="text" required class="input-field">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Series *</label>
                  <select v-model="form.series_id" required class="input-field">
                    <option value="">Select Series</option>
                    <option v-for="series in seriesList" :key="series.id" :value="series.id">
                      {{ series.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select v-model="form.category_id" class="input-field">
                    <option value="">Select Category</option>
                    <option v-for="cat in categoryList" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
                  <select v-model="form.rarity" class="input-field">
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Ultra Rare">Ultra Rare</option>
                    <option value="Secret">Secret</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                  <input v-model="form.purchase_price" type="number" step="0.01" required class="input-field">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input v-model="form.quantity" type="number" min="0" required class="input-field">
                </div>
              </div>

              <!-- Right Column -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input v-model="form.selling_price" type="number" step="0.01" class="input-field">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hint</label>
                  <input v-model="form.hint" type="text" class="input-field" placeholder="e.g., Forest">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Box Number</label>
                  <input v-model="form.box_number" type="text" class="input-field" placeholder="e.g., B001">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input v-model="form.serial_number" type="text" class="input-field" placeholder="e.g., SN123456">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input v-model="form.location" type="text" class="input-field" placeholder="Storage location">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input v-model="form.image_url" type="url" class="input-field" placeholder="https://...">
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea v-model="form.notes" rows="2" class="input-field"></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">
                {{ editingProduct ? 'Update' : 'Create' }} Product
              </button>
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CubeIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

// State
const products = ref([])
const seriesList = ref([])
const categoryList = ref([])
const searchQuery = ref('')
const showAddModal = ref(false)
const editingProduct = ref(null)

const filters = ref({
  series: '',
  rarity: '',
  status: ''
})

const sortBy = ref('name')

const form = ref({
  name: '',
  series_id: '',
  category_id: '',
  rarity: 'Common',
  purchase_price: '',
  selling_price: '',
  quantity: 1,
  hint: '',
  box_number: '',
  serial_number: '',
  location: '',
  image_url: '',
  notes: '',
  status: 'in_stock'
})

// Inject notification
const showNotification = inject('showNotification')

// Computed
const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.hint?.toLowerCase().includes(query) ||
      p.box_number?.toLowerCase().includes(query) ||
      p.serial_number?.toLowerCase().includes(query)
    )
  }

  // Series filter
  if (filters.value.series) {
    filtered = filtered.filter(p => p.series_id === filters.value.series)
  }

  // Rarity filter
  if (filters.value.rarity) {
    filtered = filtered.filter(p => p.rarity === filters.value.rarity)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(p => {
      if (filters.value.status === 'low_stock') return p.quantity > 0 && p.quantity < 3
      if (filters.value.status === 'out_of_stock') return p.quantity === 0
      return p.status === filters.value.status
    })
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price_low':
        return (a.purchase_price || 0) - (b.purchase_price || 0)
      case 'price_high':
        return (b.purchase_price || 0) - (a.purchase_price || 0)
      case 'quantity':
        return (b.quantity || 0) - (a.quantity || 0)
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at)
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const getSeriesName = (seriesId) => {
  const series = seriesList.value.find(s => s.id === seriesId)
  return series?.name || 'Unknown'
}

const getRarityClass = (rarity) => {
  const classes = {
    'Common': 'bg-gray-100 text-gray-600',
    'Rare': 'bg-blue-100 text-blue-600',
    'Ultra Rare': 'bg-purple-100 text-purple-600',
    'Secret': 'bg-yellow-100 text-yellow-600'
  }
  return classes[rarity] || classes['Common']
}

const getStatusClass = (status) => {
  const classes = {
    'in_stock': 'bg-green-100 text-green-600',
    'low_stock': 'bg-yellow-100 text-yellow-600',
    'out_of_stock': 'bg-red-100 text-red-600',
    'sold': 'bg-gray-100 text-gray-600'
  }
  return classes[status] || classes['in_stock']
}

const getQuantityColor = (quantity) => {
  if (quantity === 0) return 'text-red-600'
  if (quantity < 3) return 'text-yellow-600'
  return 'text-green-600'
}

const formatStatus = (status) => {
  const formats = {
    'in_stock': 'In Stock',
    'low_stock': 'Low Stock',
    'out_of_stock': 'Out of Stock',
    'sold': 'Sold'
  }
  return formats[status] || status
}

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!error) products.value = data
}

const fetchSeries = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'Series')
    .order('name')
  
  if (!error) seriesList.value = data
}

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'Character')
    .order('name')
  
  if (!error) categoryList.value = data
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      const { error } = await supabase
        .from('products')
        .update(form.value)
        .eq('id', editingProduct.value.id)
      
      if (error) throw error
      showNotification('Product updated successfully!', 'success')
    } else {
      const { error } = await supabase
        .from('products')
        .insert([form.value])
      
      if (error) throw error
      showNotification('Product added successfully!', 'success')
    }
    
    closeModal()
    fetchProducts()
  } catch (error) {
    showNotification('Error: ' + error.message, 'error')
  }
}

const editProduct = (product) => {
  editingProduct.value = product
  form.value = { ...product }
  showAddModal.value = true
}

const duplicateProduct = async (product) => {
  const { id, created_at, updated_at, ...productData } = product
  productData.name = productData.name + ' (Copy)'
  
  const { error } = await supabase
    .from('products')
    .insert([productData])
  
  if (!error) {
    fetchProducts()
    showNotification('Product duplicated!', 'success')
  }
}

const deleteProduct = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (!error) {
      fetchProducts()
      showNotification('Product deleted!', 'success')
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProduct.value = null
  form.value = {
    name: '',
    series_id: '',
    category_id: '',
    rarity: 'Common',
    purchase_price: '',
    selling_price: '',
    quantity: 1,
    hint: '',
    box_number: '',
    serial_number: '',
    location: '',
    image_url: '',
    notes: '',
    status: 'in_stock'
  }
}

onMounted(() => {
  fetchProducts()
  fetchSeries()
  fetchCategories()
})
</script>   