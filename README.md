<<<<<<< HEAD
# 📋 Professional Task Manager

A modern, professional task management web application built with vanilla HTML, CSS, and JavaScript (ES6 Classes). Features a clean, light-themed SaaS design inspired by Confluence/Atlassian aesthetics with vibrant blue accents.

## 🚀 Live Demo

The application is running locally at `http://localhost:8000`

## ✨ Features

### 🔐 **Authentication System**
- **Multi-user support** with username + PIN authentication
- **User isolation** - each user's tasks are stored separately
- **Session persistence** - stay logged in across browser sessions
- **Secure local storage** - data persists locally per user

### 📋 **Task Management**
- **Create tasks** with title, priority (High/Medium/Low), due date, and optional group
- **Edit tasks** inline by double-clicking or using the edit button
- **Mark tasks complete** with visual feedback
- **Delete tasks** with confirmation dialog
- **Drag & drop reordering** for task prioritization
- **Task validation** - title and priority are required, group is optional

### 🏷️ **Organization & Filtering**
- **Task Groups** - organize tasks into custom categories
- **Today Filter** - view only tasks due today
- **Priority Filtering** - filter by High, Medium, or Low priority
- **Status Filtering** - view All, Active, or Completed tasks
- **Search functionality** - find tasks by title
- **Smart sorting** - by creation date, due date, priority, or title

### 📊 **Progress Tracking**
- **Real-time statistics** - Total, Completed, and Pending task counts
- **Visual progress bar** - completion percentage with smooth animations
- **Progress notifications** - visual feedback on task completion

### 📤 **Export & Print**

### Note about Export dropdown alignment
The Export dropdown position was previously fixed to the right of the viewport which caused the options (Print / Save as PDF) to appear on the right side instead of below the Export button. This has been fixed by anchoring the dropdown to its trigger using relative/absolute positioning in `style.css` (.export-dropdown / .export-dropdown-content).

### 🎨 **Professional Design**
- **Light theme** - clean, modern SaaS aesthetic
- **Vibrant blue accents** - professional color scheme (#2563eb)
- **Responsive design** - works perfectly on desktop, tablet, and mobile
- **Smooth animations** - subtle transitions and micro-interactions
- **Accessibility features** - focus states, high contrast support, reduced motion

### 📱 **Responsive Layout**
- **Split-screen login** - engaging hero section with feature highlights
- **Fixed sidebar navigation** - professional dashboard layout
- **Mobile-optimized** - collapsible sidebar for mobile devices
- **Flexible grid system** - adapts to all screen sizes

## 🛠️ **Technical Stack**

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Classes)
- **Storage:** Browser Local Storage (user-isolated)
- **Architecture:** Object-oriented design with Task and TaskManager classes
- **Styling:** CSS Custom Properties (CSS Variables) for consistent theming
- **Icons:** Unicode emoji icons for cross-platform compatibility

## 📁 **Project Structure**

```
Professional Task Manager/
├── index.html          # Main HTML structure
├── style.css           # Complete CSS styling with light theme
├── app.js              # JavaScript application logic
└── README.md           # This documentation file
```

## 🚀 **Getting Started**

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation & Setup

1. **Clone or download** the project files
2. **Navigate** to the project directory
3. **Start the local server:**
   ```bash
   python -m http.server 8000
   ```
4. **Open your browser** and visit `http://localhost:8000`

### First Time Setup

1. **Create an account** using the Sign Up form
   - Choose a username (3-20 characters)
   - Create a 4-6 digit PIN
   - Confirm your PIN

2. **Login** with your credentials

3. **Start managing tasks!**

## 📖 **User Guide**

### 🔐 **Authentication**
- **Sign Up:** Create a new account with username and PIN
- **Login:** Access your account with existing credentials
- **Logout:** Sign out from the sidebar or header

### 📝 **Creating Tasks**
1. **Enter task title** (required)
2. **Select priority** - High, Medium, or Low (required)
3. **Choose a group** (optional) - create custom groups for organization
4. **Set due date** (optional) - click the date picker
5. **Click "Add Task"** to create

### 🏷️ **Managing Groups**
- **Add Group:** Click "+ Add Group" in the sidebar
- **Filter by Group:** Click any group name to filter tasks
- **Remove Group:** Click the "×" button next to group names

