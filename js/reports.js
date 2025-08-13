// إدارة التقارير والرسوم البيانية المتقدمة
class ReportsManager {
    constructor() {
        this.charts = {};
        this.isInitialized = false;
        this.lastUpdateTime = null;
        this.init();
    }

    init() {
        // لا نقوم بإنشاء التقارير تلقائياً، فقط عند الحاجة
        console.log('تم تهيئة مدير التقارير');
    }

    createReports() {
        // منع إعادة الإنشاء إذا كانت التقارير موجودة بالفعل
        if (this.isInitialized) {
            console.log('التقارير مهيأة بالفعل');
            return;
        }

        try {
            this.createProductivityChart();
            this.createTimeChart();
            this.isInitialized = true;
            console.log('تم إنشاء التقارير بنجاح');
        } catch (error) {
            console.error('خطأ في إنشاء التقارير:', error);
        }
    }

    updateCharts() {
        try {
            // تحديث الرسوم البيانية فقط إذا كان قسم التقارير مرئي
            const reportsSection = document.getElementById('reports');
            if (!reportsSection || !reportsSection.classList.contains('active')) {
                console.log('قسم التقارير غير مرئي، تم تخطي التحديث');
                return;
            }

            // منع التحديث المتكرر
            const now = Date.now();
            if (this.lastUpdateTime && (now - this.lastUpdateTime) < 2000) {
                console.log('تم تخطي التحديث لمنع التكرار');
                return;
            }
            this.lastUpdateTime = now;

            // إنشاء الرسوم البيانية فقط إذا لم تكن موجودة
            if (!this.isInitialized) {
                console.log('إنشاء رسوم التقارير للمرة الأولى');
                this.createReports();
            } else {
                console.log('تحديث البيانات الموجودة فقط');
                this.updateExistingCharts();
            }
        } catch (error) {
            console.error('خطأ في تحديث رسوم التقارير:', error);
        }
    }

    updateExistingCharts() {
        // تحديث الرسوم البيانية الموجودة بدون إعادة إنشاء
        if (this.charts.productivityChart && this.charts.productivityChart.canvas) {
            const teamStats = dataManager.getTeamStats();
            if (teamStats && teamStats.length > 0) {
                this.charts.productivityChart.data.labels = teamStats.map(member => member.name);
                this.charts.productivityChart.data.datasets[0].data = teamStats.map(member => member.productivity);
                this.charts.productivityChart.data.datasets[1].data = teamStats.map(member => member.completedTasks);
                this.charts.productivityChart.update('none');
            }
        }

        if (this.charts.timeChart && this.charts.timeChart.canvas) {
            const projects = dataManager.getData('projects');
            if (projects && projects.length > 0) {
                const projectTimes = projects.map(project => {
                    const tasks = dataManager.getData('tasks').filter(t => t.projectId === project.id);
                    return tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
                });
                
                this.charts.timeChart.data.labels = projects.map(p => p.name);
                this.charts.timeChart.data.datasets[0].data = projectTimes;
                this.charts.timeChart.update('none');
            }
        }
    }

