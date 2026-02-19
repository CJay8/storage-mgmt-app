window.XHSPage = {
    template: `
        <div>
            <!-- Stats -->
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">{{ postedCount }}</div>
                    <div class="stat-label">Posted</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ unpostedCount }}</div>
                    <div class="stat-label">To Post</div>
                </div>
            </div>

            <!-- Create Post Button -->
            <div class="card">
                <div class="card-title">
                    Create New Post
                    <button class="btn-small" @click="showAddModal">
                        <i class="fas fa-plus"></i> New
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <div 
                    v-for="tab in tabs" 
                    :key="tab.value"
                    class="tab" 
                    :class="{ active: currentTab === tab.value }"
                    @click="currentTab = tab.value"
                >
                    {{ tab.label }}
                </div>
            </div>

            <!-- Posts List -->
            <div v-if="filteredPosts.length === 0" class="card text-center">
                <p>No posts found</p>
            </div>

            <div 
                v-for="post in filteredPosts" 
                :key="post.id"
                class="card"
                style="margin-bottom: 10px;"
            >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>{{ post.plushieName }}</h4>
                    <label class="toggle-switch">
                        <input type="checkbox" :checked="post.posted" @change="togglePost(post.id)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <p style="font-size: 13px; color: #666; margin: 10px 0;">{{ post.caption }}</p>
                <div v-if="post.posted" style="display: flex; gap: 15px; color: #666; font-size: 12px;">
                    <span><i class="fas fa-heart"></i> {{ post.likes }}</span>
                    <span><i class="fas fa-comment"></i> {{ post.comments }}</span>
                    <span><i class="fas fa-calendar"></i> {{ post.datePosted }}</span>
                </div>
            </div>

            <!-- Add Post Modal -->
            <div v-if="showModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create XHS Post</h3>
                        <span class="close-btn" @click="showModal = false">&times;</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Select Plushie</label>
                        <select class="form-control" v-model="newPost.plushieId" @change="updateCaption">
                            <option v-for="item in inventory" :key="item.id" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Caption Template</label>
                        <select class="form-control" v-model="selectedTemplate" @change="updateCaption">
                            <option value="✨ New Arrival! {name} - Perfect for collection! #popmart #{hashtag}">
                                ✨ New Arrival
                            </option>
                            <option value="🌸 {name} - Limited Edition! DM for price #{hashtag}">
                                🌸 Limited Edition
                            </option>
                            <option value="🎁 Just unboxed {name}! So cute! Check bio for details! #popmart #{hashtag}">
                                🎁 Unboxing
                            </option>
                            <option value="🔥 Hot item! {name} in stock! Fast shipping available! #{hashtag}">
                                🔥 Hot Item
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Custom Caption</label>
                        <textarea class="form-control" v-model="newPost.caption" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" v-model="newPost.posted"> Post now (mark as posted)
                        </label>
                    </div>
                    
                    <button class="btn" @click="addPost">Create Post</button>
                </div>
            </div>
        </div>
    `,

    setup() {
        const inventory = Vue.ref(store.state.inventory);
        const xhsPosts = Vue.ref(store.state.xhsPosts);
        const currentTab = Vue.ref('all');
        const showModal = Vue.ref(false);
        const selectedTemplate = Vue.ref('✨ New Arrival! {name} - Perfect for collection! #popmart #{hashtag}');

        const newPost = Vue.ref({
            plushieId: '',
            caption: '',
            posted: false
        });

        const tabs = [
            { label: 'All', value: 'all' },
            { label: 'Posted', value: 'posted' },
            { label: 'Drafts', value: 'drafts' }
        ];

        const postedCount = Vue.computed(() => {
            return xhsPosts.value.filter(p => p.posted).length;
        });

        const unpostedCount = Vue.computed(() => {
            return xhsPosts.value.filter(p => !p.posted).length;
        });

        const filteredPosts = Vue.computed(() => {
            if (currentTab.value === 'all') {
                return xhsPosts.value;
            } else if (currentTab.value === 'posted') {
                return xhsPosts.value.filter(p => p.posted);
            } else {
                return xhsPosts.value.filter(p => !p.posted);
            }
        });

        const showAddModal = () => {
            showModal.value = true;
            // Set default plushie if available
            if (inventory.value.length > 0) {
                newPost.value.plushieId = inventory.value[0].id;
                updateCaption();
            }
        };

        const updateCaption = () => {
            const selected = inventory.value.find(i => i.id === newPost.value.plushieId);
            if (selected) {
                const hashtag = selected.name.toLowerCase().replace(/\s+/g, '');
                newPost.value.caption = selectedTemplate.value
                    .replace('{name}', selected.name)
                    .replace('{hashtag}', hashtag);
            }
        };

        const togglePost = (postId) => {
            store.togglePostStatus(postId);
            xhsPosts.value = store.state.xhsPosts;

            const post = xhsPosts.value.find(p => p.id === postId);
            Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit(
                'notification',
                post.posted ? 'Post marked as published' : 'Post moved to drafts',
                'info'
            );
        };

        const addPost = () => {
            const selected = inventory.value.find(i => i.id === newPost.value.plushieId);

            const post = {
                plushieId: newPost.value.plushieId,
                plushieName: selected.name,
                caption: newPost.value.caption,
                posted: newPost.value.posted
            };

            store.addXHSPost(post);
            showModal.value = false;
            xhsPosts.value = store.state.xhsPosts;

            // Reset form
            newPost.value = {
                plushieId: inventory.value[0]?.id || '',
                caption: '',
                posted: false
            };

            Vue.getCurrentInstance().appContext.app.config.globalProperties.$emit('notification', 'Post created successfully!', 'success');
        };

        return {
            inventory,
            xhsPosts,
            currentTab,
            showModal,
            selectedTemplate,
            newPost,
            tabs,
            postedCount,
            unpostedCount,
            filteredPosts,
            showAddModal,
            updateCaption,
            togglePost,
            addPost
        };
    }
};