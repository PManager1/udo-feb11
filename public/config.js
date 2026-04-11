// Central API Configuration for UDO Application
// This file should be loaded in all HTML pages that need API access

// const API_BASE = 'https://xmkvtmgtwb.execute-api.us-east-1.amazonaws.com/dev/';

// Base API URL
const API_BASE = 'http://localhost:3030/';

// Restaurant Menu Endpoints (for AddFood feature)
const RESTAURANT_API = {
  baseURL: `${API_BASE}restaurant`,
  endpoints: {
    categories: '/categories',
    items: '/items',
    modifier_groups: '/modifier-groups',
    upload: '/upload'
  }
};

// Authentication Endpoints
const AUTH_API = {
  google: `${API_BASE}auth/google/`,
  signin: `${API_BASE}signin`,
  sendOtp: `${API_BASE}send-otp-aws`,
  verifyOtp: `${API_BASE}verify-otp`
};

// Helper function to get full endpoint URL
function getRestaurantEndpoint(endpoint) {
  return RESTAURANT_API.baseURL + RESTAURANT_API.endpoints[endpoint];
}

// Log configuration (for debugging)
console.log('API Configuration Loaded:');
console.log('API_BASE:', API_BASE);
console.log('AUTH_API.google:', AUTH_API.google);
console.log('RESTAURANT_API.baseURL:', RESTAURANT_API.baseURL);