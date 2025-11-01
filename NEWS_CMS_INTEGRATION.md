# News CMS Integration - Complete Guide

## ✅ Integration Complete!

The News and NewsCategory modules have been fully integrated into the AgriWeb admin CMS.

## 📦 What Was Created

### 1. API Service (`src/lib/api/news.ts`)
Complete TypeScript service for both News and NewsCategory endpoints:
- ✅ Type definitions for News and NewsCategory
- ✅ All CRUD operations
- ✅ Special operations (toggle publish, toggle featured, reorder categories)
- ✅ Pagination support
- ✅ Filter and search support

### 2. Admin Pages

#### News Management (`/admin/news`)
- **List Page** (`src/app/admin/news/page.tsx`)
  - View all news with pagination
  - Filter by category, published status
  - Search functionality
  - Toggle publish/featured status
  - Quick edit and delete actions
  - View count display

- **Create Page** (`src/app/admin/news/new/page.tsx`)
  - Create new news articles
  - Full form with all fields

- **Edit Page** (`src/app/admin/news/[id]/page.tsx`)
  - Edit existing news
  - Pre-filled form with current data

#### News Categories Management (`/admin/news-categories`)
- **List Page** (`src/app/admin/news-categories/page.tsx`)
  - View all categories
  - Display order management
  - Toggle active/inactive status
  - News count per category
  - Quick edit and delete actions
  - Color and icon preview

### 3. Components

#### NewsForm (`src/components/admin/NewsForm.tsx`)
Full-featured form component with:
- ✅ Title and slug fields
- ✅ Category selection
- ✅ Summary and content (textarea)
- ✅ Thumbnail URL input with preview
- ✅ Multiple images support
- ✅ Tags management (add/remove)
- ✅ Author field
- ✅ Publish and featured checkboxes
- ✅ Form validation
- ✅ Loading states

#### NewsCategoryModal (`src/components/admin/NewsCategoryModal.tsx`)
Modal form for categories with:
- ✅ Name and slug fields
- ✅ Description textarea
- ✅ Icon (emoji) input
- ✅ Color picker
- ✅ Display order
- ✅ Active status toggle
- ✅ Live preview
- ✅ Create and edit modes

### 4. Navigation
Updated AdminSidebar with new menu items:
- 📰 Tin tức → `/admin/news`
- 🏷️ Danh mục tin tức → `/admin/news-categories`

## 🎯 Features Implemented

### News Management
1. **List View**
   - Paginated table with 10 items per page
   - Thumbnail preview
   - Category badge with icon
   - View count display
   - Status badges (Published/Draft, Featured/Normal)
   - Quick toggle buttons
   - Search by title, summary, content
   - Filter by category and publish status

2. **Create/Edit Form**
   - Rich form with all fields
   - Auto-slug generation (optional)
   - Category dropdown with icons
   - Image URL inputs with preview
   - Tag management system
   - Publish and featured toggles
   - Validation and error handling

3. **Actions**
   - Toggle publish status (one click)
   - Toggle featured status (one click)
   - Edit (navigate to edit page)
   - Delete (with confirmation)

### Category Management
1. **List View**
   - Table with display order
   - Icon and color preview
   - News count per category
   - Active/inactive status
   - Quick toggle active status
   - Edit and delete actions

2. **Create/Edit Modal**
   - Name and slug fields
   - Description textarea
   - Emoji icon picker
   - Color picker with hex input
   - Display order number
   - Active status checkbox
   - Live preview of category card
   - Validation

## 🚀 How to Use

### Managing Categories

1. **Create a Category**
   ```
   1. Go to /admin/news-categories
   2. Click "Thêm danh mục"
   3. Fill in the form:
      - Name: "Chăn nuôi"
      - Icon: "🐄"
      - Color: Pick a color
      - Description: "Tin tức về chăn nuôi"
   4. Click "Tạo mới"
   ```

2. **Edit a Category**
   ```
   1. Click the Edit icon on any category
   2. Update the fields
   3. Click "Cập nhật"
   ```

3. **Toggle Active Status**
   ```
   - Click the status badge to toggle
   - Active categories show in news form
   ```

4. **Delete a Category**
   ```
   - Click the Delete icon
   - Confirm deletion
   - Note: Cannot delete if category has news
   ```

### Managing News

