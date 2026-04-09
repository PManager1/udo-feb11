# 🍽️ UDO Restaurant Menu Management System

A professional-grade, single-page application for restaurant owners to manage their menu items, categories, and modifier groups.

## ✨ Features Implemented

### 📊 Dashboard View
- **Category Cards**: Visual display of all menu categories with images, descriptions, and item counts
- **Search Functionality**: Real-time search across categories and items
- **Quick Actions**: Add new items directly from dashboard
- **86 Status Indicators**: Shows count of out-of-stock items per category

### 🏷️ Category Management
- **Full CRUD**: Create, read, update, and delete categories
- **Image Support**: Add category images via URL
- **Modifier Assignment**: Assign modifier groups to apply to all items in a category
- **Item Count**: Automatic tracking of items per category

### 🍔 Item Management
- **Add/Edit Items**: Comprehensive item creation with validation
- **Image Upload**: Three ways to add images:
  - File upload (with automatic compression)
  - Paste image URL
  - Placeholder URLs for demo
- **Profit Calculator**: Real-time calculation showing:
  - What you keep on UDO (15% commission)
  - What you'd keep on competitor (30% commission)
  - Savings comparison
- **Description Support**: Rich text descriptions
- **86 Feature**: One-click toggle for out-of-stock items with visual feedback

### 🎛️ Modifier Groups
- **Create Custom Modifiers**: Build your own modifier groups
- **Selection Rules**: Configure min/max selections
- **Required/Optional**: Mark modifiers as required or optional
- **Pricing**: Add price adjustments for each option
- **Availability**: Enable/disable individual options

### 🔗 Modifier Inheritance System
- **Category-Level Inheritance**: Assign modifiers to apply to all items in a category
- **Visual Differentiation**: Clear distinction between inherited and local modifiers
  - 📂 Category icon = Inherited (locked at item level)
  - ☑️ Checkmark = Local (fully editable)
  - 🔒 Lock icon = Cannot modify at item level
- **Override Logic**: Items can exclude inherited modifiers if needed
- **Smart Merging**: Automatic combination of local + inherited modifiers

### 🚨 86 (Out of Stock) System
- **High Visibility**: 
  - 50% opacity on item cards
  - Grayscale filter
  - Large "SOLD OUT" badge overlay
  - Red status indicator
- **One-Toggle**: Simple click to mark available/unavailable
- **Confirmation Dialog**: Prevents accidental changes
- **Dashboard Indicators**: Shows 86'd count on category cards

### 💾 Data Persistence
- **localStorage**: All data stored locally in browser
- **Auto-Initialize**: Loads demo data on first visit
- **Real-Time Updates**: Changes save immediately
- **Storage Monitoring**: Checks available space and warns when approaching limits

### 📱 Responsive Design
- **Mobile-Friendly**: Works on all screen sizes
- **Slide-In Drawers**: Smooth animations for item/category editors
- **Modal System**: Clean overlays for modifier group management
- **Touch-Optimized**: Large tap targets for mobile users

## 📁 File Structure

```
AddFood/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # Custom styles and animations
└── js/
    ├── demo-data.js          # Sample restaurant data
    ├── data-manager.js       # CRUD operations + localStorage
    ├── utils.js              # Helper functions (image compression, calculations)
    ├── ui-components.js      # All rendering functions
    └── event-handlers.js     # Event listeners and user interactions
```

## 🚀 How to Use

### Getting Started
1. Open `index.html` in a web browser
2. The system will automatically load demo data
3. You'll see the Dashboard with sample categories (American, Italian, Mexican)

### Managing Categories
1. **View Category**: Click on any category card to see its items
2. **Add Category**: Click "Add New Category" at the bottom
3. **Edit Category**: Click the edit icon (pencil) on a category card
4. **Assign Modifiers**: In the category drawer, select modifier groups to apply to all items

### Managing Items
1. **Add Item**: Click "Add New Item" button or "Add Item" in category view
2. **Edit Item**: Click the edit icon on an item card
3. **86 Item**: Click the green/red circle icon to toggle availability
4. **Add Modifiers**: In the item drawer, select from existing modifier groups or create new ones

### Creating Modifier Groups
1. Open any item drawer
2. Click "+ Create New Group" under "MODIFIER GROUPS"
3. Fill in group details:
   - Group name and description
   - Selection rules (min/max)
   - Whether it's required
   - Add options with names and prices
4. Save to create the group

### Understanding Modifier Inheritance
- **Inherited Modifiers** (📂): Come from the category, can't edit/delete at item level
- **Local Modifiers** (☑️): Added directly to the item, fully editable
- **To Remove Inherited**: Go to Category Settings and remove the modifier group from there