### 🔍 **Filtering & Search**
- **All Tasks:** View all your tasks
- **Today:** See only tasks due today
- **Search:** Type in the search box to find specific tasks
- **Priority Filter:** Filter by High, Medium, or Low priority
- **Status Filter:** View All, Active, or Completed tasks
- **Sort Options:** Sort by creation date, due date, priority, or title

### ✅ **Task Actions**
- **Complete:** Click the checkbox to mark as done
- **Edit:** Double-click the title or use the edit button
- **Delete:** Click the delete button (trash icon)
- **Reorder:** Drag and drop tasks to change order

### 📤 **Exporting Tasks**
- **Print:** Click Export → "Print To-Do List"
- **PDF:** Click Export → "Save as PDF"
- **Professional formatting** includes all task details

### ❓ **Help & Support**
- **Help Section:** Click "Help" in the sidebar for:
  - Contact information
  - Getting started guide
  - Usage tips and tricks
  - Feature explanations

## 🎨 **Design Features**

### **Color Scheme**
- **Primary Blue:** #2563eb (vibrant professional blue)
- **Background:** Soft white (#ffffff) and light gray (#f8fafc)
- **Text:** Dark gray (#1e293b) for excellent readability
- **Accents:** Blue highlights for interactive elements

### **Typography**
- **Font Family:** System fonts (San Francisco, Segoe UI, Roboto)
- **Hierarchy:** Clear heading and body text sizing
- **Accessibility:** High contrast ratios for readability

### **Layout**
- **Split-screen Login:** 60/40 ratio with hero section
- **Fixed Sidebar:** 280px width with navigation
- **Responsive Grid:** Adapts to all screen sizes
- **Professional Spacing:** Consistent margins and padding

## 🔧 **Technical Details**

### **Data Storage**
- **User Isolation:** Each user's data is stored separately
- **Local Storage Keys:**
  - `TM_USERS`: All user accounts and their tasks
  - `TM_SESSION`: Current user session
- **Data Persistence:** Tasks and groups persist across sessions

### **JavaScript Architecture**
- **Task Class:** Represents individual tasks with methods for updates
- **TaskManager Class:** Singleton pattern for managing tasks and UI
- **UserStore Class:** Handles user authentication and data storage
- **Event Delegation:** Efficient event handling for dynamic content

### **CSS Architecture**
- **CSS Custom Properties:** Consistent theming with CSS variables
- **Mobile-first Design:** Responsive breakpoints for all devices
- **Component-based Styling:** Modular CSS for maintainability
- **Animation System:** Smooth transitions and micro-interactions

## 🌟 **Key Features Highlights**

### **Professional SaaS Design**
- Clean, modern interface inspired by Confluence/Atlassian
- Light theme with vibrant blue accents
- Professional typography and spacing
- Smooth animations and transitions

### **Multi-user Support**
- User isolation with separate data storage
- Secure authentication system
- Session persistence across browser restarts

### **Advanced Task Management**
- Comprehensive task creation with all necessary fields
- Optional group organization system
- Multiple filtering and sorting options
- Drag & drop task reordering

### **Export Capabilities**
- Print-friendly task lists
- PDF export functionality
- Professional formatting with all task details

### **Responsive Design**
- Works perfectly on desktop, tablet, and mobile
- Collapsible sidebar for mobile devices
- Flexible grid layouts that adapt to screen size

## 📞 **Support & Contact**

For support and questions about the Task Manager:

- **Email:** support@taskmanager.com
- **Phone:** +1 (555) 123-4567
- **Website:** www.taskmanager.com

## 👨‍💻 **Developer**

**Made by Dipanjan Basak @2025**

This project demonstrates modern web development practices using vanilla HTML, CSS, and JavaScript with ES6 Classes, professional design principles, and comprehensive user experience features.

## 📄 **License**

This project is created for educational and portfolio purposes. Feel free to use and modify for your own projects.

---

*Built with ❤️ using modern web technologies and professional design principles.*
=======
# -Professional-Task-Manager
A modern, professional task management web application built with vanilla HTML, CSS, and JavaScript (ES6 Classes). Features a clean, light-themed SaaS design inspired by Confluence/Atlassian aesthetics with vibrant blue accents.
>>>>>>> a2e70c1fb6e566fb2ea0e6f78022caa1eec7f452
