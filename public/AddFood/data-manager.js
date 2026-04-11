// Data Manager - Handles both API and localStorage operations for restaurant menu
// This file provides a clean API for CRUD operations with automatic API fallback to localStorage

class DataManager {
  constructor() {
    this.storageKeys = {
      categories: 'udo_categories',
      items: 'udo_items',
      modifierGroups: 'udo_modifier_groups'
    };
    
    // Sync status tracking
    this.syncStatus = {
      lastSync: null,
      isOnline: false,
      useApiMode: false,
      lastError: null
    };
    
    // Initialize API mode
    this.initializeApiMode();
  }
  
  /**
   * Initialize API mode based on token availability and health check
   */
  async initializeApiMode() {
    // Check if tokenManager and apiManager are available
    if (typeof tokenManager !== 'undefined' && typeof apiManager !== 'undefined') {
      // First check if token exists
      if (tokenManager.hasValidToken()) {
        // Try a health check to verify backend is reachable
        console.log('DataManager: Checking backend health...');
        try {
          const isHealthy = await apiManager.healthCheck();
          if (isHealthy) {
            this.syncStatus.useApiMode = true;
            this.syncStatus.isOnline = true;
            console.log('DataManager: API mode initialized as true (backend is reachable)');
          } else {
            this.syncStatus.useApiMode = false;
            this.syncStatus.isOnline = false;
            console.log('DataManager: Backend health check failed, using localStorage mode');
          }
        } catch (error) {
          this.syncStatus.useApiMode = false;
          this.syncStatus.isOnline = false;
          console.log('DataManager: Backend health check error, using localStorage mode');
        }
      } else {
        this.syncStatus.useApiMode = false;
        this.syncStatus.isOnline = false;
        console.log('DataManager: No valid token, using localStorage mode');
      }
    } else {
      console.warn('DataManager: tokenManager or apiManager not available, using localStorage only');
      this.syncStatus.useApiMode = false;
    }
  }
  
  /**
   * Update API mode status
   */
  updateApiMode() {
    if (typeof tokenManager !== 'undefined') {
      const previousMode = this.syncStatus.useApiMode;
      this.syncStatus.useApiMode = tokenManager.hasValidToken();
      
      if (previousMode !== this.syncStatus.useApiMode) {
        console.log('DataManager: API mode changed from', previousMode, 'to', this.syncStatus.useApiMode);
      }
    }
  }
  
  /**
   * Get current sync status
   */
  getSyncStatus() {
    return { ...this.syncStatus };
  }
  
  /**
   * Update last sync timestamp
   */
  updateSyncTimestamp() {
    this.syncStatus.lastSync = new Date().toISOString();
    this.syncStatus.isOnline = true;
    this.syncStatus.lastError = null;
  }
  
  /**
   * Handle API errors - quiet logging for expected fallbacks
   */
  handleApiError(error) {
    // Only log errors if it's not an expected network error during initialization
    if (error.message.includes('Failed to fetch') || error.message.includes('Not Found')) {
      // Silent fallback - expected when backend is unreachable
      this.syncStatus.isOnline = false;
      this.syncStatus.lastError = error.message || 'Unknown error';
      return false;
    }
    
    // Log unexpected errors
    console.error('DataManager: API error:', error.message);
    this.syncStatus.isOnline = false;
    this.syncStatus.lastError = error.message || 'Unknown error';
    return false;
  }

