// إدارة المهام
class TasksManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.setupFilters();
    }

    setupEventListeners() {
        // زر إضافة مهمة جديدة
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.showAddTaskModal();
            });
        }

        // نموذج إضافة مهمة
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTask();
            });
        }

        // نموذج تحديث المهمة
        const taskUpdateForm = document.getElementById('taskUpdateForm');
        if (taskUpdateForm) {
            taskUpdateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateTask();
            });
        }

        // فلاتر المهام
        const projectFilter = document.getElementById('projectFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (projectFilter) {
            projectFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    setupFilters() {
        // تحميل قائمة المشاريع في الفلتر
        const projects = dataManager.getData('projects');
        const projectFilter = document.getElementById('projectFilter');
        
        if (projectFilter) {
            projectFilter.innerHTML = '<option value="">جميع المشاريع</option>';
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectFilter.appendChild(option);
            });
        }
    }

    loadTasks() {
        const tasks = dataManager.getData('tasks');
        const users = dataManager.getData('users');
        const projects = dataManager.getData('projects');
        const tasksList = document.getElementById('tasksList');

        if (!tasksList) return;

        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks fa-3x"></i>
                    <h3>لا توجد مهام</h3>
                    <p>ابدأ بإضافة مهمة جديدة</p>
                </div>
            `;
            return;
        }

        // ترتيب المهام حسب الأولوية والموعد النهائي
        const sortedTasks = tasks.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // إذا كانت الأولوية متساوية، رتب حسب الموعد النهائي
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            
            return 0;
        });

        sortedTasks.forEach(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            const taskCard = this.createTaskCard(task, assignee, project);
            tasksList.appendChild(taskCard);
        });
    }

    createTaskCard(task, assignee, project) {
        const card = document.createElement('div');
        card.className = 'task-card fade-in';
        
        const isOverdue = this.isTaskOverdue(task);
        const daysRemaining = this.calculateDaysRemaining(task.deadline);
        const currentUser = authManager.getCurrentUser();
        const canUpdate = currentUser && (currentUser.id === task.assigneeId || authManager.hasPermission('create_task'));
        
        card.innerHTML = `
            <div class="task-header">
                <div class="task-title-section">
                    <h4 class="task-title">${task.title}</h4>
                    <span class="task-priority priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                </div>
                <div class="task-status-section">
                    <span class="task-status status-${task.status}">${this.getStatusText(task.status)}</span>
                </div>
            </div>
            
            <div class="task-description">
                ${task.description || 'لا يوجد وصف'}
            </div>
            
            <div class="task-progress">
                <div class="progress-info">
                    <span>التقدم: ${task.progress}%</span>
                    ${task.timeSpent ? `<span>الوقت المستغرق: ${task.timeSpent} ساعة</span>` : ''}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="meta-row">
                    <div class="meta-item">
                        <i class="fas fa-project-diagram"></i>
                        <span>${project ? project.name : 'غير محدد'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${assignee ? assignee.name : 'غير محدد'}</span>
                    </div>
                </div>
                <div class="meta-row">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(task.deadline)}</span>
                    </div>
                    <div class="meta-item ${isOverdue ? 'text-danger' : daysRemaining < 3 ? 'text-warning' : ''}">
                        <i class="fas fa-clock"></i>
                        <span>${this.getDaysRemainingText(daysRemaining)}</span>
                    </div>
                </div>
            </div>
            
            ${task.notes ? `
                <div class="task-notes">
                    <strong>ملاحظات:</strong> ${task.notes}
                </div>
            ` : ''}
            
            <div class="task-actions">
                ${canUpdate ? `
                    <button class="btn btn-sm btn-primary" onclick="tasksManager.updateTask(${task.id})">
                        <i class="fas fa-edit"></i> تحديث
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="tasksManager.viewTask(${task.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                ${authManager.hasPermission('delete_task') ? `
                    <button class="btn btn-sm btn-danger" onclick="tasksManager.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                ` : ''}
            </div>
        `;

        return card;
    }

    showAddTaskModal() {
        if (!authManager.hasPermission('create_task')) {
            alert('ليس لديك صلاحية لإضافة مهام جديدة');
            return;
        }

        // تحميل قوائم المشاريع والمستخدمين
        this.loadProjectsAndUsers();
        
        // إظهار النافذة المنبثقة
        const modal = document.getElementById('taskModal');
        modal.classList.add('active');
        
        // تركيز على حقل عنوان المهمة
        setTimeout(() => {
            document.getElementById('taskTitle').focus();
        }, 100);
    }

    loadProjectsAndUsers() {
        const projects = dataManager.getData('projects');
        const users = dataManager.getData('users');
        
        // تحميل المشاريع
        const projectSelect = document.getElementById('taskProject');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">اختر المشروع</option>';
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
        }
        
        // تحميل المستخدمين
        const assigneeSelect = document.getElementById('taskAssignee');
        if (assigneeSelect) {
            assigneeSelect.innerHTML = '<option value="">اختر المكلف</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                assigneeSelect.appendChild(option);
            });
        }
    }

    handleAddTask() {
        const formData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            projectId: parseInt(document.getElementById('taskProject').value),
            assigneeId: parseInt(document.getElementById('taskAssignee').value),
            priority: document.getElementById('taskPriority').value,
            deadline: document.getElementById('taskDeadline').value
        };

        // التحقق من صحة البيانات
        if (!formData.title) {
            alert('يرجى إدخال عنوان المهمة');
            return;
        }

        if (!formData.projectId) {
            alert('يرجى اختيار المشروع');
            return;
        }

        if (!formData.assigneeId) {
            alert('يرجى اختيار المكلف بالمهمة');
            return;
        }

        // إضافة المهمة الجديدة
        const newTask = {
            ...formData,
            status: 'pending',
            progress: 0,
            timeSpent: 0,
            notes: ''
        };

        const addedTask = dataManager.addItem('tasks', newTask);
        
        if (addedTask) {
            // إغلاق النافذة المنبثقة
            this.closeModal('taskModal');
            
            // إعادة تحميل قائمة المهام
            this.loadTasks();
            
            // تحديث لوحة التحكم
            dashboardManager.updateStats();
            dashboardManager.updateCharts();
            dashboardManager.loadRecentTasks();
            
            // إظهار رسالة نجاح
            this.showSuccessMessage('تم إضافة المهمة بنجاح');
            
            // مسح النموذج
            document.getElementById('taskForm').reset();
        } else {
            alert('حدث خطأ أثناء إضافة المهمة');
        }
    }

    updateTask(taskId) {
        const task = dataManager.getItemById('tasks', taskId);
        const currentUser = authManager.getCurrentUser();
        
        if (!task) return;
        
        // التحقق من الصلاحيات
        if (!currentUser || (currentUser.id !== task.assigneeId && !authManager.hasPermission('create_task'))) {
            alert('ليس لديك صلاحية لتحديث هذه المهمة');
            return;
        }

        // تحميل بيانات المهمة في نموذج التحديث
        document.getElementById('updateTaskId').value = taskId;
        document.getElementById('updateTaskStatus').value = task.status;
        document.getElementById('updateTaskProgress').value = task.progress;
        document.getElementById('updateTaskNotes').value = task.notes || '';
        document.getElementById('updateTaskTimeSpent').value = task.timeSpent || 0;

        // إظهار نافذة التحديث
        document.getElementById('taskUpdateModal').classList.add('active');
    }

    handleUpdateTask() {
        const taskId = parseInt(document.getElementById('updateTaskId').value);
        const updates = {
            status: document.getElementById('updateTaskStatus').value,
            progress: parseInt(document.getElementById('updateTaskProgress').value),
            notes: document.getElementById('updateTaskNotes').value.trim(),
            timeSpent: parseFloat(document.getElementById('updateTaskTimeSpent').value) || 0
        };

        // تحديث المهمة
        const updatedTask = dataManager.updateItem('tasks', taskId, updates);
        
        if (updatedTask) {
            // إغلاق النافذة المنبثقة
            this.closeModal('taskUpdateModal');
            
            // إعادة تحميل قائمة المهام
            this.loadTasks();
            
            // تحديث تقدم المشروع
            this.updateProjectProgress(updatedTask.projectId);
            
            // تحديث لوحة التحكم
            dashboardManager.updateStats();
            dashboardManager.updateCharts();
            dashboardManager.loadRecentTasks();
            
            // إظهار رسالة نجاح
            this.showSuccessMessage('تم تحديث المهمة بنجاح');
        } else {
            alert('حدث خطأ أثناء تحديث المهمة');
        }
    }

    updateProjectProgress(projectId) {
        const tasks = dataManager.getData('tasks').filter(t => t.projectId === projectId);
        if (tasks.length === 0) return;

        // حساب متوسط تقدم المهام
        const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
        const averageProgress = Math.round(totalProgress / tasks.length);

        // تحديث تقدم المشروع
        dataManager.updateItem('projects', projectId, { progress: averageProgress });
    }

    viewTask(taskId) {
        const task = dataManager.getItemById('tasks', taskId);
        const users = dataManager.getData('users');
        const projects = dataManager.getData('projects');
        
        if (!task) return;
        
        const assignee = users.find(u => u.id === task.assigneeId);
        const project = projects.find(p => p.id === task.projectId);
        
        // إنشاء نافذة عرض تفاصيل المهمة
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'taskViewModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${task.title}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="task-details">
                    <div class="detail-section">
                        <h4>معلومات المهمة</h4>
                        <p><strong>الوصف:</strong> ${task.description || 'لا يوجد وصف'}</p>
                        <p><strong>المشروع:</strong> ${project ? project.name : 'غير محدد'}</p>
                        <p><strong>المكلف:</strong> ${assignee ? assignee.name : 'غير محدد'}</p>
                        <p><strong>الأولوية:</strong> <span class="task-priority priority-${task.priority}">${this.getPriorityText(task.priority)}</span></p>
                        <p><strong>الحالة:</strong> <span class="task-status status-${task.status}">${this.getStatusText(task.status)}</span></p>
                        <p><strong>نسبة الإنجاز:</strong> ${task.progress}%</p>
                        <p><strong>الموعد النهائي:</strong> ${this.formatDate(task.deadline)}</p>
                        <p><strong>الوقت المستغرق:</strong> ${task.timeSpent || 0} ساعة</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>التقدم</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${task.progress}%"></div>
                        </div>
                        <p class="progress-text">${task.progress}% مكتمل</p>
                    </div>
                    
                    ${task.notes ? `
                        <div class="detail-section">
                            <h4>ملاحظات</h4>
                            <p>${task.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h4>التواريخ</h4>
                        <p><strong>تاريخ الإنشاء:</strong> ${this.formatDateTime(task.createdAt)}</p>
                        <p><strong>آخر تحديث:</strong> ${this.formatDateTime(task.updatedAt)}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة حدث الإغلاق
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    deleteTask(taskId) {
        if (!authManager.hasPermission('delete_task')) {
            alert('ليس لديك صلاحية لحذف المهام');
            return;
        }

        const task = dataManager.getItemById('tasks', taskId);
        if (!task) return;

        if (confirm(`هل أنت متأكد من حذف المهمة "${task.title}"؟`)) {
            const deleted = dataManager.deleteItem('tasks', taskId);
            
            if (deleted) {
                // تحديث تقدم المشروع
                this.updateProjectProgress(task.projectId);
                
                // إعادة تحميل قائمة المهام
                this.loadTasks();
                
                // تحديث لوحة التحكم
                dashboardManager.updateStats();
                dashboardManager.updateCharts();
                dashboardManager.loadRecentTasks();
                
                // إظهار رسالة نجاح
                this.showSuccessMessage('تم حذف المهمة بنجاح');
            } else {
                alert('حدث خطأ أثناء حذف المهمة');
            }
        }
    }

    applyFilters() {
        const projectFilter = document.getElementById('projectFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        let tasks = dataManager.getData('tasks');
        
        // تطبيق فلتر المشروع
        if (projectFilter) {
            tasks = tasks.filter(task => task.projectId == projectFilter);
        }
        
        // تطبيق فلتر الحالة
        if (statusFilter) {
            tasks = tasks.filter(task => task.status === statusFilter);
        }
        
        // عرض المهام المفلترة
        this.displayFilteredTasks(tasks);
    }

    displayFilteredTasks(tasks) {
        const users = dataManager.getData('users');
        const projects = dataManager.getData('projects');
        const tasksList = document.getElementById('tasksList');

        if (!tasksList) return;

        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter fa-3x"></i>
                    <h3>لا توجد مهام تطابق الفلتر</h3>
                    <p>جرب تغيير معايير البحث</p>
                </div>
            `;
            return;
        }

        // ترتيب المهام
        const sortedTasks = tasks.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        sortedTasks.forEach(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            const taskCard = this.createTaskCard(task, assignee, project);
            tasksList.appendChild(taskCard);
        });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // دوال مساعدة
    getPriorityText(priority) {
        const priorityTexts = {
            'high': 'عالية',
            'medium': 'متوسطة',
            'low': 'منخفضة'
        };
        return priorityTexts[priority] || priority;
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتملة'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    formatDateTime(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA');
    }

    calculateDaysRemaining(deadline) {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysRemainingText(days) {
        if (days === null) return 'غير محدد';
        if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
        if (days === 0) return 'ينتهي اليوم';
        if (days === 1) return 'ينتهي غداً';
        return `${days} يوم متبقي`;
    }

    isTaskOverdue(task) {
        if (!task.deadline || task.status === 'completed') return false;
        return new Date(task.deadline) < new Date();
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(successDiv, mainContent.firstChild);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }
}

// إنشاء مثيل عام لإدارة المهام
const tasksManager = new TasksManager();