    createProductivityChart() {
        const ctx = document.getElementById('productivityChart');
        if (!ctx) {
            console.warn('عنصر productivityChart غير موجود');
            return;
        }

        // التحقق من وجود Chart.js
        if (typeof Chart === 'undefined') {
            console.error('مكتبة Chart.js غير محملة');
            return;
        }

        // منع إعادة الإنشاء إذا كان الرسم موجود ومرئي
        if (this.charts.productivityChart && this.charts.productivityChart.canvas) {
            console.log('الرسم البياني للإنتاجية موجود بالفعل');
            return;
        }

        const teamStats = dataManager.getTeamStats();
        if (!teamStats || teamStats.length === 0) {
            console.warn('لا توجد إحصائيات فريق لعرضها');
            return;
        }

        const memberNames = teamStats.map(member => member.name);
        const productivityData = teamStats.map(member => member.productivity || 0);
        const completedTasks = teamStats.map(member => member.completedTasks || 0);

        // تدمير الرسم البياني السابق إذا كان موجوداً
        if (this.charts.productivityChart) {
            try {
                this.charts.productivityChart.destroy();
                this.charts.productivityChart = null;
            } catch (error) {
                console.warn('خطأ في تدمير رسم الإنتاجية:', error);
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

        this.charts.productivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: memberNames,
                datasets: [
                    {
                        label: 'نسبة الإنتاجية (%)',
                        data: productivityData,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'المهام المكتملة',
                        data: completedTasks,
                        type: 'line',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'تقرير الإنتاجية والمهام المكتملة'
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `الإنتاجية: ${context.parsed.y.toFixed(1)}%`;
                                } else {
                                    return `المهام المكتملة: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'أعضاء الفريق'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'نسبة الإنتاجية (%)'
                        },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'عدد المهام المكتملة'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createTimeChart() {
        const ctx = document.getElementById('timeChart');
        if (!ctx) {
            console.warn('عنصر timeChart غير موجود');
            return;
        }

        // التحقق من وجود Chart.js
        if (typeof Chart === 'undefined') {
            console.error('مكتبة Chart.js غير محملة');
            return;
        }

        // منع إعادة الإنشاء إذا كان الرسم موجود ومرئي
        if (this.charts.timeChart && this.charts.timeChart.canvas) {
            console.log('الرسم البياني للوقت موجود بالفعل');
            return;
        }

        const teamStats = dataManager.getTeamStats();
        const projects = dataManager.getData('projects');
        const tasks = dataManager.getData('tasks');

        if (!projects || projects.length === 0) {
            console.warn('لا توجد مشاريع لعرضها في رسم الوقت');
            return;
        }

        // تجميع الوقت المستغرق حسب المشروع
        const projectTimeData = projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const totalTime = projectTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
            return {
                name: project.name,
                time: totalTime,
                tasksCount: projectTasks.length
            };
        }).filter(p => p.time > 0);

        if (projectTimeData.length === 0) {
            console.warn('لا توجد بيانات وقت لعرضها');
            return;
        }

        // تدمير الرسم البياني السابق إذا كان موجوداً
        if (this.charts.timeChart) {
            try {
                this.charts.timeChart.destroy();
                this.charts.timeChart = null;
            } catch (error) {
                console.warn('خطأ في تدمير رسم الوقت:', error);
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

        this.charts.timeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: projectTimeData.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
                datasets: [{
                    label: 'الوقت المستغرق (ساعات)',
                    data: projectTimeData.map(p => p.time),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)',
                        'rgba(83, 102, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع الوقت المستغرق حسب المشاريع'
                    },
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
                                const project = projectTimeData[context.dataIndex];
                                const percentage = ((context.parsed / projectTimeData.reduce((sum, p) => sum + p.time, 0)) * 100).toFixed(1);
                                return [
                                    `${context.label}`,
                                    `الوقت: ${context.parsed} ساعة`,
                                    `المهام: ${project.tasksCount}`,
                                    `النسبة: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1500
                }
            }
        });
    }

    // إنشاء تقرير مفصل
    generateDetailedReport() {
        const projects = dataManager.getData('projects');
        const tasks = dataManager.getData('tasks');
        const users = dataManager.getData('users');
        const teamStats = dataManager.getTeamStats();

        // إحصائيات عامة
        const generalStats = {
            totalProjects: projects.length,
            completedProjects: projects.filter(p => p.status === 'completed').length,
            inProgressProjects: projects.filter(p => p.status === 'in-progress').length,
            pendingProjects: projects.filter(p => p.status === 'pending').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            totalUsers: users.length,
            totalTimeSpent: tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)
        };

