// Data Manager - Handles all localStorage operations for the restaurant menu
// This file provides a clean API for CRUD operations on categories, items, and modifier groups

class DataManager {
  constructor() {
    this.storageKeys = {
      categories: 'udo_categories',
      items: 'udo_items',
      modifierGroups: 'udo_modifier_groups'
    };
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
  
  getAllCategories() {
    return this.getData(this.storageKeys.categories);
  }

  getCategoryById(id) {
    const categories = this.getAllCategories();
    return categories.find(cat => cat.id === id);
  }

  createCategory(categoryData) {
    const categories = this.getAllCategories();
    const newCategory = {
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

  updateCategory(id, updates) {
    const categories = this.getAllCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.categories, categories);
      return categories[index];
    }
    return null;
  }

  deleteCategory(id) {
    const categories = this.getAllCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    
    if (filtered.length < categories.length) {
      this.setData(this.storageKeys.categories, filtered);
      return true;
    }
    return false;
  }

  // ===== ITEMS =====
  
  getAllItems() {
    return this.getData(this.storageKeys.items);
  }

  getItemsByCategory(categoryId) {
    const items = this.getAllItems();
    return items.filter(item => item.category_id === categoryId);
  }

  getItemById(id) {
    const items = this.getAllItems();
    return items.find(item => item.id === id);
  }

  createItem(itemData) {
    const items = this.getAllItems();
    const newItem = {
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

  updateItem(id, updates) {
    const items = this.getAllItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        base_price: updates.base_price !== undefined ? parseFloat(updates.base_price) : items[index].base_price,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.items, items);
      return items[index];
    }
    return null;
  }

  deleteItem(id) {
    const items = this.getAllItems();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length < items.length) {
      this.setData(this.storageKeys.items, filtered);
      return true;
    }
    return false;
  }

  toggleItemAvailability(id) {
    const item = this.getItemById(id);
    if (item) {
      return this.updateItem(id, { available: !item.available });
    }
    return null;
  }

  // ===== MODIFIER GROUPS =====
  
  getAllModifierGroups() {
    return this.getData(this.storageKeys.modifierGroups);
  }

  getModifierGroupById(id) {
    const groups = this.getAllModifierGroups();
    return groups.find(group => group.id === id);
  }

  createModifierGroup(groupData) {
    const groups = this.getAllModifierGroups();
    const newGroup = {
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

  updateModifierGroup(id, updates) {
    const groups = this.getAllModifierGroups();
    const index = groups.findIndex(group => group.id === id);
    
    if (index !== -1) {
      groups[index] = {
        ...groups[index],
        ...updates,
        min_selection: updates.min_selection !== undefined ? parseInt(updates.min_selection) : groups[index].min_selection,
        max_selection: updates.max_selection !== undefined ? parseInt(updates.max_selection) : groups[index].max_selection,
        updated_at: new Date().toISOString()
      };
      this.setData(this.storageKeys.modifierGroups, groups);
      return groups[index];
    }
    return null;
  }

  deleteModifierGroup(id) {
    const groups = this.getAllModifierGroups();
    const filtered = groups.filter(group => group.id !== id);
    
    if (filtered.length < groups.length) {
      this.setData(this.storageKeys.modifierGroups, filtered);
      return true;
    }
    return false;
  }

  // ===== MODIFIER OPTIONS =====
  
  addModifierOption(groupId, optionData) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const newOption = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: optionData.name,
        extra_price: parseFloat(optionData.extra_price) || 0,
        available: true
      };
      
      group.options.push(newOption);
      this.updateModifierGroup(groupId, { options: group.options });
      return newOption;
    }
    return null;
  }

  updateModifierOption(groupId, optionId, updates) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const optionIndex = group.options.findIndex(opt => opt.id === optionId);
      if (optionIndex !== -1) {
        group.options[optionIndex] = {
          ...group.options[optionIndex],
          ...updates,
          extra_price: updates.extra_price !== undefined ? parseFloat(updates.extra_price) : group.options[optionIndex].extra_price
        };
        this.updateModifierGroup(groupId, { options: group.options });
        return group.options[optionIndex];
      }
    }
    return null;
  }

  deleteModifierOption(groupId, optionId) {
    const group = this.getModifierGroupById(groupId);
    if (group) {
      const originalLength = group.options.length;
      group.options = group.options.filter(opt => opt.id !== optionId);
      
      if (group.options.length < originalLength) {
        this.updateModifierGroup(groupId, { options: group.options });
        return true;
      }
    }
    return false;
  }

  toggleModifierOptionAvailability(groupId, optionId) {
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
  getCategoryModifierGroups(categoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category) return [];
    
    const allGroups = this.getAllModifierGroups();
    return category.modifier_group_ids
      .map(id => allGroups.find(group => group.id === id))
      .filter(group => group !== undefined);
  }

  // Get all modifier groups for a specific item (item-specific + category-inherited)
  getItemModifierGroups(itemId) {
    const item = this.getItemById(itemId);
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
  searchItems(query) {
    const items = this.getAllItems();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );
  }

  // Get statistics
  getStatistics() {
    const categories = this.getAllCategories();
    const items = this.getAllItems();
    const modifierGroups = this.getAllModifierGroups();
    
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