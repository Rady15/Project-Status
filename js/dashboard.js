// إدارة لوحة التحكم والرسوم البيانية
class DashboardManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.isInitialized = false;
        this.updateInterval = null;
        
        // تأخير قصير للتأكد من تحميل جميع العناصر
        setTimeout(() => {
            if (!this.isInitialized) {
                this.updateStats();
                this.createCharts();
                this.loadRecentTasks();
                this.isInitialized = true;
                
                // إيقاف أي تحديث سابق
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
                
                // تحديث البيانات كل 60 ثانية (بدلاً من 30)
                this.updateInterval = setInterval(() => {
                    if (document.getElementById('dashboard').classList.contains('active')) {
                        this.updateStats();
                        this.updateCharts();
                        this.loadRecentTasks();
                    }
                }, 60000);
            }
        }, 500);
    }

    updateStats() {
        try {
            const projectStats = dataManager.getProjectStats();
            const taskStats = dataManager.getTaskStats();
            const users = dataManager.getData('users');

            // تحديث الإحصائيات السريعة مع فحص وجود العناصر
            const totalProjectsEl = document.getElementById('totalProjects');
            const totalTasksEl = document.getElementById('totalTasks');
            const completedTasksEl = document.getElementById('completedTasks');
            const totalMembersEl = document.getElementById('totalMembers');

            if (totalProjectsEl) totalProjectsEl.textContent = projectStats.total || 0;
            if (totalTasksEl) totalTasksEl.textContent = taskStats.total || 0;
            if (completedTasksEl) completedTasksEl.textContent = taskStats.completed || 0;
            if (totalMembersEl) totalMembersEl.textContent = users.length || 0;
        } catch (error) {
            console.error('خطأ في تحديث الإحصائيات:', error);
        }
    }

    createCharts() {
        this.createProjectsChart();
        this.createTasksChart();
    }

    createProjectsChart() {
        const ctx = document.getElementById('projectsChart');
        if (!ctx) {
            console.warn('عنصر projectsChart غير موجود');
            return;
        }

        // التحقق من وجود Chart.js
        if (typeof Chart === 'undefined') {
            console.error('مكتبة Chart.js غير محملة');
            return;
        }

        const projects = dataManager.getData('projects');
        if (!projects || projects.length === 0) {
            console.warn('لا توجد مشاريع لعرضها في الرسم البياني');
            return;
        }

        const projectNames = projects.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);
        const projectProgress = projects.map(p => p.progress || 0);

        // تدمير الرسم البياني السابق إذا كان موجوداً
        if (this.charts.projectsChart) {
            try {
                this.charts.projectsChart.destroy();
                this.charts.projectsChart = null;
            } catch (error) {
                console.warn('خطأ في تدمير الرسم البياني للمشاريع:', error);
            }
        }

        // التحقق من وجود رسم بياني آخر على نفس Canvas
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            try {
                existingChart.destroy();
            } catch (error) {
                console.warn('خطأ في تدمير الرسم البياني الموجود:', error);
            }
        }

        this.charts.projectsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: projectNames,
                datasets: [{
                    label: 'نسبة الإنجاز (%)',
                    data: projectProgress,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(241, 196, 15, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y}% مكتمل`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createTasksChart() {
        const ctx = document.getElementById('tasksChart');
        if (!ctx) {
            console.warn('عنصر tasksChart غير موجود');
            return;
        }

        // التحقق من وجود Chart.js
        if (typeof Chart === 'undefined') {
            console.error('مكتبة Chart.js غير محملة');
            return;
        }

        const taskStats = dataManager.getTaskStats();
        if (!taskStats) {
            console.warn('لا توجد إحصائيات مهام لعرضها');
            return;
        }

        // تدمير الرسم البياني السابق إذا كان موجوداً
        if (this.charts.tasksChart) {
            try {
                this.charts.tasksChart.destroy();
                this.charts.tasksChart = null;
            } catch (error) {
                console.warn('خطأ في تدمير الرسم البياني للمهام:', error);
            }
        }

        // التحقق من وجود رسم بياني آخر على نفس Canvas
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            try {
                existingChart.destroy();
            } catch (error) {
                console.warn('خطأ في تدمير الرسم البياني الموجود:', error);
            }
        }

        this.charts.tasksChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مكتملة', 'قيد التنفيذ', 'قيد الانتظار'],
                datasets: [{
                    data: [taskStats.completed, taskStats.inProgress, taskStats.pending],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderColor: [
                        'rgba(46, 204, 113, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(241, 196, 15, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    updateCharts() {
        try {
            // تحديث بيانات الرسوم البيانية فقط إذا كانت موجودة ومرئية
            const dashboardSection = document.getElementById('dashboard');
            if (!dashboardSection || !dashboardSection.classList.contains('active')) {
                return;
            }

            if (this.charts.projectsChart && this.charts.projectsChart.canvas) {
                const projects = dataManager.getData('projects');
                if (projects && projects.length > 0) {
                    const projectNames = projects.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);
                    const projectProgress = projects.map(p => p.progress || 0);
                    
                    this.charts.projectsChart.data.labels = projectNames;
                    this.charts.projectsChart.data.datasets[0].data = projectProgress;
                    this.charts.projectsChart.update('none'); // تحديث بدون رسوم متحركة
                }
            }

            if (this.charts.tasksChart && this.charts.tasksChart.canvas) {
                const taskStats = dataManager.getTaskStats();
                if (taskStats) {
                    this.charts.tasksChart.data.datasets[0].data = [
                        taskStats.completed || 0, 
                        taskStats.inProgress || 0, 
                        taskStats.pending || 0
                    ];
                    this.charts.tasksChart.update('none'); // تحديث بدون رسوم متحركة
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث الرسوم البيانية:', error);
        }
    }

    loadRecentTasks() {
        const tasks = dataManager.getData('tasks');
        const users = dataManager.getData('users');
        const projects = dataManager.getData('projects');
        
        // ترتيب المهام حسب آخر تحديث
        const recentTasks = tasks
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        const recentTasksList = document.getElementById('recentTasksList');
        if (!recentTasksList) return;

        recentTasksList.innerHTML = '';

        if (recentTasks.length === 0) {
            recentTasksList.innerHTML = '<p class="text-muted">لا توجد مهام حديثة</p>';
            return;
        }

        recentTasks.forEach(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>
                        <i class="fas fa-user"></i> ${assignee ? assignee.name : 'غير محدد'} |
                        <i class="fas fa-project-diagram"></i> ${project ? project.name : 'غير محدد'} |
                        <i class="fas fa-clock"></i> ${this.formatDate(task.updatedAt)}
                    </p>
                </div>
                <div class="task-status-container">
                    <span class="task-status status-${task.status}">${this.getStatusText(task.status)}</span>
                    <div class="task-progress-mini">
                        <div class="progress-bar-mini">
                            <div class="progress-fill-mini" style="width: ${task.progress}%"></div>
                        </div>
                        <span class="progress-text-mini">${task.progress}%</span>
                    </div>
                </div>
            `;

            recentTasksList.appendChild(taskElement);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتملة'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'أمس';
        } else if (diffDays < 7) {
            return `منذ ${diffDays} أيام`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }

    // تحديث الإحصائيات المتقدمة
    getAdvancedStats() {
        const projects = dataManager.getData('projects');
        const tasks = dataManager.getData('tasks');
        const users = dataManager.getData('users');

        // إحصائيات الإنتاجية
        const productivity = {
            averageTasksPerUser: tasks.length / users.length,
            averageCompletionTime: this.calculateAverageCompletionTime(tasks),
            onTimeCompletion: this.calculateOnTimeCompletion(tasks),
            overdueTasks: this.getOverdueTasks(tasks).length
        };

        // إحصائيات المشاريع
        const projectStats = {
            averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
            projectsOnTrack: projects.filter(p => this.isProjectOnTrack(p, tasks)).length,
            upcomingDeadlines: this.getUpcomingDeadlines(projects, 7).length
        };

        return {
            productivity,
            projectStats,
            totalUsers: users.length,
            activeProjects: projects.filter(p => p.status !== 'completed').length
        };
    }

    calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.timeSpent);
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((sum, t) => sum + t.timeSpent, 0);
        return totalTime / completedTasks.length;
    }

    calculateOnTimeCompletion(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.deadline);
        if (completedTasks.length === 0) return 100;
        
        const onTimeTasks = completedTasks.filter(t => {
            const completedDate = new Date(t.updatedAt);
            const deadline = new Date(t.deadline);
            return completedDate <= deadline;
        });
        
        return (onTimeTasks.length / completedTasks.length) * 100;
    }

    getOverdueTasks(tasks) {
        const now = new Date();
        return tasks.filter(t => {
            if (t.status === 'completed' || !t.deadline) return false;
            return new Date(t.deadline) < now;
        });
    }

    isProjectOnTrack(project, tasks) {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        if (projectTasks.length === 0) return true;
        
        const completedTasks = projectTasks.filter(t => t.status === 'completed');
        const actualProgress = (completedTasks.length / projectTasks.length) * 100;
        
        // مقارنة التقدم الفعلي مع التقدم المتوقع
        return actualProgress >= project.progress * 0.8; // هامش 20%
    }

    getUpcomingDeadlines(projects, days) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        return projects.filter(p => {
            if (!p.deadline || p.status === 'completed') return false;
            const deadline = new Date(p.deadline);
            return deadline >= now && deadline <= futureDate;
        });
    }

    // تصدير تقرير لوحة التحكم
    exportDashboardReport() {
        const stats = this.getAdvancedStats();
        const projects = dataManager.getData('projects');
        const tasks = dataManager.getData('tasks');
        
        const report = {
            generatedAt: new Date().toISOString(),
            summary: stats,
            projects: projects.map(p => ({
                name: p.name,
                progress: p.progress,
                status: p.status,
                deadline: p.deadline
            })),
            tasks: tasks.map(t => ({
                title: t.title,
                status: t.status,
                progress: t.progress,
                priority: t.priority
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// إنشاء مثيل عام لإدارة لوحة التحكم
const dashboardManager = new DashboardManager();