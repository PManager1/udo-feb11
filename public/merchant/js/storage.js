// Local Storage Management for Merchant Store Builder

const STORAGE_KEY = 'udo_merchant_store';

// Default store data template
const defaultStoreData = {
  storeName: '',
  storeType: '',
  storeAddress: '',
  hours: {
    monday: { open: '09:00', close: '21:00' },
    tuesday: { open: '09:00', close: '21:00' },
    wednesday: { open: '09:00', close: '21:00' },
    thursday: { open: '09:00', close: '21:00' },
    friday: { open: '09:00', close: '21:00' },
    saturday: { open: '09:00', close: '21:00' },
    sunday: { open: '09:00', close: '21:00' }
  },
  emergencyPause: false,
  categories: []
};

// Smart defaults for store types
const storeTypeDefaults = {
  cafe: {
    categories: [
      { id: 'cat_1', name: 'Popular Items', products: [] },
      { id: 'cat_2', name: 'Drinks', products: [] },
      { id: 'cat_3', name: 'Pastries', products: [] },
      { id: 'cat_4', name: 'Breakfast', products: [] }
    ]
  },
  restaurant: {
    categories: [
      { id: 'cat_1', name: 'Appetizers', products: [] },
      { id: 'cat_2', name: 'Mains', products: [] },
      { id: 'cat_3', name: 'Sides', products: [] },
      { id: 'cat_4', name: 'Desserts', products: [] }
    ]
  },
  grocery: {
    categories: [
      { id: 'cat_1', name: 'Essentials', products: [] },
      { id: 'cat_2', name: 'Snacks', products: [] },
      { id: 'cat_3', name: 'Beverages', products: [] }
    ]
  },
  flowers: {
    categories: [
      { id: 'cat_1', name: 'Fresh Flowers', products: [] },
      { id: 'cat_2', name: 'Arrangements', products: [] },
      { id: 'cat_3', name: 'Gifts', products: [] }
    ]
  }
};

/**
 * Load store data from localStorage
 * @returns {Object} Store data
 */
function loadStoreData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading store data:', error);
  }
  return { ...defaultStoreData };
}

/**
 * Save store data to localStorage
 * @param {Object} data - Store data to save
 */
function saveStoreData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving store data:', error);
    return false;
  }
}

/**
 * Apply smart defaults for a store type
 * @param {string} storeType - Type of store (cafe, restaurant, grocery, flowers)
 * @returns {Object} Default categories for the store type
 */
function getStoreTypeDefaults(storeType) {
  return storeTypeDefaults[storeType]?.categories || [];
}

/**
 * Clear all store data
 */
function clearStoreData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing store data:', error);
    return false;
  }
}

/**
 * Calculate progress (steps left to go live)
 * @param {Object} storeData - Store data
 * @returns {number} Steps left to go live
 */
function calculateStepsLeft(storeData) {
  let stepsLeft = 5; // Maximum steps
  
  if (storeData.storeName) stepsLeft--;
  if (storeData.storeType) stepsLeft--;
  if (storeData.storeAddress) stepsLeft--;
  if (storeData.categories.length > 0 && 
      storeData.categories.some(cat => cat.products.length > 0)) stepsLeft--;
  if (!storeData.emergencyPause) stepsLeft--;
  
  return stepsLeft;
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadStoreData,
    saveStoreData,
    getStoreTypeDefaults,
    clearStoreData,
    calculateStepsLeft,
    generateId
  };
}