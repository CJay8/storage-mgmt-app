window.Inventory = {
    template: `
        <div>
            <!-- Tabs -->
            <div class="tabs">
                <div 
                    v-for="tab in tabs" 
                    :key="tab.value"
                    class="tab" 
                    :class="{ active: currentFilter === tab.value }"
                    @click="currentFilter = tab.value"
                >
                    {{ tab.label }}
                </div>
            </div>

            <!-- Add Button -->
            <button class="btn" @click="showAddModal" style="margin-bottom: 15px;">
                <i class="fas fa-plus"></i> Add New Purchase
            </button>

            <!-- Inventory List -->
            <div v-if="filteredInventory.length === 0" class="card text-center">
                <p>No items found</p>
            </div>

            <div 
                v-for="item in filteredInventory" 
                :key="item.id"
                class="card inventory-item"
            >
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom: 5px;">{{ item.name }}</h3>
                        <p style="color: #666; font-size: 13px; margin-bottom: 10px;">
                            Box: {{ item.boxNumber }} | SN: {{ item.serialNumber }}
                        </p>
                    </div>
                    <span class="badge" :class="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                    </span>
                </div>
                
                <div class="grid-3" style="margin-top: 10px;">
                    <div>
                        <small style="color: #666;">Quantity</small>
                        <div><strong>{{ item.quantity }}</strong></div>
                    </div>
                    <div>
                        <small style="color: #666;">Price</small>
                        <div><strong>{{ formatCurrency(item.purchasePrice) }}</strong></div>
                    </div>
                    <div>
                        <small style="color: #666;">Hint</small>
                        <div><strong>{{ item.hint }}</strong></div>
                    </div>
                </div>
                
                <div class="grid-2" style="margin-top: 15px;">
                    <button class="btn-small" @click="editItem(item.id)">Edit</button>
                    <button class="btn-small" style="background: #dc3545;" @click="deleteItem(item.id)">Delete</button>
                </div>
            </div>

            <!-- Add/Edit Modal -->
            <div v-if="showModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>{{ editingItem ? 'Edit' : 'Add' }} Purchase</h3>
                        <span class="close-btn" @click="closeModal">&times;</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Plushie Name</label>
                        <input type="text" class="form-control" v-model="form.name">
                    </div>
                    
                    <div class="form-group">
                        <label>Purchase Price</label>
                        <input type="number" class="form-control" v-model="form.purchasePrice" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" class="form-control" v-model="form.quantity">
                    </div>
                    
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-control" v-model="form.status">
                            <option value="received">Received</option>
                            <option value="shipped">Shipped</option>
                            <option value="onhold">On Hold</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Hint</label>
                        <input type="text" class="form-control" v-model="form.hint">
                    </div>
                    
                    <div class="form-group">
                        <label>Box Number</label>
                        <input type="text" class="form-control" v-model="form.boxNumber">
                    </div>
                    
                    <div class="form-group">
                        <label>Serial Number</label>
                        <input type="text" class="form-control" v-model="form.serialNumber">
                    </div>
                    
                    <button class="btn" @click="saveItem">
                        {{ editingItem ? 'Update' : 'Add' }} Purchase
                    </button>
                </div>
            </div>
        </div>
    `,

    setup() {
        const inventory = Vue.ref(store.state.inventory);
        const currentFilter = Vue.ref('all');
        const showModal = Vue.ref(false);
        const editingItem = Vue.ref(null);

        const form = Vue.ref({
            name: '',
            purchasePrice: '',
            quantity: 1,
            status: 'received',
            hint: '',
            boxNumber: '',
            serialNumber: ''
        });

        const tabs = [
            { label: 'All', value: 'all' },
            { label: 'Received', value: 'received' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'On Hold', value: 'onhold' }
        ];

        const filteredInventory = Vue.computed(() => {
            if (currentFilter.value === 'all') {
                return inventory.value;
            }
            return inventory.value.filter(item => item.status === currentFilter.value);
        });

        const formatCurrency = (amount) => {
            return store.formatCurrency(amount);
        };

        const getStatusBadgeClass = (status) => {
            const classes = {
                'received': 'badge-success',
                'shipped': 'badge-info',
                'onhold': 'badge-warning'
            };
            return classes[status] || 'badge-info';
        };

        const showAddModal = () => {
            editingItem.value = null;
            form.value = {
                name: '',
                purchasePrice: '',
                quantity: 1,
                status: 'received',
                hint: '',
                boxNumber: '',
                serialNumber: ''
            };
            showModal.value = true;
        };

        const editItem = (id) => {
            const item = inventory.value.find(i => i.id === id);
            if (item) {
                editingItem.value = id;
                form.value = { ...item };
                showModal.value = true;
            }
        };

        const deleteItem = (id) => {
            if (confirm('Are you sure you want to delete this item?')) {
                store.deleteInventory(id);
                inventory.value = store.state.inventory;

                Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Item deleted successfully!', 'success');
            }
        };

        const saveItem = () => {
            if (editingItem.value) {
                store.updateInventory(editingItem.value, form.value);
                Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Item updated successfully!', 'success');
            } else {
                store.addInventory({ ...form.value });
                Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Item added successfully!', 'success');
            }

            inventory.value = store.state.inventory;
            closeModal();
        };

        const closeModal = () => {
            showModal.value = false;
            editingItem.value = null;
        };

        return {
            inventory,
            currentFilter,
            showModal,
            editingItem,
            form,
            tabs,
            filteredInventory,
            formatCurrency,
            getStatusBadgeClass,
            showAddModal,
            editItem,
            deleteItem,
            saveItem,
            closeModal
        };
    }
};