## 🎨 Key UI/UX Features

### Visual Cues
- **Green checkmark** ✅ = Item available
- **Red X** ❌ = Item 86'd (out of stock)
- **Orange border** = Local modifier group
- **Gray border** = Inherited modifier group
- **Lock icon** 🔒 = Cannot edit (inherited)

### Animations
- **Slide-in drawers**: Smooth right-to-left animation
- **Hover effects**: Cards lift slightly on hover
- **Profit calculator**: Pulses green when price changes
- **Modal backdrop**: Blur effect for focus

### Responsive Breakpoints
- **Mobile** (< 640px): Full-width drawers
- **Tablet** (640px-1024px): Optimized spacing
- **Desktop** (> 1024px): Full-featured layout

## 🔧 Technical Details

### Data Model
```javascript
{
  settings: { commission_rate, competitor_rate, currency },
  categories: [{ id, name, description, image, inherited_modifier_group_ids }],
  items: [{ id, name, base_price, category_id, image_url, is_available, 
            local_modifier_group_ids, excluded_modifier_group_ids }],
  modifier_groups: [{ id, name, options: [{ name, extra_price, is_available }] }]
}
```

### Modifier Inheritance Logic
1. Combine local + inherited modifier IDs
2. Remove duplicates
3. Filter out excluded modifiers
4. Return full group objects with type indicator

### Image Compression
- Automatically compresses images > 500KB
- Resizes to max 800px width
- Quality set to 0.7 (70%)
- Helps stay under 5MB localStorage limit

### Storage Management
- Monitors localStorage usage
- Warns at 80% capacity
- Uses placeholder URLs for demo data
- Compresses uploaded images automatically

## 🧪 Testing the System

### Test 1: View Dashboard
- Open `index.html`
- Verify 3 categories appear (American, Italian, Mexican)
- Check item counts (American: 4, Italian: 3, Mexican: 3)
- Look for 86'd indicators (American: 1 86'd, Mexican: 1 86'd)

### Test 2: Category View
- Click on "American" category
- Verify 4 items appear
- Check that "Chicken Wings" is grayed out with "SOLD OUT" overlay
- Click back button to return to dashboard

### Test 3: Add New Item
- Click "Add New Item" button
- Fill in:
  - Name: "Test Burger"
  - Category: American
  - Price: 10.99
  - Description: "A test item"
- Click "Create Item"
- Verify item appears in American category

### Test 4: 86 Feature
- Find "Test Burger" (or any available item)
- Click the green circle icon
- Confirm the dialog
- Verify item is now grayed out with "SOLD OUT" badge
- Click the red X icon to make it available again

### Test 5: Modifier Inheritance
- Open "Chicken Burger" for editing
- Scroll to "MODIFIER GROUPS"
- Verify "Choose a Side" and "Drink Size" show 📂 Category icon
- Try to remove them - should see "Inherited" lock icon
- Add a new modifier from dropdown
- Verify it shows ☑️ Local icon and can be removed

### Test 6: Create Modifier Group
- Open any item drawer
- Click "+ Create New Group"
- Create a group called "Extra Toppings"
- Add 2-3 options with prices
- Save the group
- Add this new group to the item
- Verify it appears with Local icon

### Test 7: Profit Calculator
- Open any item for editing
- Change the price to 20.00
- Verify profit calculator updates:
  - "You take home: $17.00 on UDO"
  - "(vs. $14.00 on competitor) 🎉 Save $3.00"
- Change price to 10.00
- Verify numbers update correctly

### Test 8: Search
- On dashboard, type "burger" in search
- Verify American category appears (contains burger items)
- Type "mexican" in search
- Verify Mexican category appears
- Clear search to see all categories again

## 🐛 Known Limitations

1. **LocalStorage Size**: Limited to ~5MB per browser
   - Solution: Use placeholder URLs, compress images
2. **No Backend**: All data is local to browser
   - Perfect for demo/prototype
   - Would need backend integration for production
3. **Image Upload**: No server-side upload
   - Images stored as base64 in localStorage
   - Compression helps but large images still problematic

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Cloud image storage (S3, Cloudinary)
- [ ] Drag-and-drop reordering
- [ ] Bulk operations (import/export)
- [ ] Advanced search and filters
- [ ] Analytics and reporting
- [ ] Multi-location support
- [ ] User authentication

## 📞 Support

For issues or questions, refer to the inline code comments or check the browser console for error messages.

## 📄 License

This is a demo/prototype system for UDO restaurant partners.