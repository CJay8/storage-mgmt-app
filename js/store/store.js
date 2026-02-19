// Global store for state management
const store = {
    state: {
        inventory: [],
        sales: [],
        xhsPosts: [],
        pendingItems: []
    },

    init() {
        // Load data from localStorage
        this.state.inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        this.state.sales = JSON.parse(localStorage.getItem('sales')) || [];
        this.state.xhsPosts = JSON.parse(localStorage.getItem('xhsPosts')) || [];
        this.state.pendingItems = JSON.parse(localStorage.getItem('pendingItems')) || [];

        // Initialize with sample data if empty
        if (this.state.inventory.length === 0) {
            this.initializeSampleData();
        }
    },

    initializeSampleData() {
        this.state.inventory = [
            {
                id: 1,
                name: 'Molly Bear',
                purchasePrice: 25.99,
                quantity: 10,
                hint: 'Forest',
                boxNumber: 'B001',
                serialNumber: 'SN123456',
                status: 'received',
                dateAdded: '2024-01-15'
            },
            {
                id: 2,
                name: 'Dimoo Forest',
                purchasePrice: 22.50,
                quantity: 5,
                hint: 'Meadow',
                boxNumber: 'B002',
                serialNumber: 'SN789012',
                status: 'shipped',
                dateAdded: '2024-01-16'
            }
        ];

        this.state.sales = [
            {
                id: 1,
                plushieId: 1,
                plushieName: 'Molly Bear',
                sellingPrice: 45.00,
                purchasePrice: 25.99,
                profit: 19.01,
                status: 'sold',
                date: '2024-01-20',
                buyer: 'Customer A'
            },
            {
                id: 2,
                plushieId: 2,
                plushieName: 'Dimoo Forest',
                sellingPrice: 40.00,
                purchasePrice: 22.50,
                profit: 17.50,
                status: 'pending',
                date: '2024-01-21',
                buyer: 'Customer B'
            }
        ];

        this.state.xhsPosts = [
            {
                id: 1,
                plushieId: 1,
                plushieName: 'Molly Bear',
                caption: '✨ New Arrival! Molly Bear Plushie - Perfect for collection! #popmart #mollybear',
                posted: true,
                datePosted: '2024-01-18',
                likes: 45,
                comments: 12
            },
            {
                id: 2,
                plushieId: 2,
                plushieName: 'Dimoo Forest',
                caption: '🌸 Dimoo Forest Series - Limited Edition! DM for price #dimoo #popmart',
                posted: false,
                datePosted: null,
                likes: 0,
                comments: 0
            }
        ];

        this.state.pendingItems = [
            {
                id: 1,
                plushieId: 2,
                plushieName: 'Dimoo Forest',
                customer: 'Customer B',
                date: '2024-01-21',
                daysPending: 5,
                status: 'pending'
            }
        ];

        this.saveToLocalStorage();
    },

    saveToLocalStorage() {
        localStorage.setItem('inventory', JSON.stringify(this.state.inventory));
        localStorage.setItem('sales', JSON.stringify(this.state.sales));
        localStorage.setItem('xhsPosts', JSON.stringify(this.state.xhsPosts));
        localStorage.setItem('pendingItems', JSON.stringify(this.state.pendingItems));
    },

    // Helper methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    calculateProfitLoss(purchasePrice, sellingPrice) {
        return sellingPrice - purchasePrice;
    },

    // Inventory methods
    addInventory(item) {
        item.id = this.state.inventory.length + 1;
        item.dateAdded = new Date().toISOString().split('T')[0];
        this.state.inventory.push(item);
        this.saveToLocalStorage();
    },

    updateInventory(id, updatedItem) {
        const index = this.state.inventory.findIndex(i => i.id === id);
        if (index !== -1) {
            this.state.inventory[index] = { ...this.state.inventory[index], ...updatedItem };
            this.saveToLocalStorage();
        }
    },

    deleteInventory(id) {
        this.state.inventory = this.state.inventory.filter(i => i.id !== id);
        this.saveToLocalStorage();
    },

    // Sales methods
    addSale(sale) {
        sale.id = this.state.sales.length + 1;
        sale.date = new Date().toISOString().split('T')[0];
        sale.profit = sale.sellingPrice - sale.purchasePrice;
        this.state.sales.push(sale);

        // Update inventory quantity
        const item = this.state.inventory.find(i => i.id === sale.plushieId);
        if (item) {
            item.quantity -= 1;
        }

        // Add to pending if status is pending
        if (sale.status === 'pending') {
            this.state.pendingItems.push({
                id: this.state.pendingItems.length + 1,
                plushieId: sale.plushieId,
                plushieName: sale.plushieName,
                customer: sale.buyer,
                date: sale.date,
                daysPending: 1,
                status: 'pending'
            });
        }

        this.saveToLocalStorage();
    },

    // XHS methods
    addXHSPost(post) {
        post.id = this.state.xhsPosts.length + 1;
        if (post.posted) {
            post.datePosted = new Date().toISOString().split('T')[0];
            post.likes = 0;
            post.comments = 0;
        }
        this.state.xhsPosts.push(post);
        this.saveToLocalStorage();
    },

    togglePostStatus(postId) {
        const post = this.state.xhsPosts.find(p => p.id === postId);
        if (post) {
            post.posted = !post.posted;
            post.datePosted = post.posted ? new Date().toISOString().split('T')[0] : null;
            this.saveToLocalStorage();
        }
    },

    // Pending items methods
    checkPendingItems() {
        this.state.pendingItems.forEach(item => {
            item.daysPending += 1;
        });
        this.saveToLocalStorage();

        // Return items that have been pending for 7+ days
        return this.state.pendingItems.filter(item => item.daysPending >= 7);
    },

    // Analytics methods
    getDashboardStats() {
        const totalInventory = this.state.inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalSales = this.state.sales.filter(s => s.status === 'sold').length;
        const totalRevenue = this.state.sales.filter(s => s.status === 'sold').reduce((sum, s) => sum + s.sellingPrice, 0);
        const totalProfit = this.state.sales.filter(s => s.status === 'sold').reduce((sum, s) => sum + s.profit, 0);

        return {
            totalInventory,
            totalSales,
            totalRevenue,
            totalProfit,
            pendingCount: this.state.pendingItems.length
        };
    },

    getPopularHints() {
        const hintCount = {};
        this.state.inventory.forEach(item => {
            hintCount[item.hint] = (hintCount[item.hint] || 0) + 1;
        });

        return Object.entries(hintCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    },

    getAverageProfit() {
        const soldSales = this.state.sales.filter(s => s.status === 'sold');
        if (soldSales.length === 0) return 0;
        const totalProfit = soldSales.reduce((sum, s) => sum + s.profit, 0);
        return totalProfit / soldSales.length;
    },

    getBestSellingSeries() {
        const seriesCount = {};
        this.state.sales.forEach(sale => {
            seriesCount[sale.plushieName] = (seriesCount[sale.plushieName] || 0) + 1;
        });

        if (Object.keys(seriesCount).length === 0) return 'N/A';

        return Object.entries(seriesCount)
            .sort((a, b) => b[1] - a[1])[0][0];
    },

    getSuccessRate() {
        if (this.state.sales.length === 0) return 0;
        const sold = this.state.sales.filter(s => s.status === 'sold').length;
        return ((sold / this.state.sales.length) * 100).toFixed(1);
    }
};

// Initialize store
store.init();