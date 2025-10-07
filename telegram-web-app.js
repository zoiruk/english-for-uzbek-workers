// Telegram Mini App Integration
class TelegramWebApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isInTelegram = !!this.tg;
        this.init();
    }

    init() {
        if (!this.isInTelegram) {
            console.log('Not running in Telegram WebApp');
            return;
        }

        // Initialize Telegram WebApp
        this.tg.ready();
        this.tg.expand();
        
        // Set theme
        this.setupTheme();
        
        // Setup main button
        this.setupMainButton();
        
        // Setup back button
        this.setupBackButton();
        
        // Setup haptic feedback
        this.setupHaptics();
        
        // Setup viewport
        this.setupViewport();
    }

    setupTheme() {
        if (!this.tg) return;
        
        const themeParams = this.tg.themeParams;
        const root = document.documentElement;
        
        // Apply Telegram theme colors
        if (themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', themeParams.bg_color);
        }
        if (themeParams.text_color) {
            root.style.setProperty('--tg-text-color', themeParams.text_color);
        }
        if (themeParams.hint_color) {
            root.style.setProperty('--tg-hint-color', themeParams.hint_color);
        }
        if (themeParams.link_color) {
            root.style.setProperty('--tg-link-color', themeParams.link_color);
        }
        if (themeParams.button_color) {
            root.style.setProperty('--tg-button-color', themeParams.button_color);
        }
        if (themeParams.button_text_color) {
            root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
        }
    }

    setupMainButton() {
        if (!this.tg) return;
        
        const mainButton = this.tg.MainButton;
        
        // Configure main button based on current page
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                mainButton.setText('Start Learning');
                mainButton.onClick(() => {
                    window.location.href = 'Chapter_0_Foundations_Alphabet_Numbers.html';
                });
                mainButton.show();
                break;
            case 'chapter':
                mainButton.setText('Next Chapter');
                mainButton.onClick(() => {
                    this.goToNextChapter();
                });
                mainButton.show();
                break;
            case 'completion':
                mainButton.setText('Get Certificate');
                mainButton.onClick(() => {
                    this.generateCertificate();
                });
                mainButton.show();
                break;
            default:
                mainButton.hide();
        }
    }

    setupBackButton() {
        if (!this.tg) return;
        
        const backButton = this.tg.BackButton;
        
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            backButton.onClick(() => {
                this.goBack();
            });
            backButton.show();
        }
    }

    setupHaptics() {
        if (!this.tg) return;
        
        // Add haptic feedback to interactive elements
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .chapter-card, .exercise-button')) {
                this.tg.HapticFeedback.impactOccurred('light');
            }
        });
        
        // Success haptic for correct answers
        document.addEventListener('exercise-correct', () => {
            this.tg.HapticFeedback.notificationOccurred('success');
        });
        
        // Error haptic for incorrect answers
        document.addEventListener('exercise-incorrect', () => {
            this.tg.HapticFeedback.notificationOccurred('error');
        });
    }

    setupViewport() {
        if (!this.tg) return;
        
        // Handle viewport changes
        this.tg.onEvent('viewportChanged', () => {
            this.adjustLayout();
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'index';
        if (path.includes('Chapter_')) return 'chapter';
        if (path.includes('course-completion')) return 'completion';
        return 'other';
    }

    goToNextChapter() {
        // Logic to navigate to next chapter
        const currentChapter = this.getCurrentChapterNumber();
        if (currentChapter < 24) {
            const nextChapter = currentChapter + 1;
            const nextChapterFile = this.getChapterFileName(nextChapter);
            window.location.href = nextChapterFile;
        } else {
            window.location.href = 'course-completion.html';
        }
    }

    getCurrentChapterNumber() {
        const path = window.location.pathname;
        const match = path.match(/Chapter_(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    getChapterFileName(chapterNumber) {
        if (chapterNumber === 0) return 'Chapter_0_Foundations_Alphabet_Numbers.html';
        if (chapterNumber === 1) return 'English_for_Uzbek_Seasonal_Workers.html';
        
        const chapterNames = {
            2: 'Numbers_Time',
            3: 'Objects_Colours',
            4: 'Basic_Verbs',
            5: 'Adjectives_Adverbs',
            6: 'Accommodation_Furniture',
            7: 'Transportation_Travel',
            8: 'Places_Navigation',
            9: 'Shopping_Transactions',
            10: 'Clothing_Weather',
            11: 'Food_Cooking_Ordering',
            12: 'Health_Medical',
            13: 'Farm_Work_Tasks',
            14: 'Employer_Instructions',
            15: 'Requests_Permissions',
            16: 'Banking_Finance',
            17: 'Emergency_Safety',
            18: 'Communication_Skills',
            19: 'Countries_Languages',
            20: 'Free_Time_Social',
            21: 'Sports_Activities',
            22: 'Family_Relations',
            23: 'Writing_Forms',
            24: 'Jobs_Future_Review'
        };
        
        return `Chapter_${chapterNumber}_${chapterNames[chapterNumber]}.html`;
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    generateCertificate() {
        // Trigger certificate generation
        if (window.generateCertificate) {
            window.generateCertificate();
        }
    }

    adjustLayout() {
        // Adjust layout for Telegram viewport
        const viewport = this.tg.viewportHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewport}px`);
    }

    // Utility methods for data sharing with Telegram
    sendData(data) {
        if (this.tg) {
            this.tg.sendData(JSON.stringify(data));
        }
    }

    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback(result);
        }
    }

    close() {
        if (this.tg) {
            this.tg.close();
        }
    }
}

// Initialize Telegram WebApp when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.telegramWebApp = new TelegramWebApp();
});

// Export for use in other scripts
window.TelegramWebApp = TelegramWebApp;