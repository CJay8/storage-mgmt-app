window.Dashboard = {
    template: `
        <div>
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">{{ stats.totalInventory }}</div>
                    <div class="stat-label">Total Stock</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ stats.totalSales }}</div>
                    <div class="stat-label">Sold</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</div>
                    <div class="stat-label">Revenue</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ formatCurrency(stats.totalProfit) }}</div>
                    <div class="stat-label">Profit</div>
                </div>
            </div>

            <!-- Pending Items -->
            <div class="card">
                <div class="card-title">
                    Pending Items
                    <span class="badge badge-warning">{{ stats.pendingCount }}</span>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Days</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in pendingItems" :key="item.id">
                            <td>{{ item.plushieName }}</td>
                            <td>{{ item.daysPending }}</td>
                            <td>
                                <span class="badge" :class="getStatusBadgeClass(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="pendingItems.length === 0">
                            <td colspan="3" class="text-center">No pending items</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Recent Sales -->
            <div class="card">
                <div class="card-title">Recent Sales</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Profit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sale in recentSales" :key="sale.id">
                            <td>{{ sale.plushieName }}</td>
                            <td :class="sale.profit >= 0 ? 'text-success' : 'text-danger'">
                                {{ formatCurrency(sale.profit) }}
                            </td>
                            <td>
                                <span class="badge" :class="getStatusBadgeClass(sale.status)">
                                    {{ sale.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <div class="card-title">Quick Actions</div>
                <div class="grid-2">
                    <button class="btn btn-small" @click="showAddPurchaseModal">
                        <i class="fas fa-plus"></i> Add Purchase
                    </button>
                    <button class="btn btn-small" @click="showAddSaleModal">
                        <i class="fas fa-dollar-sign"></i> Record Sale
                    </button>
                </div>
            </div>

            <!-- Add Purchase Modal -->
            <div v-if="showPurchaseModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Purchase</h3>
                        <span class="close-btn" @click="showPurchaseModal = false">&times;</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Plushie Name</label>
                        <input type="text" class="form-control" v-model="newPurchase.name" placeholder="e.g., Molly Bear">
                    </div>
                    
                    <div class="form-group">
                        <label>Purchase Price</label>
                        <input type="number" class="form-control" v-model="newPurchase.purchasePrice" step="0.01" placeholder="25.99">
                    </div>
                    
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" class="form-control" v-model="newPurchase.quantity" value="1">
                    </div>
                    
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-control" v-model="newPurchase.status">
                            <option value="received">Received</option>
                            <option value="shipped">Shipped</option>
                            <option value="onhold">On Hold</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Hint</label>
                        <input type="text" class="form-control" v-model="newPurchase.hint" placeholder="e.g., Forest">
                    </div>
                    
                    <div class="form-group">
                        <label>Box Number</label>
                        <input type="text" class="form-control" v-model="newPurchase.boxNumber" placeholder="e.g., B001">
                    </div>
                    
                    <div class="form-group">
                        <label>Serial Number</label>
                        <input type="text" class="form-control" v-model="newPurchase.serialNumber" placeholder="e.g., SN123456">
                    </div>
                    
                    <button class="btn" @click="addPurchase">Add Purchase</button>
                </div>
            </div>

            <!-- Add Sale Modal -->
            <div v-if="showSaleModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Record Sale</h3>
                        <span class="close-btn" @click="showSaleModal = false">&times;</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Select Plushie</label>
                        <select class="form-control" v-model="newSale.plushieId" @change="updateSaleDetails">
                            <option v-for="item in inventory" :key="item.id" :value="item.id">
                                {{ item.name }} - {{ formatCurrency(item.purchasePrice) }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Selling Price</label>
                        <input type="number" class="form-control" v-model="newSale.sellingPrice" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Buyer Name</label>
                        <input type="text" class="form-control" v-model="newSale.buyer">
                    </div>
                    
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-control" v-model="newSale.status">
                            <option value="sold">Sold</option>
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                        </select>
                    </div>
                    
                    <button class="btn" @click="addSale">Record Sale</button>
                </div>
            </div>
        </div>
    `,

    setup() {
        const stats = Vue.ref(store.getDashboardStats());
        const pendingItems = Vue.ref(store.state.pendingItems);
        const recentSales = Vue.ref(store.state.sales.slice(0, 5));
        const inventory = Vue.ref(store.state.inventory);

        const showPurchaseModal = Vue.ref(false);
        const showSaleModal = Vue.ref(false);

        const newPurchase = Vue.ref({
            name: '',
            purchasePrice: '',
            quantity: 1,
            status: 'received',
            hint: '',
            boxNumber: '',
            serialNumber: ''
        });

        const newSale = Vue.ref({
            plushieId: '',
            sellingPrice: '',
            buyer: '',
            status: 'sold'
        });

        const formatCurrency = (amount) => {
            return store.formatCurrency(amount);
        };

        const getStatusBadgeClass = (status) => {
            const classes = {
                'sold': 'badge-success',
                'pending': 'badge-warning',
                'booked': 'badge-info',
                'received': 'badge-success',
                'shipped': 'badge-info',
                'onhold': 'badge-warning'
            };
            return classes[status] || 'badge-info';
        };

        const showAddPurchaseModal = () => {
            showPurchaseModal.value = true;
        };

        const showAddSaleModal = () => {
            showSaleModal.value = true;
        };

        const addPurchase = () => {
            store.addInventory({ ...newPurchase.value });
            showPurchaseModal.value = false;

            // Reset form
            newPurchase.value = {
                name: '',
                purchasePrice: '',
                quantity: 1,
                status: 'received',
                hint: '',
                boxNumber: '',
                serialNumber: ''
            };

            // Refresh data
            stats.value = store.getDashboardStats();
            inventory.value = store.state.inventory;

            // Show notification
            Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Purchase added successfully!', 'success');
        };

        const updateSaleDetails = () => {
            const selected = inventory.value.find(i => i.id === newSale.value.plushieId);
            if (selected) {
                newSale.value.plushieName = selected.name;
                newSale.value.purchasePrice = selected.purchasePrice;
            }
        };

        const addSale = () => {
            const selected = inventory.value.find(i => i.id === newSale.value.plushieId);
            const sale = {
                ...newSale.value,
                plushieName: selected.name,
                purchasePrice: selected.purchasePrice
            };

            store.addSale(sale);
            showSaleModal.value = false;

            // Reset form
            newSale.value = {
                plushieId: '',
                sellingPrice: '',
                buyer: '',
                status: 'sold'
            };

            // Refresh data
            stats.value = store.getDashboardStats();
            pendingItems.value = store.state.pendingItems;
            recentSales.value = store.state.sales.slice(0, 5);

            // Show notification
            Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Sale recorded successfully!', 'success');
        };

        return {
            stats,
            pendingItems,
            recentSales,
            inventory,
            showPurchaseModal,
            showSaleModal,
            newPurchase,
            newSale,
            formatCurrency,
            getStatusBadgeClass,
            showAddPurchaseModal,
            showAddSaleModal,
            addPurchase,
            updateSaleDetails,
            addSale
        };
    }
};