1. **Create News**
   ```
   1. Go to /admin/news
   2. Click "Thêm tin tức"
   3. Fill in the form:
      - Title (required)
      - Category (select from dropdown)
      - Summary (optional)
      - Content (required)
      - Thumbnail URL
      - Add images
      - Add tags
      - Author name
      - Check "Xuất bản ngay" to publish
      - Check "Tin nổi bật" for featured
   4. Click "Tạo mới"
   ```

2. **Edit News**
   ```
   1. Click the Edit icon on any news
   2. Update the fields
   3. Click "Cập nhật"
   ```

3. **Toggle Publish**
   ```
   - Click the "Đã xuất bản" or "Bản nháp" badge
   - Status changes immediately
   ```

4. **Toggle Featured**
   ```
   - Click the "Nổi bật" or "Thường" badge
   - Only available for published news
   ```

5. **Filter and Search**
   ```
   - Use search box to find news
   - Filter by category dropdown
   - Filter by publish status
   ```

## 📊 API Endpoints Used

### News
- `GET /news` - List all news (with filters)
- `GET /news/published` - List published news
- `GET /news/featured` - Get featured news
- `GET /news/:id` - Get news by ID
- `GET /news/slug/:slug` - Get news by slug
- `POST /news` - Create news
- `PATCH /news/:id` - Update news
- `PATCH /news/:id/publish` - Toggle publish
- `PATCH /news/:id/featured` - Toggle featured
- `DELETE /news/:id` - Delete news

### Categories
- `GET /news-categories` - List all categories
- `GET /news-categories/active` - List active categories
- `GET /news-categories/:id` - Get category by ID
- `POST /news-categories` - Create category
- `PATCH /news-categories/:id` - Update category
- `PATCH /news-categories/:id/toggle-active` - Toggle active
- `DELETE /news-categories/:id` - Delete category

## 🎨 UI Features

### Design Elements
- ✅ Consistent with existing admin design
- ✅ Green color scheme (#10B981)
- ✅ Responsive layout
- ✅ Loading states with spinners
- ✅ Error handling with retry buttons
- ✅ Confirmation dialogs for destructive actions
- ✅ Toast notifications (via alerts)
- ✅ Icon integration (Lucide React)

### User Experience
- ✅ Intuitive navigation
- ✅ Quick actions (toggle buttons)
- ✅ Visual feedback (hover states, active states)
- ✅ Form validation
- ✅ Preview functionality
- ✅ Pagination controls
- ✅ Search and filter

## 📝 File Structure

```
agriweb/
├── src/
│   ├── app/
│   │   └── admin/
│   │       ├── news/
│   │       │   ├── page.tsx (List)
│   │       │   ├── new/
│   │       │   │   └── page.tsx (Create)
│   │       │   └── [id]/
│   │       │       └── page.tsx (Edit)
│   │       └── news-categories/
│   │           └── page.tsx (List & Manage)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── NewsForm.tsx
│   │   │   └── NewsCategoryModal.tsx
│   │   └── layout/
│   │       └── AdminSidebar.tsx (Updated)
│   └── lib/
│       └── api/
│           └── news.ts (New)
```

## 🔐 Authentication

All admin pages are protected by:
- JWT authentication
- Role-based access (ADMIN only)
- Handled by `ProtectedRoute` component

## 🌐 Vietnamese Language

All UI text is in Vietnamese:
- Menu items
- Form labels
- Button text
- Status messages
- Confirmation dialogs

## ✨ Next Steps (Optional Enhancements)

1. **Rich Text Editor**
   - Integrate TinyMCE or Quill for content editing
   - Better formatting options

2. **Image Upload**
   - Direct image upload instead of URLs
   - Integration with upload service

3. **Drag & Drop Reordering**
   - Reorder categories by dragging
   - Reorder featured news

4. **Bulk Actions**
   - Select multiple news
   - Bulk publish/unpublish
   - Bulk delete

5. **Preview Mode**
   - Preview news before publishing
   - See how it looks on frontend

6. **SEO Fields**
   - Meta title
   - Meta description
   - Keywords

7. **Scheduled Publishing**
   - Set publish date/time
   - Auto-publish at scheduled time

8. **Analytics**
   - View statistics
   - Popular news
   - Category performance

## 🎉 Ready to Use!

The News CMS is fully integrated and ready to use. Navigate to:
- **News Management**: http://localhost:3000/admin/news
- **Category Management**: http://localhost:3000/admin/news-categories

All features are working and connected to the backend API!
