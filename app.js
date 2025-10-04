/**
 * Professional Task Manager with Progress Tracker (Multi-User)
 * Vanilla JS (ES6 Classes), HTML5, CSS
 * Features: Auth (username + PIN), user-isolated Local Storage, CRUD, DnD, Search, Filters
 */

/**
 * Task Class - Represents a single task
 */
class Task {
    constructor(title, priority = 'Medium', dueDate = null, group = '') {
        this.id = this.generateId();
        this.title = title.trim();
        this.isCompleted = false;
        this.priority = priority;
        this.dueDate = dueDate;
        this.group = group;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Generate unique ID using timestamp and random string
     */
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Toggle task completion status
     */
    toggleCompletion() {
        this.isCompleted = !this.isCompleted;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update task title
     */
    updateTitle(newTitle) {
        if (newTitle && newTitle.trim()) {
            this.title = newTitle.trim();
            this.updatedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    /**
     * Update task priority
     */
    updatePriority(newPriority) {
        if (['High', 'Medium', 'Low'].includes(newPriority)) {
            this.priority = newPriority;
            this.updatedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    /**
     * Update due date
     */
    updateDueDate(newDueDate) {
        this.dueDate = newDueDate;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update task group
     */
    updateGroup(newGroup) {
        this.group = newGroup;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Check if task is overdue
     */
    isOverdue() {
        if (!this.dueDate || this.isCompleted) return false;
        const today = new Date();
        const dueDate = new Date(this.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    /**
     * Get formatted due date
     */
    getFormattedDueDate() {
        if (!this.dueDate) return null;
        const date = new Date(this.dueDate);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Convert task to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            isCompleted: this.isCompleted,
            priority: this.priority,
            dueDate: this.dueDate,
            group: this.group,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Create Task instance from plain object
     */
    static fromJSON(data) {
        const task = new Task(data.title, data.priority, data.dueDate, data.group || '');
        task.id = data.id;
        task.isCompleted = data.isCompleted;
        task.createdAt = data.createdAt;
        task.updatedAt = data.updatedAt;
        return task;
    }
}

/**
 * UserStore - Handles users list and current session in Local Storage
 */
class UserStore {
    constructor() {
        this.USERS_KEY = 'TM_USERS';
        this.SESSION_KEY = 'TM_SESSION';
        this.users = this.loadUsers();
        this.session = this.loadSession();
    }

    loadUsers() {
        try {
            const raw = localStorage.getItem(this.USERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load users', e);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
        } catch (e) {
            console.error('Failed to save users', e);
        }
    }

    loadSession() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            return raw ? JSON.parse(raw) : { username: null, isLoggedIn: false };
        } catch (e) {
            return { username: null, isLoggedIn: false };
        }
    }

    saveSession() {
        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.session));
        } catch (e) {
            console.error('Failed to save session', e);
        }
    }

    findUser(username) {
        return this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    createUser(username, pin) {
        if (this.findUser(username)) return { ok: false, error: 'Username already exists' };
        const user = { username, pin, tasks: [] };
        this.users.push(user);
        this.saveUsers();
        return { ok: true, user };
    }

    login(username, pin) {
        const user = this.findUser(username);
        if (!user || user.pin !== pin) return { ok: false, error: 'Invalid credentials' };
        this.session = { username: user.username, isLoggedIn: true };
        this.saveSession();
        return { ok: true, user };
    }

    logout() {
        this.session = { username: null, isLoggedIn: false };
        this.saveSession();
    }

    getCurrentUser() {
        if (!this.session.isLoggedIn || !this.session.username) return null;
        return this.findUser(this.session.username) || null;
    }

    saveCurrentUserTasks(tasks) {
        const current = this.getCurrentUser();
        if (!current) return;
        current.tasks = tasks.map(t => t.toJSON());
        this.saveUsers();
    }

    getCurrentUserGroups() {
        const current = this.getCurrentUser();
        return current ? (current.groups || []) : [];
    }

    addGroup(groupName) {
        const current = this.getCurrentUser();
        if (!current) return { ok: false, error: 'No user logged in' };
        
        if (!current.groups) current.groups = [];
        
        if (current.groups.includes(groupName)) {
            return { ok: false, error: 'Group already exists' };
        }
        
        current.groups.push(groupName);
        this.saveUsers();
        return { ok: true, groups: current.groups };
    }

    removeGroup(groupName) {
        const current = this.getCurrentUser();
        if (!current) return { ok: false, error: 'No user logged in' };
        
        if (!current.groups) return { ok: false, error: 'No groups found' };
        
        const index = current.groups.indexOf(groupName);
        if (index === -1) {
            return { ok: false, error: 'Group not found' };
        }
        
        current.groups.splice(index, 1);
        this.saveUsers();
        return { ok: true, groups: current.groups };
    }
}

/**
 * TaskManager - manages tasks for the CURRENT logged in user
 */
class TaskManager {
    constructor() {
        if (TaskManager.instance) {
            return TaskManager.instance;
        }

        // Auth and session
        this.userStore = new UserStore();
        
        this.tasks = [];
        this.filteredTasks = [];
        this.currentFilter = {
            status: 'all',
            priority: 'all',
            search: '',
            sort: 'created',
            group: 'all',
            today: false
        };
        this.currentGroup = 'all';
        this.groups = [];

        try {
            this.cacheDom();
            this.initializeEventListeners();
            this.bootstrapView();
        } catch (error) {
            console.error('Error initializing TaskManager:', error);
            // Force hide preloader and show auth screen
            this.hidePreloader();
            if (this.authSection) this.authSection.style.display = 'flex';
            if (this.dashboardSection) this.dashboardSection.style.display = 'none';
        }

        // Ensure preloader is hidden after a maximum delay
        setTimeout(() => {
            this.hidePreloader();
        }, 1000);

        TaskManager.instance = this;
    }

    /** Cache frequently used DOM nodes */
    cacheDom() {
        // Core elements - these are required
        this.authSection = document.getElementById('auth-section');
        this.dashboardSection = document.getElementById('dashboard-section');
        this.preloader = document.getElementById('preloader');
        
        // Check if core elements exist
        if (!this.authSection || !this.dashboardSection) {
            console.error('Critical DOM elements not found');
            return;
        }
        
        // Optional elements
        this.currentUsernameEl = document.getElementById('current-username');

        // Auth elements
        this.loginTab = document.getElementById('login-tab');
        this.signupTab = document.getElementById('signup-tab');
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.logoutBtn = document.getElementById('logout-btn');

        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarUsername = document.getElementById('sidebar-username');
        this.logoutBtnSidebar = document.getElementById('logout-btn-sidebar');
        this.groupsContainer = document.getElementById('groups-container');
        this.addGroupBtn = document.getElementById('add-group-btn');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.allTasksNav = document.getElementById('all-tasks-nav');
        this.todayNav = document.getElementById('today-nav');

        // Export elements
        this.exportBtn = document.getElementById('export-btn');
        this.exportDropdown = document.getElementById('export-dropdown');
        this.printOption = document.getElementById('print-option');
        this.pdfOption = document.getElementById('pdf-option');

        // Empty state elements
        this.emptyStateCta = document.getElementById('empty-state-cta');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Auth tabs
        if (this.loginTab && this.signupTab) {
            this.loginTab.addEventListener('click', () => this.toggleAuthTab('login'));
            this.signupTab.addEventListener('click', () => this.toggleAuthTab('signup'));
        }

        // Login
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('login-username').value.trim();
                const pin = document.getElementById('login-pin').value.trim();
                if (!username || !pin) return this.showNotification('Enter username and PIN', 'error');
                const res = this.userStore.login(username, pin);
                if (!res.ok) return this.showNotification(res.error, 'error');
                this.showNotification('Welcome back!', 'success');
                this.bootstrapView();
            });
        }

        // Signup
        if (this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('signup-username').value.trim();
                const pin = document.getElementById('signup-pin').value.trim();
                const confirm = document.getElementById('confirm-pin').value.trim();
                if (pin !== confirm) return this.showNotification('PINs do not match', 'error');
                if (username.length < 3) return this.showNotification('Username too short', 'error');
                if (pin.length < 4 || pin.length > 6) return this.showNotification('PIN must be 4-6 digits', 'error');
                const res = this.userStore.createUser(username, pin);
                if (!res.ok) return this.showNotification(res.error, 'error');
                this.userStore.login(username, pin);
                this.showNotification('Account created!', 'success');
                this.bootstrapView();
            });
        }

        // Logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.userStore.logout();
                this.tasks = [];
                this.render();
                this.updateProgress();
                this.bootstrapView();
            });
        }

        // Sidebar logout
        if (this.logoutBtnSidebar) {
            this.logoutBtnSidebar.addEventListener('click', () => {
                this.userStore.logout();
                this.tasks = [];
                this.render();
                this.updateProgress();
                this.bootstrapView();
            });
        }

        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('open');
            });
        }

        // Export functionality - robust floating dropdown
        if (this.exportBtn) {
            const positionExportDropdown = () => {
                if (!this.exportDropdown || !this.exportBtn) return;
                const rect = this.exportBtn.getBoundingClientRect();
                // ensure dropdown is fixed to viewport so it escapes stacking contexts
                this.exportDropdown.style.position = 'fixed';
                this.exportDropdown.style.left = `${rect.left}px`;
                this.exportDropdown.style.top = `${rect.bottom + 8}px`;
                this.exportDropdown.style.minWidth = `${Math.max(rect.width, 200)}px`;
                this.exportDropdown.style.zIndex = '99999';
            };

            this._positionExportDropdown = positionExportDropdown;

            this.exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Move dropdown into body so it's not clipped by parent stacking contexts
                if (this.exportDropdown && !this.exportDropdown._movedToBody) {
                    this.exportDropdown._originalParent = this.exportDropdown.parentNode;
                    this.exportDropdown._nextSibling = this.exportDropdown.nextSibling;
                    document.body.appendChild(this.exportDropdown);
                    this.exportDropdown._movedToBody = true;
                }

                if (!this.exportDropdown) return;
                this.exportDropdown.classList.toggle('show');

                if (this.exportDropdown.classList.contains('show')) {
                    positionExportDropdown();
                    window.addEventListener('resize', this._positionExportDropdown);
                    window.addEventListener('scroll', this._positionExportDropdown, true);
                } else {
                    window.removeEventListener('resize', this._positionExportDropdown);
                    window.removeEventListener('scroll', this._positionExportDropdown, true);
                }
            });
        }

        if (this.printOption) {
            this.printOption.addEventListener('click', () => {
                // close and restore dropdown
                if (this.exportDropdown) this.exportDropdown.classList.remove('show');
                if (this.exportDropdown && this.exportDropdown._movedToBody) {
                    const parent = this.exportDropdown._originalParent || document.querySelector('.export-dropdown');
                    parent.insertBefore(this.exportDropdown, this.exportDropdown._nextSibling || null);
                    this.exportDropdown._movedToBody = false;
                    this.exportDropdown.style.position = '';
                    this.exportDropdown.style.left = '';
                    this.exportDropdown.style.top = '';
                    this.exportDropdown.style.minWidth = '';
                    this.exportDropdown.style.zIndex = '';
                }
                window.removeEventListener('resize', this._positionExportDropdown);
                window.removeEventListener('scroll', this._positionExportDropdown, true);
                this.printTasks();
            });
        }

        if (this.pdfOption) {
            this.pdfOption.addEventListener('click', () => {
                if (this.exportDropdown) this.exportDropdown.classList.remove('show');
                if (this.exportDropdown && this.exportDropdown._movedToBody) {
                    const parent = this.exportDropdown._originalParent || document.querySelector('.export-dropdown');
                    parent.insertBefore(this.exportDropdown, this.exportDropdown._nextSibling || null);
                    this.exportDropdown._movedToBody = false;
                    this.exportDropdown.style.position = '';
                    this.exportDropdown.style.left = '';
                    this.exportDropdown.style.top = '';
                    this.exportDropdown.style.minWidth = '';
                    this.exportDropdown.style.zIndex = '';
                }
                window.removeEventListener('resize', this._positionExportDropdown);
                window.removeEventListener('scroll', this._positionExportDropdown, true);
                this.saveAsPDF();
            });
        }

        // Close export dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.exportDropdown && !this.exportBtn.contains(e.target) && !this.exportDropdown.contains(e.target)) {
                this.exportDropdown.classList.remove('show');
                if (this.exportDropdown && this.exportDropdown._movedToBody) {
                    const parent = this.exportDropdown._originalParent || document.querySelector('.export-dropdown');
                    parent.insertBefore(this.exportDropdown, this.exportDropdown._nextSibling || null);
                    this.exportDropdown._movedToBody = false;
                    this.exportDropdown.style.position = '';
                    this.exportDropdown.style.left = '';
                    this.exportDropdown.style.top = '';
                    this.exportDropdown.style.minWidth = '';
                    this.exportDropdown.style.zIndex = '';
                }
                window.removeEventListener('resize', this._positionExportDropdown);
                window.removeEventListener('scroll', this._positionExportDropdown, true);
            }
        });

        // Group management
        if (this.addGroupBtn) {
            this.addGroupBtn.addEventListener('click', () => {
                this.showAddGroupDialog();
            });
        }

        // Empty state CTA
        if (this.emptyStateCta) {
            this.emptyStateCta.addEventListener('click', () => {
                document.getElementById('task-title').focus();
            });
        }

        // Sidebar navigation
        if (this.allTasksNav) {
            this.allTasksNav.addEventListener('click', () => {
                this.filterByAllTasks();
            });
        }

        if (this.todayNav) {
            this.todayNav.addEventListener('click', () => {
                console.log('Today nav clicked');
                this.filterByToday();
            });
        }



        // Task form submission
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Filter and search controls
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priority-filter').addEventListener('change', (e) => {
            this.currentFilter.priority = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sort-filter').addEventListener('change', (e) => {
            this.currentFilter.sort = e.target.value;
            this.applyFilters();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Task list event delegation
        const taskList = document.getElementById('task-list');
        taskList.addEventListener('click', (e) => this.handleTaskClick(e));
        taskList.addEventListener('dblclick', (e) => this.handleTaskDoubleClick(e));
        taskList.addEventListener('dragstart', (e) => this.handleDragStart(e));
        taskList.addEventListener('dragover', (e) => this.handleDragOver(e));
        taskList.addEventListener('drop', (e) => this.handleDrop(e));
        taskList.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    /**
     * Bootstrap view based on session state
     */
    bootstrapView() {
        try {
            const sessionUser = this.userStore.getCurrentUser();
            if (sessionUser) {
                // Show dashboard
                this.authSection.style.display = 'none';
                this.authSection.classList.add('hidden');
                this.dashboardSection.style.display = 'block';
                this.dashboardSection.classList.remove('hidden');
                
                if (this.currentUsernameEl) this.currentUsernameEl.textContent = sessionUser.username;
                if (this.sidebarUsername) this.sidebarUsername.textContent = sessionUser.username;
                
                this.loadTasks();
                this.loadGroups();
                this.updateGroupDropdown();
                this.applyFilters();
                this.updateProgress();
                
                const titleInput = document.getElementById('task-title');
                if (titleInput) titleInput.focus();
            } else {
                // Show auth
                this.authSection.style.display = 'flex';
                this.authSection.classList.remove('hidden');
                this.dashboardSection.style.display = 'none';
                this.dashboardSection.classList.add('hidden');
                this.toggleAuthTab('login');
            }
        } catch (error) {
            console.error('Error in bootstrapView:', error);
            // Fallback: show auth screen
            this.authSection.style.display = 'flex';
            this.authSection.classList.remove('hidden');
            this.dashboardSection.style.display = 'none';
            this.dashboardSection.classList.add('hidden');
        } finally {
            // Always hide preloader
            this.hidePreloader();
        }
    }

    /** Hide preloader with fade-out */
    hidePreloader() {
        if (!this.preloader) return;
        this.preloader.classList.add('hidden');
        // Remove from flow after transition
        setTimeout(() => {
            if (this.preloader && this.preloader.parentNode) {
                this.preloader.parentNode.removeChild(this.preloader);
            }
        }, 500);
    }

    /**
     * Filter by all tasks
     */
    filterByAllTasks() {
        this.currentFilter.today = false;
        this.currentFilter.status = 'all';
        this.currentFilter.priority = 'all';
        this.currentFilter.group = 'all';
        this.currentFilter.search = '';
        this.updateActiveNavItem('all-tasks-nav');
        this.applyFilters();
        
        // Reset the task list display
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        if (taskList && emptyState) {
            taskList.style.display = 'grid';
            emptyState.style.display = 'none';
        }
    }

    /**
     * Filter by today's tasks
     */
    filterByToday() {
        console.log('filterByToday called');
        this.currentFilter.today = true;
        this.currentFilter.status = 'all'; // Reset status filter when using today
        this.updateActiveNavItem('today-nav');
        this.applyFilters();
        this.showNotification('Showing today\'s tasks', 'info');
    }

    /**
     * Update active navigation item
     */
    updateActiveNavItem(activeId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to the specified nav item
        const activeItem = document.getElementById(activeId);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }


    /** Toggle between login and signup tabs */
    toggleAuthTab(which) {
        if (!this.loginTab || !this.signupTab) return;
        const makeActive = (el, active) => el.classList.toggle('active', active);
        makeActive(this.loginTab, which === 'login');
        makeActive(this.signupTab, which === 'signup');
        this.loginForm.classList.toggle('active', which === 'login');
        this.signupForm.classList.toggle('active', which === 'signup');
    }

    /**
     * Handle task form submission
     */
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('task-title');
        const prioritySelect = document.getElementById('task-priority');
        const groupSelect = document.getElementById('task-group');
        const dueDateInput = document.getElementById('task-due-date');

        const title = titleInput.value.trim();
        const priority = prioritySelect.value;
        const group = groupSelect.value || '';
        const dueDate = dueDateInput.value || null;

        // Validate title
        if (!title) {
            this.showNotification('Task title is required!', 'error');
            titleInput.focus();
            return;
        }

        // Validate priority
        if (!priority) {
            this.showNotification('Please select a priority!', 'error');
            prioritySelect.focus();
            return;
        }

        // Group is optional - no validation needed

        // Create new task
        const task = new Task(title, priority, dueDate, group);
        this.addTask(task);

        // Reset form
        const taskForm = document.getElementById('task-form');
        taskForm.reset();
        titleInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    /**
     * Add a new task
     */
    addTask(task) {
        this.tasks.unshift(task);
        this.saveTasks();
        this.applyFilters();
        this.updateProgress();
        
        console.log('Task added:', task.title, 'Total tasks:', this.tasks.length);
        
        // Visual entry effect for newest card
        setTimeout(() => {
            const firstCard = document.querySelector('#task-list .task-card');
            if (firstCard) firstCard.classList.add('just-added');
        }, 100);
    }

    /**
     * Update an existing task
     */
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            
            if (updates.title !== undefined) {
                task.updateTitle(updates.title);
            }
            if (updates.priority !== undefined) {
                task.updatePriority(updates.priority);
            }
            if (updates.dueDate !== undefined) {
                task.updateDueDate(updates.dueDate);
            }
            if (updates.isCompleted !== undefined) {
                task.isCompleted = updates.isCompleted;
                task.updatedAt = new Date().toISOString();
            }

            this.saveTasks();
            this.applyFilters();
            this.updateProgress();
        }
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.applyFilters();
            this.updateProgress();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    /**
     * Toggle task completion
     */
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.toggleCompletion();
            this.saveTasks();
            this.applyFilters();
            this.updateProgress();
        }
    }

    /**
     * Handle task click events
     */
    handleTaskClick(e) {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;

        const taskId = taskCard.dataset.taskId;

        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTaskCompletion(taskId);
        } else if (e.target.classList.contains('btn-edit')) {
            this.startInlineEdit(taskCard, taskId);
        } else if (e.target.classList.contains('btn-delete')) {
            this.deleteTask(taskId);
        }
    }

    /**
     * Handle task double-click for inline editing
     */
    handleTaskDoubleClick(e) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard && e.target.classList.contains('task-title')) {
            const taskId = taskCard.dataset.taskId;
            this.startInlineEdit(taskCard, taskId);
        }
    }

    /**
     * Start inline editing of task title
     */
    startInlineEdit(taskCard, taskId) {
        const titleElement = taskCard.querySelector('.task-title');
        const currentTitle = titleElement.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'task-title-edit';
        input.maxLength = 100;

        titleElement.style.display = 'none';
        titleElement.parentNode.insertBefore(input, titleElement);

        input.focus();
        input.select();

        const finishEdit = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                this.updateTask(taskId, { title: newTitle });
            }
            input.remove();
            titleElement.style.display = 'block';
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                input.remove();
                titleElement.style.display = 'block';
            }
        });
    }

    /**
     * Apply filters and search
     */
    applyFilters() {
        let filtered = [...this.tasks];

        console.log('Applying filters to', this.tasks.length, 'tasks');

        // Filter by today's tasks
        if (this.currentFilter.today) {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(task => task.dueDate === today);
            console.log('Filtered by today:', filtered.length, 'tasks');
        }

        // Filter by status
        if (this.currentFilter.status === 'active') {
            filtered = filtered.filter(task => !task.isCompleted);
        } else if (this.currentFilter.status === 'completed') {
            filtered = filtered.filter(task => task.isCompleted);
        }

        // Filter by priority
        if (this.currentFilter.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === this.currentFilter.priority);
        }

        // Filter by group
        if (this.currentFilter.group !== 'all') {
            filtered = filtered.filter(task => task.group === this.currentFilter.group);
        }

        // Filter by search
        if (this.currentFilter.search) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.currentFilter.search)
            );
        }

        // Sort tasks
        filtered = this.sortTasks(filtered);

        this.filteredTasks = filtered;
        console.log('Final filtered tasks:', this.filteredTasks.length);
        
        this.render();
    }

    /**
     * Sort tasks based on current sort option
     */
    sortTasks(tasks) {
        const sortBy = this.currentFilter.sort;
        
        return tasks.sort((a, b) => {
            switch (sortBy) {
                case 'due-date-asc':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'due-date-desc':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate) - new Date(a.dueDate);
                
                case 'priority':
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                
                case 'title':
                    return a.title.localeCompare(b.title);
                
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    /**
     * Render tasks to DOM
     */
    render() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');

        if (!taskList || !emptyState) {
            console.error('Task list or empty state elements not found');
            return;
        }

        console.log('Rendering tasks:', this.filteredTasks.length, 'filtered tasks');

        if (this.filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        taskList.style.display = 'grid';
        emptyState.style.display = 'none';

        taskList.innerHTML = this.filteredTasks.map(task => this.createTaskCard(task)).join('');
        
        console.log('Tasks rendered successfully');
    }

    /**
     * Create HTML for a task card
     */
    createTaskCard(task) {
        const isOverdue = task.isOverdue();
        const formattedDueDate = task.getFormattedDueDate();
        
        return `
            <div class="task-card ${task.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-task-id="${task.id}" 
                 draggable="true">
                <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" 
                     data-task-id="${task.id}"></div>
                
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}</span>
                        ${task.group ? `<span class="task-group"><i class="fas fa-tag"></i> ${this.escapeHtml(task.group)}</span>` : ''}
                        ${formattedDueDate ? `
                            <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${formattedDueDate}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-secondary btn-sm btn-edit" 
                            data-task-id="${task.id}" 
                            title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete" 
                            data-task-id="${task.id}" 
                            title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update progress dashboard
     */
    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.isCompleted).length;
        const pendingTasks = totalTasks - completedTasks;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
        const pctEl = document.getElementById('progress-percentage');
        pctEl.textContent = `${progressPercentage}%`;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
        // Pulse feedback
        pctEl.classList.remove('pulse');
        // force reflow to restart animation
        void pctEl.offsetWidth;
        pctEl.classList.add('pulse');
    }

    /**
     * Drag and Drop handlers
     */
    handleDragStart(e) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', taskCard.outerHTML);
            e.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const taskList = document.getElementById('task-list');
        taskList.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const taskList = document.getElementById('task-list');
        taskList.classList.remove('drag-over');
        
        const draggedTaskId = e.dataTransfer.getData('text/plain');
        const afterElement = this.getDragAfterElement(taskList, e.clientY);
        const draggedTask = this.tasks.find(task => task.id === draggedTaskId);
        
        if (draggedTask) {
            // Remove from current position
            this.tasks = this.tasks.filter(task => task.id !== draggedTaskId);
            
            // Insert at new position
            if (afterElement == null) {
                this.tasks.push(draggedTask);
            } else {
                const afterIndex = this.tasks.findIndex(task => task.id === afterElement.dataset.taskId);
                this.tasks.splice(afterIndex, 0, draggedTask);
            }
            
            this.saveTasks();
            this.applyFilters();
        }
    }

    handleDragEnd(e) {
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.remove('dragging');
        }
        const taskList = document.getElementById('task-list');
        taskList.classList.remove('drag-over');
    }

    /**
     * Get element after which to drop the dragged element
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Save tasks to Local Storage
     */
    saveTasks() {
        try {
            const tasksData = this.tasks.map(task => task.toJSON());
            // Persist tasks under current user profile
            this.userStore.saveCurrentUserTasks(this.tasks);
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            this.showNotification('Error saving tasks!', 'error');
        }
    }

    /**
     * Load tasks from Local Storage
     */
    loadTasks() {
        try {
            const current = this.userStore.getCurrentUser();
            if (current && Array.isArray(current.tasks)) {
                this.tasks = current.tasks.map(taskData => Task.fromJSON(taskData));
                console.log('Loaded', this.tasks.length, 'tasks from storage');
            } else {
                this.tasks = [];
                console.log('No tasks found in storage');
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            this.showNotification('Error loading tasks!', 'error');
            this.tasks = [];
        }
    }

    /**
     * Load groups from storage
     */
    loadGroups() {
        this.groups = this.userStore.getCurrentUserGroups();
        this.renderGroups();
    }

    /**
     * Render groups in sidebar
     */
    renderGroups() {
        if (!this.groupsContainer) return;
        
        this.groupsContainer.innerHTML = this.groups.map(group => `
            <div class="group-item" data-group="${group}">
                <span><i class="fas fa-folder"></i> ${this.escapeHtml(group)}</span>
                <button class="btn btn-sm btn-danger" onclick="taskManager.removeGroup('${group}')" title="Remove group"><i class="fas fa-times"></i></button>
            </div>
        `).join('');

        // Add click handlers for group filtering
        this.groupsContainer.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    const group = item.dataset.group;
                    this.filterByGroup(group);
                }
            });
        });
    }

    /**
     * Show add group dialog
     */
    showAddGroupDialog() {
        const groupName = prompt('Enter group name:');
        if (groupName && groupName.trim()) {
            const result = this.userStore.addGroup(groupName.trim());
            if (result.ok) {
                this.loadGroups();
                this.updateGroupDropdown();
                this.showNotification('Group added successfully!', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        }
    }

    /**
     * Remove group
     */
    removeGroup(groupName) {
        if (confirm(`Are you sure you want to remove the group "${groupName}"?`)) {
            const result = this.userStore.removeGroup(groupName);
            if (result.ok) {
                this.loadGroups();
                this.updateGroupDropdown();
                this.showNotification('Group removed successfully!', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        }
    }

    /**
     * Filter by group
     */
    filterByGroup(group) {
        this.currentFilter.group = group;
        this.applyFilters();
        
        // Update active group in sidebar
        document.querySelectorAll('.group-item').forEach(item => {
            item.classList.toggle('active', item.dataset.group === group);
        });
    }

    /**
     * Update group dropdown in task form
     */
    updateGroupDropdown() {
        const groupSelect = document.getElementById('task-group');
        if (!groupSelect) return;

        // Clear existing options except the first one
        groupSelect.innerHTML = '<option value="">Select Group</option>';
        
        // Add group options
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    }

    /**
     * Print tasks
     */
    printTasks() {
        const printWindow = window.open('', '_blank');
        const tasks = this.filteredTasks.length > 0 ? this.filteredTasks : this.tasks;
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Task List - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .task { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; }
                    .completed { text-decoration: line-through; opacity: 0.7; }
                    .priority { font-weight: bold; }
                    .group { color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Task List</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                ${tasks.map(task => `
                    <div class="task ${task.isCompleted ? 'completed' : ''}">
                        <div class="priority">${task.priority}</div>
                        <div>${task.title}</div>
                        ${task.group ? `<div class="group">Group: ${task.group}</div>` : ''}
                        ${task.dueDate ? `<div>Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
                    </div>
                `).join('')}
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Save as PDF
     */
    saveAsPDF() {
        // Use the same print functionality but trigger PDF save
        this.printTasks();
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.taskManager = new TaskManager();
        console.log('Professional Task Manager (Multi-User) initialized');
    } catch (error) {
        console.error('Failed to initialize TaskManager:', error);
        // Fallback: hide preloader and show basic interface
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.style.display = 'flex';
        }
    }
});

// Additional fallback for slow loading
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        console.log('Force hiding preloader after timeout');
        preloader.style.display = 'none';
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.style.display = 'flex';
        }
    }
}, 3000);

/**
 * Service Worker registration for offline capability (optional enhancement)
 */
// Service worker optional — intentionally disabled for simplicity in this project demo