  // Generic storage methods
  getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  setData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  }

  // ===== CATEGORIES =====
  
  async getAllCategories() {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Fetching categories from API...');
        const categories = await apiManager.getCategories();
        this.setData(this.storageKeys.categories, categories);
        this.updateSyncTimestamp();
        console.log('DataManager: Categories fetched from API successfully');
        return categories;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Return from localStorage
    return this.getData(this.storageKeys.categories);
  }

  getCategoryById(id) {
    const categories = this.getAllCategories();
    return categories.find(cat => cat.id === id);
  }

  async createCategory(categoryData) {
    let newCategory;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Creating category via API...');
        newCategory = await apiManager.createCategory(categoryData);
        this.updateSyncTimestamp();
        console.log('DataManager: Category created via API successfully');
        
        // Update localStorage cache
        const categories = this.getData(this.storageKeys.categories);
        categories.push(newCategory);
        this.setData(this.storageKeys.categories, categories);
        
        return newCategory;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Create in localStorage
    const categories = this.getAllCategories();
    newCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: categoryData.name,
      description: categoryData.description || '',
      color: categoryData.color || '#f97316',
      icon: categoryData.icon || '🍽️',
      modifier_group_ids: categoryData.modifier_group_ids || [],
      available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    categories.push(newCategory);
    this.setData(this.storageKeys.categories, categories);
    return newCategory;
  }

  async updateCategory(id, updates) {
    let updatedCategory;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Updating category via API...');
        updatedCategory = await apiManager.updateCategory(id, updates);
        this.updateSyncTimestamp();
        console.log('DataManager: Category updated via API successfully');
        
        // Update localStorage cache
        const categories = this.getData(this.storageKeys.categories);
        const index = categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          categories[index] = updatedCategory;
          this.setData(this.storageKeys.categories, categories);
        }
        
        return updatedCategory;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Update in localStorage
    const categories = this.getAllCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index !== -1) {
      updatedCategory = {
        ...categories[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.categories, categories);
      return updatedCategory;
    }
    return null;
  }

  async deleteCategory(id) {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Deleting category via API...');
        await apiManager.deleteCategory(id);
        this.updateSyncTimestamp();
        console.log('DataManager: Category deleted via API successfully');
        
        // Update localStorage cache
        const categories = this.getData(this.storageKeys.categories);
        const filtered = categories.filter(cat => cat.id !== id);
        this.setData(this.storageKeys.categories, filtered);
        
        return true;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Delete from localStorage
    const categories = this.getAllCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    
    if (filtered.length < categories.length) {
      this.setData(this.storageKeys.categories, filtered);
      return true;
    }
    return false;
  }

  // ===== ITEMS =====
  
  async getAllItems() {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Fetching items from API...');
        const items = await apiManager.getItems();
        this.setData(this.storageKeys.items, items);
        this.updateSyncTimestamp();
        console.log('DataManager: Items fetched from API successfully');
        return items;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Return from localStorage
    return this.getData(this.storageKeys.items);
  }

  async getItemsByCategory(categoryId) {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Fetching items by category from API...');
        const items = await apiManager.getItemsByCategory(categoryId);
        this.updateSyncTimestamp();
        console.log('DataManager: Items by category fetched from API successfully');
        return items;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Return from localStorage
    const items = this.getAllItems();
    return items.filter(item => item.category_id === categoryId);
  }

  getItemById(id) {
    const items = this.getAllItems();
    return items.find(item => item.id === id);
  }

  async createItem(itemData) {
    let newItem;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Creating item via API...');
        newItem = await apiManager.createItem(itemData);
        this.updateSyncTimestamp();
        console.log('DataManager: Item created via API successfully');
        
        // Update localStorage cache
        const items = this.getData(this.storageKeys.items);
        items.push(newItem);
        this.setData(this.storageKeys.items, items);
        
        return newItem;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Create in localStorage
    const items = this.getAllItems();
    newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: itemData.name,
      description: itemData.description || '',
      image_url: itemData.image_url || '',
      base_price: parseFloat(itemData.base_price) || 0,
      category_id: itemData.category_id,
      modifier_group_ids: itemData.modifier_group_ids || [],
      available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    items.push(newItem);
    this.setData(this.storageKeys.items, items);
    return newItem;
  }

  async updateItem(id, updates) {
    let updatedItem;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Updating item via API...');
        updatedItem = await apiManager.updateItem(id, updates);
        this.updateSyncTimestamp();
        console.log('DataManager: Item updated via API successfully');
        
        // Update localStorage cache
        const items = this.getData(this.storageKeys.items);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = updatedItem;
          this.setData(this.storageKeys.items, items);
        }
        
        return updatedItem;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Update in localStorage
    const items = this.getAllItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      updatedItem = {
        ...items[index],
        ...updates,
        base_price: updates.base_price !== undefined ? parseFloat(updates.base_price) : items[index].base_price,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.items, items);
      return updatedItem;
    }
    return null;
  }

  async deleteItem(id) {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Deleting item via API...');
        await apiManager.deleteItem(id);
        this.updateSyncTimestamp();
        console.log('DataManager: Item deleted via API successfully');
        
        // Update localStorage cache
        const items = this.getData(this.storageKeys.items);
        const filtered = items.filter(item => item.id !== id);
        this.setData(this.storageKeys.items, filtered);
        
        return true;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Delete from localStorage
    const items = this.getAllItems();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length < items.length) {
      this.setData(this.storageKeys.items, filtered);
      return true;
    }
    return false;
  }

  async toggleItemAvailability(id) {
    const item = await this.getItemById(id);
    if (item) {
      return this.updateItem(id, { available: !item.available });
    }
    return null;
  }

  // ===== MODIFIER GROUPS =====
  
  async getAllModifierGroups() {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Fetching modifier groups from API...');
        const groups = await apiManager.getModifierGroups();
        this.setData(this.storageKeys.modifierGroups, groups);
        this.updateSyncTimestamp();
        console.log('DataManager: Modifier groups fetched from API successfully');
        return groups;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Return from localStorage
    return this.getData(this.storageKeys.modifierGroups);
  }

  getModifierGroupById(id) {
    const groups = this.getAllModifierGroups();
    return groups.find(group => group.id === id);
  }

  async createModifierGroup(groupData) {
    let newGroup;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Creating modifier group via API...');
        newGroup = await apiManager.createModifierGroup(groupData);
        this.updateSyncTimestamp();
        console.log('DataManager: Modifier group created via API successfully');
        
        // Update localStorage cache
        const groups = this.getData(this.storageKeys.modifierGroups);
        groups.push(newGroup);
        this.setData(this.storageKeys.modifierGroups, groups);
        
        return newGroup;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Create in localStorage
    const groups = this.getAllModifierGroups();
    newGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: groupData.name,
      description: groupData.description || '',
      min_selection: parseInt(groupData.min_selection) || 0,
      max_selection: parseInt(groupData.max_selection) || 1,
      required: groupData.required || false,
      options: groupData.options || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    groups.push(newGroup);
    this.setData(this.storageKeys.modifierGroups, groups);
    return newGroup;
  }

  async updateModifierGroup(id, updates) {
    let updatedGroup;
    
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Updating modifier group via API...');
        updatedGroup = await apiManager.updateModifierGroup(id, updates);
        this.updateSyncTimestamp();
        console.log('DataManager: Modifier group updated via API successfully');
        
        // Update localStorage cache
        const groups = this.getData(this.storageKeys.modifierGroups);
        const index = groups.findIndex(group => group.id === id);
        if (index !== -1) {
          groups[index] = updatedGroup;
          this.setData(this.storageKeys.modifierGroups, groups);
        }
        
        return updatedGroup;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Update in localStorage
    const groups = this.getAllModifierGroups();
    const index = groups.findIndex(group => group.id === id);
    
    if (index !== -1) {
      updatedGroup = {
        ...groups[index],
        ...updates,
        min_selection: updates.min_selection !== undefined ? parseInt(updates.min_selection) : groups[index].min_selection,
        max_selection: updates.max_selection !== undefined ? parseInt(updates.max_selection) : groups[index].max_selection,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.modifierGroups, groups);
      return updatedGroup;
    }
    return null;
  }

  async deleteModifierGroup(id) {
    // Try API first if in API mode
    if (this.syncStatus.useApiMode && typeof apiManager !== 'undefined') {
      try {
        console.log('DataManager: Deleting modifier group via API...');
        await apiManager.deleteModifierGroup(id);
        this.updateSyncTimestamp();
        console.log('DataManager: Modifier group deleted via API successfully');
        
        // Update localStorage cache
        const groups = this.getData(this.storageKeys.modifierGroups);
        const filtered = groups.filter(group => group.id !== id);
        this.setData(this.storageKeys.modifierGroups, filtered);
        
        return true;
      } catch (error) {
        this.handleApiError(error);
        // Fall back to localStorage
      }
    }
    
    // Delete from localStorage
    const groups = this.getAllModifierGroups();
    const filtered = groups.filter(group => group.id !== id);
    
    if (filtered.length < groups.length) {
      this.setData(this.storageKeys.modifierGroups, filtered);
      return true;
    }
    return false;
  }

  // ===== MODIFIER OPTIONS =====
  
  async addModifierOption(groupId, optionData) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const newOption = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: optionData.name,
        extra_price: parseFloat(optionData.extra_price) || 0,
        available: true
      };
      
      group.options.push(newOption);
      await this.updateModifierGroup(groupId, { options: group.options });
      return newOption;
    }
    return null;
  }

  async updateModifierOption(groupId, optionId, updates) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const optionIndex = group.options.findIndex(opt => opt.id === optionId);
      if (optionIndex !== -1) {
        group.options[optionIndex] = {
          ...group.options[optionIndex],
          ...updates,
          extra_price: updates.extra_price !== undefined ? parseFloat(updates.extra_price) : group.options[optionIndex].extra_price
        };
        await this.updateModifierGroup(groupId, { options: group.options });
        return group.options[optionIndex];
      }
    }
    return null;
  }

  async deleteModifierOption(groupId, optionId) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const originalLength = group.options.length;
      group.options = group.options.filter(opt => opt.id !== optionId);
      
      if (group.options.length < originalLength) {
        await this.updateModifierGroup(groupId, { options: group.options });
        return true;
      }
    }
    return false;
  }

  async toggleModifierOptionAvailability(groupId, optionId) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const option = group.options.find(opt => opt.id === optionId);
      if (option) {
        return this.updateModifierOption(groupId, optionId, { available: !option.available });
      }
    }
    return null;
  }

  // ===== HELPER METHODS =====
  
  // Get all modifier groups for a specific category (inherited)
  async getCategoryModifierGroups(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (!category) return [];
    
    const allGroups = await this.getAllModifierGroups();
    return category.modifier_group_ids
      .map(id => allGroups.find(group => group.id === id))
      .filter(group => group !== undefined);
  }

  // Get all modifier groups for a specific item (item-specific + category-inherited)
  async getItemModifierGroups(itemId) {
    const item = await this.getItemById(itemId);
    if (!item) return [];
    
    // Get item-specific modifier groups
    const itemGroups = (item.modifier_group_ids || [])
      .map(id => this.getModifierGroupById(id))
      .filter(group => group !== undefined);
    
    // If item has no specific groups, inherit from category
    if (itemGroups.length === 0) {
      return this.getCategoryModifierGroups(item.category_id);
    }
    
    return itemGroups;
  }

  // Search items by name or description
  async searchItems(query) {
    const items = await this.getAllItems();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );
  }

  // Get statistics
  async getStatistics() {
    const categories = await this.getAllCategories();
    const items = await this.getAllItems();
    const modifierGroups = await this.getAllModifierGroups();
    
    return {
      totalCategories: categories.length,
      availableCategories: categories.filter(cat => cat.available).length,
      totalItems: items.length,
      availableItems: items.filter(item => item.available).length,
      totalModifierGroups: modifierGroups.length,
      averagePrice: items.length > 0 
        ? (items.reduce((sum, item) => sum + item.base_price, 0) / items.length).toFixed(2)
        : 0
    };
  }
}

// Create a global instance
const dataManager = new DataManager();