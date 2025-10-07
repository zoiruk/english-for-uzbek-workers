/**
 * Progress Tracker System for English for Uzbek Seasonal Workers
 * Manages learning progress across all 24 chapters and 240 exercises
 */

class ProgressTracker {
    static STORAGE_KEY = 'uzbek-textbook-progress';
    static TOTAL_CHAPTERS = 24;
    static EXERCISES_PER_CHAPTER = 10;
    static TOTAL_EXERCISES = 240;
    static saveTimeout = null;
    static cachedProgress = null;
    static cacheTimestamp = 0;
    static CACHE_DURATION = 5000; // Cache for 5 seconds

    /**
     * Initialize default progress structure
     */
    static getDefaultProgress() {
        const defaultProgress = {
            chapters: {},
            overallProgress: 0,
            completionDate: null,
            studentName: "",
            certificateGenerated: false,
            lastAccessed: new Date().toISOString()
        };

        // Initialize all 24 chapters (Chapter 1 through Chapter 24)
        for (let i = 1; i <= 24; i++) {
            defaultProgress.chapters[i] = {
                completed: 0,
                total: this.EXERCISES_PER_CHAPTER,
                exercises: new Array(this.EXERCISES_PER_CHAPTER).fill(false),
                lastAccessed: null
            };
        }
        
        // Initialize Chapter 0 as a special foundation chapter (not counted in main progress)
        defaultProgress.chapters[0] = {
            completed: 0,
            total: this.EXERCISES_PER_CHAPTER,
            exercises: new Array(this.EXERCISES_PER_CHAPTER).fill(false),
            lastAccessed: null
        };

        return defaultProgress;
    }