        // تحليل الأداء
        const performanceAnalysis = {
            averageProjectProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
            averageTaskCompletion: (generalStats.completedTasks / generalStats.totalTasks) * 100,
            averageProductivity: teamStats.reduce((sum, m) => sum + m.productivity, 0) / teamStats.length,
            mostProductiveMember: teamStats.reduce((max, member) => 
                member.productivity > max.productivity ? member : max, teamStats[0]),
            leastProductiveMember: teamStats.reduce((min, member) => 
                member.productivity < min.productivity ? member : min, teamStats[0])
        };

        // المشاريع المتأخرة
        const overdueProjects = projects.filter(project => {
            if (!project.deadline || project.status === 'completed') return false;
            return new Date(project.deadline) < new Date();
        });

        // المهام المتأخرة
        const overdueTasks = tasks.filter(task => {
            if (!task.deadline || task.status === 'completed') return false;
            return new Date(task.deadline) < new Date();
        });

        // تحليل الأولويات
        const priorityAnalysis = {
            highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
            mediumPriorityTasks: tasks.filter(t => t.priority === 'medium').length,
            lowPriorityTasks: tasks.filter(t => t.priority === 'low').length,
            completedHighPriority: tasks.filter(t => t.priority === 'high' && t.status === 'completed').length
        };