    /**
     * Get current progress from localStorage with caching for performance
     */
    static getProgress() {
        try {
            // Check if we have a valid cached version
            const now = Date.now();
            if (this.cachedProgress && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
                return this.cachedProgress;
            }

            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                const defaultProgress = this.getDefaultProgress();
                this.cachedProgress = defaultProgress;
                this.cacheTimestamp = now;
                return defaultProgress;
            }

            const progress = JSON.parse(stored);
            
            // Ensure all chapters exist (for backward compatibility)
            for (let i = 1; i <= 24; i++) {
                if (!progress.chapters[i]) {
                    progress.chapters[i] = {
                        completed: 0,
                        total: this.EXERCISES_PER_CHAPTER,
                        exercises: new Array(this.EXERCISES_PER_CHAPTER).fill(false),
                        lastAccessed: null
                    };
                }
            }
            
            // Ensure Chapter 0 exists (foundation chapter, not counted in main progress)
            if (!progress.chapters[0]) {
                progress.chapters[0] = {
                    completed: 0,
                    total: this.EXERCISES_PER_CHAPTER,
                    exercises: new Array(this.EXERCISES_PER_CHAPTER).fill(false),
                    lastAccessed: null
                };
            }

            // Cache the result
            this.cachedProgress = progress;
            this.cacheTimestamp = now;

            return progress;
        } catch (error) {
            console.error('Error loading progress:', error);
            const defaultProgress = this.getDefaultProgress();
            this.cachedProgress = defaultProgress;
            this.cacheTimestamp = Date.now();
            return defaultProgress;
        }
    }

    /**
     * Invalidate cache when progress is updated
     */
    static invalidateCache() {
        this.cachedProgress = null;
        this.cacheTimestamp = 0;
    }

    /**
     * Save progress to localStorage with debouncing for performance
     */
    static saveProgress(progressData) {
        try {
            progressData.lastAccessed = new Date().toISOString();
            
            // Use debounced save to prevent excessive localStorage writes
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            
            this.saveTimeout = setTimeout(() => {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressData));
                this.saveTimeout = null;
            }, 100); // Debounce for 100ms
            
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            this.showStorageError();
            return false;
        }
    }

    /**
     * Immediate save for critical operations (like completion)
     */
    static saveProgressImmediate(progressData) {
        try {
            progressData.lastAccessed = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressData));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            this.showStorageError();
            return false;
        }
    }

    /**
     * Update exercise completion status with performance optimization
     */
    static updateExercise(chapterId, exerciseIndex, isCompleted) {
        // Validate chapter ID (0 is allowed as foundation chapter, 1-24 are main chapters)
        if (chapterId < 0 || chapterId > 24) {
            console.error(`Invalid chapter ID: ${chapterId}. Must be between 0 and 24.`);
            return false;
        }
        
        // Validate exercise index
        if (exerciseIndex < 0 || exerciseIndex >= this.EXERCISES_PER_CHAPTER) {
            console.error(`Invalid exercise index: ${exerciseIndex}. Must be between 0 and ${this.EXERCISES_PER_CHAPTER - 1}.`);
            return false;
        }
        
        const progress = this.getProgress();
        
        if (!progress.chapters[chapterId]) {
            console.error(`Chapter ${chapterId} not found`);
            return false;
        }

        const chapter = progress.chapters[chapterId];
        const wasCompleted = chapter.exercises[exerciseIndex];
        
        // Only update if status actually changed
        if (wasCompleted === isCompleted) {
            return true; // No change needed
        }
        
        // Update exercise status
        chapter.exercises[exerciseIndex] = isCompleted;
        
        // Recalculate chapter completion
        chapter.completed = chapter.exercises.filter(Boolean).length;
        chapter.lastAccessed = new Date().toISOString();
        
        // Update overall progress
        this.calculateOverallProgress(progress);
        
        // Check for course completion
        const wasCourseCompleted = progress.completionDate !== null;
        if (progress.overallProgress === 100 && !progress.completionDate) {
            progress.completionDate = new Date().toISOString();
        }
        
        // Invalidate cache since we're updating
        this.invalidateCache();
        
        // Use immediate save for completion or important milestones
        const isImportant = isCompleted || progress.overallProgress === 100 || !wasCourseCompleted;
        const saved = isImportant ? 
            this.saveProgressImmediate(progress) : 
            this.saveProgress(progress);
        
        if (saved) {
            // Dispatch custom event for UI updates
            this.dispatchProgressEvent(chapterId, exerciseIndex, isCompleted, wasCompleted);
        }
        
        return saved;
    }

    /**
     * Calculate overall progress percentage
     */
    static calculateOverallProgress(progress) {
        let totalCompleted = 0;
        
        // Only count chapters 1-24 for overall progress (Chapter 0 is foundation, not counted)
        for (let i = 1; i <= 24; i++) {
            if (progress.chapters[i]) {
                totalCompleted += progress.chapters[i].completed || 0;
            }
        }
        
        progress.overallProgress = Math.round((totalCompleted / this.TOTAL_EXERCISES) * 100);
        return progress.overallProgress;
    }

    /**
     * Get chapter progress
     */
    static getChapterProgress(chapterId) {
        const progress = this.getProgress();
        return progress.chapters[chapterId] || {
            completed: 0,
            total: this.EXERCISES_PER_CHAPTER,
            exercises: new Array(this.EXERCISES_PER_CHAPTER).fill(false),
            lastAccessed: null
        };
    }

    /**
     * Check if course is completed (all 250 exercises)
     */
    static isCourseCompleted() {
        const progress = this.getProgress();
        return progress.overallProgress === 100;
    }

    /**
     * Get completion statistics
     */
    static getCompletionStats() {
        const progress = this.getProgress();
        let totalCompleted = 0;
        let completedChapters = 0;
        
        // Only count chapters 1-24 for completion stats (Chapter 0 is foundation, not counted)
        for (let i = 1; i <= 24; i++) {
            if (progress.chapters[i]) {
                totalCompleted += progress.chapters[i].completed || 0;
                if (progress.chapters[i].completed === progress.chapters[i].total) {
                    completedChapters++;
                }
            }
        }
        
        return {
            totalExercises: this.TOTAL_EXERCISES,
            completedExercises: totalCompleted,
            totalChapters: this.TOTAL_CHAPTERS,
            completedChapters: completedChapters,
            overallProgress: progress.overallProgress,
            completionDate: progress.completionDate,
            canGenerateCertificate: this.isCourseCompleted() && !progress.certificateGenerated
        };
    }

    /**
     * Mark certificate as generated
     */
    static markCertificateGenerated(studentName) {
        const progress = this.getProgress();
        progress.certificateGenerated = true;
        progress.studentName = studentName;
        return this.saveProgress(progress);
    }

    /**
     * Reset all progress (for testing or fresh start)
     */
    static resetProgress() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this.dispatchProgressEvent('reset', null, false, false);
            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
            return false;
        }
    }

    /**
     * Export progress data
     */
    static exportProgress() {
        const progress = this.getProgress();
        const stats = this.getCompletionStats();
        
        return {
            exportDate: new Date().toISOString(),
            progress: progress,
            statistics: stats
        };
    }

    /**
     * Dispatch custom progress event for UI updates
     */
    static dispatchProgressEvent(chapterId, exerciseIndex, isCompleted, wasCompleted) {
        const event = new CustomEvent('progressUpdate', {
            detail: {
                chapterId,
                exerciseIndex,
                isCompleted,
                wasCompleted,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Show storage error message
     */
    static showStorageError() {
        const errorMsg = "Xatolik: Ma'lumotlarni saqlashda muammo. Brauzer sozlamalarini tekshiring.";
        
        // Try to show user-friendly error
        if (typeof window !== 'undefined' && window.alert) {
            alert(errorMsg);
        } else {
            console.error(errorMsg);
        }
    }

    /**
     * Initialize progress tracking for a chapter page
     */
    static initializeChapterPage(chapterId) {
        // Update last accessed time for chapter
        const progress = this.getProgress();
        if (progress.chapters[chapterId]) {
            progress.chapters[chapterId].lastAccessed = new Date().toISOString();
            this.saveProgress(progress);
        }
        
        // Add event listeners for exercise interactions
        this.setupExerciseListeners(chapterId);
        
        // Update UI with current progress
        this.updateChapterUI(chapterId);
    }

    /**
     * Setup event listeners for exercises on chapter page
     */
    static setupExerciseListeners(chapterId) {
        // Listen for exercise completion events
        document.addEventListener('exerciseCompleted', (event) => {
            const { exerciseIndex, isCorrect } = event.detail;
            this.updateExercise(chapterId, exerciseIndex, isCorrect);
        });
        
        // Listen for progress update events
        document.addEventListener('progressUpdate', (event) => {
            this.updateChapterUI(chapterId);
        });
    }

    /**
     * Update chapter page UI with progress
     */
    static updateChapterUI(chapterId) {
        const chapterProgress = this.getChapterProgress(chapterId);
        const progressPercent = Math.round((chapterProgress.completed / chapterProgress.total) * 100);
        
        // Update progress indicators
        const progressElements = document.querySelectorAll('.chapter-progress');
        progressElements.forEach(element => {
            element.textContent = `Progress: ${progressPercent}% (${chapterProgress.completed}/${chapterProgress.total})`;
        });
        
        // Update exercise status indicators
        chapterProgress.exercises.forEach((completed, index) => {
            const exerciseElement = document.querySelector(`[data-exercise="${index}"]`);
            if (exerciseElement) {
                exerciseElement.classList.toggle('completed', completed);
                
                // Add visual completion indicator
                this.updateExerciseVisualIndicator(exerciseElement, completed, index);
            }
        });
        
        // Update chapter progress bar if it exists
        this.updateChapterProgressBar(chapterId, progressPercent);
        
        // Update overall progress display
        this.updateOverallProgressDisplay();
    }

    /**
     * Update visual indicator for individual exercise
     */
    static updateExerciseVisualIndicator(exerciseElement, completed, exerciseIndex) {
        // Remove existing indicator
        const existingIndicator = exerciseElement.querySelector('.exercise-status-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'exercise-status-indicator';
        indicator.setAttribute('aria-label', completed ? 'Exercise completed' : 'Exercise not completed');
        
        if (completed) {
            indicator.innerHTML = `
                <div class="status-icon completed" title="Completed">
                    <span class="icon">✓</span>
                </div>
            `;
            indicator.classList.add('completed');
        } else {
            indicator.innerHTML = `
                <div class="status-icon not-completed" title="Not completed">
                    <span class="icon">${exerciseIndex + 1}</span>
                </div>
            `;
            indicator.classList.add('not-completed');
        }
        
        // Add to exercise element
        exerciseElement.style.position = 'relative';
        exerciseElement.appendChild(indicator);
    }

    /**
     * Update chapter progress bar
     */
    static updateChapterProgressBar(chapterId, progressPercent) {
        const progressBar = document.querySelector('.chapter-progress-bar');
        const progressFill = document.querySelector('.chapter-progress-fill');
        
        if (progressBar && progressFill) {
            progressFill.style.width = `${progressPercent}%`;
            
            // Add completion animation
            if (progressPercent === 100) {
                progressBar.classList.add('completed');
                this.showCompletionAnimation(chapterId);
            }
        }
    }

    /**
     * Update overall progress display
     */
    static updateOverallProgressDisplay() {
        const stats = this.getCompletionStats();
        
        // Update main progress bar on index page
        const overallProgressBar = document.getElementById('overall-progress');
        const overallProgressText = document.getElementById('progress-text');
        
        if (overallProgressBar) {
            overallProgressBar.style.width = `${stats.overallProgress}%`;
        }
        
        if (overallProgressText) {
            overallProgressText.textContent = 
                `Umumiy progress: ${stats.overallProgress}% (${stats.completedExercises}/${stats.totalExercises} mashqlar bajarildi)`;
        }
        
        // Update chapter cards on index page
        this.updateChapterCards();
    }

    /**
     * Update chapter cards on index page
     */
    static updateChapterCards() {
        const progress = this.getProgress();
        
        for (let chapterId = 1; chapterId <= 24; chapterId++) {
            const chapterProgress = progress.chapters[chapterId];
            if (!chapterProgress) continue;
            
            const progressPercent = Math.round((chapterProgress.completed / chapterProgress.total) * 100);
            
            // Update chapter card progress
            const chapterCard = document.querySelector(`[data-chapter-id="${chapterId}"]`);
            if (chapterCard) {
                const progressFill = chapterCard.querySelector('.chapter-progress-fill');
                const statusIcon = chapterCard.querySelector('.chapter-status-icon');
                
                if (progressFill) {
                    progressFill.style.width = `${progressPercent}%`;
                }
                
                if (statusIcon) {
                    statusIcon.className = 'chapter-status-icon';
                    
                    if (progressPercent === 100) {
                        statusIcon.classList.add('completed');
                        statusIcon.textContent = '✓';
                    } else if (progressPercent > 0) {
                        statusIcon.classList.add('in-progress');
                        statusIcon.textContent = `${progressPercent}%`;
                    } else {
                        statusIcon.classList.add('not-started');
                        statusIcon.textContent = '';
                    }
                }
            }
        }
    }

    /**
     * Show completion animation
     */
    static showCompletionAnimation(chapterId) {
        // Create completion notification
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <div class="notification-text">
                    <strong>Tabriklaymiz!</strong><br>
                    Chapter ${chapterId} completed!
                </div>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--md-sys-color-primary-container, #d3e3fd);
            color: var(--md-sys-color-on-primary-container, #001c38);
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .completion-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .completion-notification .notification-icon {
                font-size: 24px;
            }
            
            .completion-notification .notification-text {
                font-size: 14px;
                line-height: 1.4;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.5s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }

    /**
     * Create progress dashboard for detailed view
     */
    static createProgressDashboard() {
        const stats = this.getCompletionStats();
        const progress = this.getProgress();
        
        const dashboard = document.createElement('div');
        dashboard.className = 'progress-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>Learning Progress Dashboard</h3>
                <p>O'quv jarayoni statistikasi</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.overallProgress}%</div>
                    <div class="stat-label">Overall Progress</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${stats.completedExercises}</div>
                    <div class="stat-label">Exercises Completed</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${stats.completedChapters}</div>
                    <div class="stat-label">Chapters Completed</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-number">${stats.canGenerateCertificate ? 'Ready' : 'In Progress'}</div>
                    <div class="stat-label">Certificate Status</div>
                </div>
            </div>
            
            <div class="dashboard-chapters">
                <h4>Chapter Progress</h4>
                <div class="chapters-progress-list">
                    ${this.generateChapterProgressList(progress)}
                </div>
            </div>
        `;
        
        // Add dashboard styles
        this.addDashboardStyles();
        
        return dashboard;
    }

    /**
     * Generate chapter progress list HTML
     */
    static generateChapterProgressList(progress) {
        let html = '';
        
        for (let i = 1; i <= 24; i++) {
            const chapter = progress.chapters[i];
            const progressPercent = Math.round((chapter.completed / chapter.total) * 100);
            
            html += `
                <div class="chapter-progress-item">
                    <div class="chapter-info">
                        <span class="chapter-number">Chapter ${i}</span>
                        <span class="chapter-progress-text">${progressPercent}%</span>
                    </div>
                    <div class="chapter-progress-bar-small">
                        <div class="chapter-progress-fill-small" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="chapter-exercises">
                        ${chapter.exercises.map((completed, index) => 
                            `<span class="exercise-dot ${completed ? 'completed' : 'not-completed'}" 
                                   title="Exercise ${index + 1}: ${completed ? 'Completed' : 'Not completed'}"></span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Add dashboard styles
     */
    static addDashboardStyles() {
        if (document.getElementById('progress-dashboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'progress-dashboard-styles';
        style.textContent = `
            .progress-dashboard {
                background: var(--md-sys-color-surface, #fefbff);
                border-radius: 16px;
                padding: 24px;
                margin: 24px 0;
                box-shadow: var(--md-sys-elevation-level1, 0px 1px 3px rgba(0,0,0,0.12));
                border: 1px solid var(--md-sys-color-outline, #74777f);
            }
            
            .dashboard-header h3 {
                color: var(--md-sys-color-primary, #1976d2);
                margin-bottom: 4px;
                font-size: 1.5rem;
                font-weight: 500;
            }
            
            .dashboard-header p {
                color: var(--md-sys-color-on-surface-variant, #44474f);
                margin-bottom: 24px;
                font-size: 0.875rem;
            }
            
            .dashboard-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }
            
            .stat-card {
                background: var(--md-sys-color-primary-container, #d3e3fd);
                color: var(--md-sys-color-on-primary-container, #001c38);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 0.875rem;
                opacity: 0.8;
            }
            
            .dashboard-chapters h4 {
                color: var(--md-sys-color-primary, #1976d2);
                margin-bottom: 16px;
                font-size: 1.25rem;
                font-weight: 500;
            }
            
            .chapters-progress-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .chapter-progress-item {
                display: grid;
                grid-template-columns: 120px 1fr auto;
                gap: 16px;
                align-items: center;
                padding: 12px;
                background: var(--md-sys-color-surface-variant, #e1e2ec);
                border-radius: 8px;
            }
            
            .chapter-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .chapter-number {
                font-weight: 500;
                font-size: 0.875rem;
            }
            
            .chapter-progress-text {
                font-size: 0.75rem;
                color: var(--md-sys-color-primary, #1976d2);
                font-weight: 600;
            }
            
            .chapter-progress-bar-small {
                height: 6px;
                background: var(--md-sys-color-outline, #74777f);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .chapter-progress-fill-small {
                height: 100%;
                background: var(--md-sys-color-primary, #1976d2);
                transition: width 0.3s ease;
            }
            
            .chapter-exercises {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            
            .exercise-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
            }
            
            .exercise-dot.completed {
                background: var(--md-sys-color-success, #2e7d32);
            }
            
            .exercise-dot.not-completed {
                background: var(--md-sys-color-outline, #74777f);
            }
            
            .exercise-status-indicator {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 10;
            }
            
            .status-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                color: white;
                box-shadow: 0px 2px 4px rgba(0,0,0,0.2);
            }
            
            .status-icon.completed {
                background: var(--md-sys-color-success, #2e7d32);
                animation: completionPulse 0.6s ease-out;
            }
            
            .status-icon.not-completed {
                background: var(--md-sys-color-outline, #74777f);
                font-size: 12px;
            }
            
            @keyframes completionPulse {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .dashboard-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .chapter-progress-item {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                
                .chapter-exercises {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Show progress dashboard in a modal or dedicated area
     */
    static showProgressDashboard() {
        // Remove existing dashboard
        const existingDashboard = document.querySelector('.progress-dashboard-modal');
        if (existingDashboard) {
            existingDashboard.remove();
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'progress-dashboard-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="ProgressTracker.hideProgressDashboard()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Progress Dashboard</h2>
                    <button class="modal-close" onclick="ProgressTracker.hideProgressDashboard()" aria-label="Close dashboard">×</button>
                </div>
                <div class="modal-body">
                    ${this.createProgressDashboard().innerHTML}
                </div>
            </div>
        `;
        
        // Add modal styles
        this.addModalStyles();
        
        document.body.appendChild(modal);
        
        // Focus management for accessibility
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
        
        // Escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideProgressDashboard();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Hide progress dashboard modal
     */
    static hideProgressDashboard() {
        const modal = document.querySelector('.progress-dashboard-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    /**
     * Add modal styles
     */
    static addModalStyles() {
        if (document.getElementById('progress-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'progress-modal-styles';
        style.textContent = `
            .progress-dashboard-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                position: relative;
                background: var(--md-sys-color-surface, #fefbff);
                border-radius: 16px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0px 8px 24px rgba(0,0,0,0.2);
                animation: slideUp 0.3s ease-out;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 24px 0 24px;
                border-bottom: 1px solid var(--md-sys-color-outline, #74777f);
                margin-bottom: 24px;
            }
            
            .modal-header h2 {
                color: var(--md-sys-color-primary, #1976d2);
                font-size: 1.5rem;
                font-weight: 500;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--md-sys-color-on-surface-variant, #44474f);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
            }
            
            .modal-close:hover {
                background: var(--md-sys-color-surface-variant, #e1e2ec);
            }
            
            .modal-close:focus {
                outline: 2px solid var(--md-sys-color-primary, #1976d2);
                outline-offset: 2px;
            }
            
            .modal-body {
                padding: 0 24px 24px 24px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideUp {
                from { 
                    transform: translateY(20px);
                    opacity: 0;
                }
                to { 
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    max-width: 95vw;
                    max-height: 95vh;
                    margin: 16px;
                }
                
                .modal-header {
                    padding: 16px 16px 0 16px;
                }
                
                .modal-body {
                    padding: 0 16px 16px 16px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Add progress dashboard button to page
     */
    static addProgressDashboardButton() {
        // Check if button already exists
        if (document.querySelector('.progress-dashboard-btn')) return;
        
        const button = document.createElement('button');
        button.className = 'progress-dashboard-btn';
        button.innerHTML = '📊';
        button.setAttribute('aria-label', 'Show progress dashboard');
        button.setAttribute('title', 'View detailed progress');
        button.onclick = () => this.showProgressDashboard();
        
        // Add button styles
        button.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--md-sys-color-secondary, #565f71);
            color: var(--md-sys-color-on-secondary, #ffffff);
            border: none;
            cursor: pointer;
            font-size: 24px;
            box-shadow: var(--md-sys-elevation-level2, 0px 3px 6px rgba(0,0,0,0.16));
            transition: all 0.3s ease;
            z-index: 100;
        `;
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0px 6px 12px rgba(0,0,0,0.2)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = 'var(--md-sys-elevation-level2, 0px 3px 6px rgba(0,0,0,0.16))';
        });
        
        document.body.appendChild(button);
    }
}

// Make ProgressTracker available globally
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
    
    // Auto-add progress dashboard button on page load
    document.addEventListener('DOMContentLoaded', () => {
        ProgressTracker.addProgressDashboardButton();
    });
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}