        return {
            generatedAt: new Date().toISOString(),
            reportPeriod: this.getReportPeriod(),
            generalStats,
            performanceAnalysis,
            overdueProjects: overdueProjects.map(p => ({
                name: p.name,
                deadline: p.deadline,
                progress: p.progress,
                daysOverdue: this.calculateDaysOverdue(p.deadline)
            })),
            overdueTasks: overdueTasks.map(t => ({
                title: t.title,
                assignee: users.find(u => u.id === t.assigneeId)?.name || 'غير محدد',
                deadline: t.deadline,
                progress: t.progress,
                daysOverdue: this.calculateDaysOverdue(t.deadline)
            })),
            priorityAnalysis,
            teamPerformance: teamStats.map(member => ({
                name: member.name,
                role: member.role,
                productivity: member.productivity,
                totalTasks: member.totalTasks,
                completedTasks: member.completedTasks,
                timeSpent: member.timeSpent
            })),
            projectsAnalysis: projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedProjectTasks = projectTasks.filter(t => t.status === 'completed');
                return {
                    name: project.name,
                    progress: project.progress,
                    status: project.status,
                    totalTasks: projectTasks.length,
                    completedTasks: completedProjectTasks.length,
                    totalTime: projectTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
                    efficiency: projectTasks.length > 0 ? (completedProjectTasks.length / projectTasks.length) * 100 : 0
                };
            })
        };
    }

    // عرض التقرير المفصل
    showDetailedReport() {
        const report = this.generateDetailedReport();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'detailedReportModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="modal-header">
                    <h3>التقرير المفصل</h3>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-success" onclick="reportsManager.exportDetailedReport()">
                            <i class="fas fa-download"></i> تصدير
                        </button>
                        <button class="btn btn-sm btn-info" onclick="reportsManager.printReport()">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                        <span class="close">&times;</span>
                    </div>
                </div>
                <div class="report-content">
                    <div class="report-section">
                        <h4>الإحصائيات العامة</h4>
                        <div class="stats-grid-report">
                            <div class="stat-item-report">
                                <span class="stat-label">إجمالي المشاريع</span>
                                <span class="stat-value">${report.generalStats.totalProjects}</span>
                            </div>
                            <div class="stat-item-report">
                                <span class="stat-label">المشاريع المكتملة</span>
                                <span class="stat-value">${report.generalStats.completedProjects}</span>
                            </div>
                            <div class="stat-item-report">
                                <span class="stat-label">إجمالي المهام</span>
                                <span class="stat-value">${report.generalStats.totalTasks}</span>
                            </div>
                            <div class="stat-item-report">
                                <span class="stat-label">المهام المكتملة</span>
                                <span class="stat-value">${report.generalStats.completedTasks}</span>
                            </div>
                            <div class="stat-item-report">
                                <span class="stat-label">إجمالي الساعات</span>
                                <span class="stat-value">${report.generalStats.totalTimeSpent}</span>
                            </div>
                            <div class="stat-item-report">
                                <span class="stat-label">أعضاء الفريق</span>
                                <span class="stat-value">${report.generalStats.totalUsers}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <h4>تحليل الأداء</h4>
                        <div class="performance-metrics">
                            <p><strong>متوسط تقدم المشاريع:</strong> ${report.performanceAnalysis.averageProjectProgress.toFixed(1)}%</p>
                            <p><strong>معدل إنجاز المهام:</strong> ${report.performanceAnalysis.averageTaskCompletion.toFixed(1)}%</p>
                            <p><strong>متوسط الإنتاجية:</strong> ${report.performanceAnalysis.averageProductivity.toFixed(1)}%</p>
                            <p><strong>أكثر الأعضاء إنتاجية:</strong> ${report.performanceAnalysis.mostProductiveMember?.name || 'غير محدد'} (${report.performanceAnalysis.mostProductiveMember?.productivity.toFixed(1)}%)</p>
                        </div>
                    </div>
                    
                    ${report.overdueProjects.length > 0 ? `
                        <div class="report-section">
                            <h4>المشاريع المتأخرة (${report.overdueProjects.length})</h4>
                            <div class="overdue-list">
                                ${report.overdueProjects.map(project => `
                                    <div class="overdue-item">
                                        <strong>${project.name}</strong>
                                        <span class="overdue-days">متأخر ${project.daysOverdue} يوم</span>
                                        <span class="progress-small">${project.progress}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${report.overdueTasks.length > 0 ? `
                        <div class="report-section">
                            <h4>المهام المتأخرة (${report.overdueTasks.length})</h4>
                            <div class="overdue-list">
                                ${report.overdueTasks.map(task => `
                                    <div class="overdue-item">
                                        <strong>${task.title}</strong>
                                        <span class="assignee">${task.assignee}</span>
                                        <span class="overdue-days">متأخر ${task.daysOverdue} يوم</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="report-section">
                        <h4>تحليل الأولويات</h4>
                        <div class="priority-analysis">
                            <div class="priority-item">
                                <span class="priority-label high">عالية الأولوية</span>
                                <span class="priority-count">${report.priorityAnalysis.highPriorityTasks}</span>
                            </div>
                            <div class="priority-item">
                                <span class="priority-label medium">متوسطة الأولوية</span>
                                <span class="priority-count">${report.priorityAnalysis.mediumPriorityTasks}</span>
                            </div>
                            <div class="priority-item">
                                <span class="priority-label low">منخفضة الأولوية</span>
                                <span class="priority-count">${report.priorityAnalysis.lowPriorityTasks}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <h4>أداء الفريق</h4>
                        <div class="team-performance-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>الاسم</th>
                                        <th>الدور</th>
                                        <th>الإنتاجية</th>
                                        <th>إجمالي المهام</th>
                                        <th>المكتملة</th>
                                        <th>الساعات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.teamPerformance.map(member => `
                                        <tr>
                                            <td>${member.name}</td>
                                            <td>${this.getRoleText(member.role)}</td>
                                            <td>${member.productivity.toFixed(1)}%</td>
                                            <td>${member.totalTasks}</td>
                                            <td>${member.completedTasks}</td>
                                            <td>${member.timeSpent}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
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

    // تصدير التقرير المفصل
    exportDetailedReport() {
        const report = this.generateDetailedReport();
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detailed_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // طباعة التقرير
    printReport() {
        window.print();
    }

    // دوال مساعدة
    getReportPeriod() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
            from: startOfMonth.toISOString(),
            to: now.toISOString(),
            period: `${now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`
        };
    }

    calculateDaysOverdue(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = now - deadlineDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getRoleText(role) {
        const roleTexts = {
            'admin': 'مدير عام',
            'manager': 'مدير',
            'employee': 'موظف'
        };
        return roleTexts[role] || role;
    }

}