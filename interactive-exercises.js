/**
 * Interactive Exercise System for English for Uzbek Seasonal Workers
 * Handles various exercise types with immediate feedback and progress tracking
 * 
 * Base Classes:
 * - Exercise: Base class for all exercise types
 * - FillInBlankExercise: Fill-in-the-blank exercises
 * - MultipleChoiceExercise: Multiple choice exercises
 * - TranslationExercise: Translation exercises
 * - ScenarioExercise: Farm-specific scenario exercises
 */

/**
 * Base Exercise Class
 * Provides common functionality for all exercise types
 */
class Exercise {
    constructor(question, correctAnswer, hint = '', exerciseIndex = 0) {
        this.question = question;
        this.correctAnswer = this.normalizeAnswer(correctAnswer);
        this.hint = hint;
        this.exerciseIndex = exerciseIndex;
        this.completed = false;
        this.attempts = 0;
        this.type = 'base';
        this.element = null;
    }

    /**
     * Normalize answer for consistent comparison
     */
    normalizeAnswer(answer) {
        if (Array.isArray(answer)) {
            return answer.map(a => a.toLowerCase().trim());
        }
        return answer.toLowerCase().trim();
    }

    /**
     * Validate user input against correct answer
     * Now uses exercise type detection system
     */
    validateAnswer(userInput) {
        if (!userInput) return false;
        
        // Use the new validateAnswer function with exercise type detection
        return validateAnswer(userInput, this.correctAnswer, this.element);
    }

    /**
     * Fuzzy matching for common variations
     */
    fuzzyMatch(userInput, correctAnswer) {
        // Exact match
        if (userInput === correctAnswer) return true;
        
        // Remove common punctuation and extra spaces
        const normalize = (str) => str.replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
        
        const normalizedUser = normalize(userInput);
        const normalizedCorrect = normalize(correctAnswer);
        
        // Check if normalized versions match
        if (normalizedUser === normalizedCorrect) return true;
        
        // Check for common article variations (a/an/the)
        const removeArticles = (str) => str.replace(/\b(a|an|the)\b/g, '').replace(/\s+/g, ' ').trim();
        
        return removeArticles(normalizedUser) === removeArticles(normalizedCorrect);
    }

    /**
     * Check answer and provide feedback
     */
    checkAnswer(userInput) {
        this.attempts++;
        const isCorrect = this.validateAnswer(userInput);
        
        if (isCorrect && !this.completed) {
            this.completed = true;
        }
        
        return {
            isCorrect,
            feedback: this.getFeedback(isCorrect, userInput),
            completed: this.completed
        };
    }

    /**
     * Get feedback message
     */
    getFeedback(isCorrect, userInput) {
        if (isCorrect) {
            return {
                type: 'success',
                icon: '✓',
                message: "To'g'ri! (Correct!)",
                class: 'correct'
            };
        } else {
            const correctAnswerDisplay = Array.isArray(this.correctAnswer) 
                ? this.correctAnswer[0] 
                : this.correctAnswer;
            
            return {
                type: 'error',
                icon: '✗',
                message: `Noto'g'ri. To'g'ri javob: <strong>${correctAnswerDisplay}</strong>`,
                hint: this.hint ? `Maslahat: ${this.hint}` : null,
                class: 'incorrect'
            };
        }
    }

    /**
     * Generate HTML for this exercise
     */
    generateHTML() {
        throw new Error('generateHTML method must be implemented by subclass');
    }
}

/**
 * Fill-in-the-Blank Exercise Class
 */
class FillInBlankExercise extends Exercise {
    constructor(question, correctAnswer, hint = '', exerciseIndex = 0, placeholder = "Javobingizni kiriting...") {
        super(question, correctAnswer, hint, exerciseIndex);
        this.type = 'fill-blank';
        this.placeholder = placeholder;
    }

    generateHTML() {
        const exerciseId = `exercise-${this.exerciseIndex}`;
        const questionId = `question-${this.exerciseIndex}`;
        const inputId = `input-${this.exerciseIndex}`;
        const feedbackId = `feedback-${this.exerciseIndex}`;
        
        return `
            <div class="exercise fill-blank-exercise" data-type="fill-blank" data-answer="${this.correctAnswer}" data-hint="${this.hint}" data-exercise="${this.exerciseIndex}" role="group" aria-labelledby="${questionId}">
                <div class="exercise-question" id="${questionId}">${this.question}</div>
                <div class="exercise-input-group">
                    <label for="${inputId}" class="sr-only">Enter your answer</label>
                    <input type="text" class="exercise-input" id="${inputId}" data-exercise="${this.exerciseIndex}" placeholder="${this.placeholder}" aria-describedby="${feedbackId}" aria-required="true">
                    <button class="check-answer-btn" data-exercise="${this.exerciseIndex}" aria-describedby="${inputId}" type="button">Tekshirish</button>
                </div>
                <div class="exercise-feedback" id="${feedbackId}" style="display: none;" aria-live="polite" aria-atomic="true"></div>
            </div>
        `;
    }
}

/**
 * Multiple Choice Exercise Class
 */
class MultipleChoiceExercise extends Exercise {
    constructor(question, options, correctAnswer, hint = '', exerciseIndex = 0) {
        super(question, correctAnswer, hint, exerciseIndex);
        this.type = 'multiple-choice';
        this.options = options;
    }

    validateAnswer(userInput) {
        const normalizedInput = userInput.toLowerCase().trim();
        const normalizedCorrect = this.correctAnswer.toLowerCase().trim();
        return normalizedInput === normalizedCorrect;
    }

    generateHTML() {
        const questionId = `question-${this.exerciseIndex}`;
        const feedbackId = `feedback-${this.exerciseIndex}`;
        
        const optionsHtml = this.options.map((option, index) => `
            <label class="exercise-option">
                <input type="radio" name="exercise-${this.exerciseIndex}" value="${option}" data-exercise="${this.exerciseIndex}" aria-describedby="${questionId}" id="option-${this.exerciseIndex}-${index}">
                <span>${option}</span>
            </label>
        `).join('');

        return `
            <div class="exercise multiple-choice-exercise" data-type="multiple-choice" data-answer="${this.correctAnswer}" data-exercise="${this.exerciseIndex}" role="group" aria-labelledby="${questionId}">
                <div class="exercise-question" id="${questionId}">${this.question}</div>
                <fieldset class="exercise-options" role="radiogroup" aria-labelledby="${questionId}" aria-required="true">
                    <legend class="sr-only">Choose the correct answer</legend>
                    ${optionsHtml}
                </fieldset>
                <button class="check-answer-btn" data-exercise="${this.exerciseIndex}" type="button" aria-describedby="${feedbackId}">Tekshirish</button>
                <div class="exercise-feedback" id="${feedbackId}" style="display: none;" aria-live="polite" aria-atomic="true"></div>
            </div>
        `;
    }
}

/**
 * Translation Exercise Class
 */
class TranslationExercise extends Exercise {
    constructor(sourceText, targetAnswer, direction = 'en-uz', hint = '', exerciseIndex = 0) {
        super(`Tarjima qiling / Translate: ${sourceText}`, targetAnswer, hint, exerciseIndex);
        this.type = 'translation';
        this.sourceText = sourceText;
        this.direction = direction;
        this.placeholder = direction === 'en-uz' ? 'O\'zbek tilidagi tarjimani kiriting...' : 'Enter English translation...';
    }

    generateHTML() {
        return `
            <div class="exercise translation-exercise" data-type="translation" data-answer="${this.correctAnswer}" data-exercise="${this.exerciseIndex}">
                <div class="exercise-question">
                    <strong>Tarjima qiling / Translate:</strong> ${this.sourceText}
                </div>
                <div class="exercise-input-group">
                    <input type="text" class="exercise-input" data-exercise="${this.exerciseIndex}" placeholder="${this.placeholder}" aria-label="Translation input">
                    <button class="check-answer-btn" data-exercise="${this.exerciseIndex}" aria-label="Check translation">Tekshirish</button>
                </div>
                <div class="exercise-feedback" style="display: none;" aria-live="polite"></div>
            </div>
        `;
    }
}

/**
 * Scenario Exercise Class for Farm-Specific Situations
 */
class ScenarioExercise extends Exercise {
    constructor(scenario, question, correctAnswer, context = 'farm', hint = '', exerciseIndex = 0) {
        super(question, correctAnswer, hint, exerciseIndex);
        this.type = 'scenario';
        this.scenario = scenario;
        this.context = context; // 'farm', 'safety', 'supervisor', etc.
    }

    generateHTML() {
        const contextClass = `scenario-${this.context}`;
        const contextIcon = this.getContextIcon();
        
        return `
            <div class="exercise scenario-exercise ${contextClass}" data-type="scenario" data-context="${this.context}" data-answer="${this.correctAnswer}" data-exercise="${this.exerciseIndex}">
                <div class="exercise-scenario">
                    <span class="scenario-icon">${contextIcon}</span>
                    <strong>Vaziyat / Scenario:</strong> ${this.scenario}
                </div>
                <div class="exercise-question">${this.question}</div>
                <div class="exercise-input-group">
                    <input type="text" class="exercise-input" data-exercise="${this.exerciseIndex}" placeholder="Javobingizni kiriting..." aria-label="Scenario response input">
                    <button class="check-answer-btn" data-exercise="${this.exerciseIndex}" aria-label="Check scenario response">Tekshirish</button>
                </div>
                <div class="exercise-feedback" style="display: none;" aria-live="polite"></div>
            </div>
        `;
    }

    getContextIcon() {
        const icons = {
            'farm': '🚜',
            'safety': '⚠️',
            'supervisor': '👨‍💼',
            'equipment': '🔧',
            'weather': '🌤️',
            'emergency': '🚨',
            'communication': '💬'
        };
        return icons[this.context] || '🚜';
    }
}

/**
 * Supervisor Communication Exercise Class
 */
class SupervisorCommunicationExercise extends ScenarioExercise {
    constructor(scenario, question, correctAnswer, hint = '', exerciseIndex = 0) {
        super(scenario, question, correctAnswer, 'supervisor', hint, exerciseIndex);
        this.type = 'supervisor-communication';
    }

    validateAnswer(userInput) {
        // More flexible validation for communication exercises
        const normalizedInput = userInput.toLowerCase().trim();
        
        // Check for key phrases that indicate proper communication
        const communicationPhrases = [
            'please', 'could you', 'would you', 'may i', 'excuse me',
            'thank you', 'sorry', 'i understand', 'yes sir', 'no sir'
        ];
        
        const hasPoliteLanguage = communicationPhrases.some(phrase => 
            normalizedInput.includes(phrase)
        );
        
        // Use base validation but also consider politeness
        const baseValid = super.validateAnswer(userInput);
        
        return baseValid || (hasPoliteLanguage && this.containsKeywords(normalizedInput));
    }

    containsKeywords(input) {
        // Extract keywords from correct answer
        const correctWords = this.correctAnswer.toLowerCase().split(/\s+/);
        const inputWords = input.split(/\s+/);
        
        // Check if at least 60% of key words are present
        const keywordMatches = correctWords.filter(word => 
            word.length > 2 && inputWords.some(inputWord => 
                inputWord.includes(word) || word.includes(inputWord)
            )
        );
        
        return keywordMatches.length >= Math.ceil(correctWords.length * 0.6);
    }
}

/**
 * Farm Safety Exercise Class
 */
class FarmSafetyExercise extends ScenarioExercise {
    constructor(scenario, question, correctAnswer, hint = '', exerciseIndex = 0) {
        super(scenario, question, correctAnswer, 'safety', hint, exerciseIndex);
        this.type = 'farm-safety';
        this.safetyKeywords = [
            'helmet', 'gloves', 'boots', 'safety', 'careful', 'stop', 'help',
            'emergency', 'first aid', 'supervisor', 'report', 'danger'
        ];
    }

    validateAnswer(userInput) {
        const normalizedInput = userInput.toLowerCase().trim();
        
        // Check for safety-related keywords
        const hasSafetyKeywords = this.safetyKeywords.some(keyword => 
            normalizedInput.includes(keyword)
        );
        
        // Use base validation but prioritize safety awareness
        const baseValid = super.validateAnswer(userInput);
        
        return baseValid || hasSafetyKeywords;
    }

    getFeedback(isCorrect, userInput) {
        const baseFeedback = super.getFeedback(isCorrect, userInput);
        
        if (!isCorrect) {
            // Add safety-specific feedback
            baseFeedback.message += `<br><small>Xavfsizlik muhim! Safety keywords: ${this.safetyKeywords.slice(0, 5).join(', ')}</small>`;
        }
        
        return baseFeedback;
    }
}

/**
 * Farm Equipment Exercise Class
 */
class FarmEquipmentExercise extends ScenarioExercise {
    constructor(scenario, question, correctAnswer, equipment, hint = '', exerciseIndex = 0) {
        super(scenario, question, correctAnswer, 'equipment', hint, exerciseIndex);
        this.type = 'farm-equipment';
        this.equipment = equipment; // Array of equipment names
    }

    validateAnswer(userInput) {
        const normalizedInput = userInput.toLowerCase().trim();
        
        // Check if user mentions the correct equipment
        const mentionsEquipment = this.equipment.some(item => 
            normalizedInput.includes(item.toLowerCase())
        );
        
        const baseValid = super.validateAnswer(userInput);
        
        return baseValid || mentionsEquipment;
    }
}

/**
 * Role Playing Exercise Class
 */
class RolePlayingExercise extends Exercise {
    constructor(role, situation, question, correctAnswer, hint = '', exerciseIndex = 0) {
        super(question, correctAnswer, hint, exerciseIndex);
        this.type = 'role-playing';
        this.role = role; // 'worker', 'supervisor', 'colleague'
        this.situation = situation;
    }

    generateHTML() {
        return `
            <div class="exercise role-playing-exercise" data-type="role-playing" data-role="${this.role}" data-answer="${this.correctAnswer}" data-exercise="${this.exerciseIndex}">
                <div class="exercise-role">
                    <strong>Sizning rolingiz / Your role:</strong> ${this.role}
                </div>
                <div class="exercise-situation">
                    <strong>Vaziyat / Situation:</strong> ${this.situation}
                </div>
                <div class="exercise-question">${this.question}</div>
                <div class="exercise-input-group">
                    <textarea class="exercise-input exercise-textarea" data-exercise="${this.exerciseIndex}" placeholder="Javobingizni kiriting..." rows="3" aria-label="Role playing response"></textarea>
                    <button class="check-answer-btn" data-exercise="${this.exerciseIndex}" aria-label="Check role playing response">Tekshirish</button>
                </div>
                <div class="exercise-feedback" style="display: none;" aria-live="polite"></div>
            </div>
        `;
    }

    validateAnswer(userInput) {
        // More lenient validation for role-playing exercises
        const normalizedInput = userInput.toLowerCase().trim();
        
        if (normalizedInput.length < 5) return false;
        
        // Check for appropriate language based on role
        const roleAppropriate = this.checkRoleAppropriate(normalizedInput);
        const baseValid = super.validateAnswer(userInput);
        
        return baseValid || roleAppropriate;
    }

    checkRoleAppropriate(input) {
        const roleKeywords = {
            'worker': ['please', 'sir', 'madam', 'help', 'understand', 'sorry'],
            'supervisor': ['need', 'must', 'should', 'safety', 'work', 'task'],
            'colleague': ['can you', 'would you', 'let me', 'together', 'help']
        };
        
        const keywords = roleKeywords[this.role.toLowerCase()] || [];
        return keywords.some(keyword => input.includes(keyword));
    }
}

class InteractiveExercises {
    constructor(chapterId) {
        this.chapterId = chapterId;
        this.exercises = [];
        this.exerciseObjects = []; // Store Exercise class instances
        this.currentExercise = null;
        this.init();
    }

    /**
     * Initialize the exercise system
     */
    init() {
        this.setupEventListeners();
        this.loadExercises();
        this.updateProgressDisplay();
        this.setupAccessibility();
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
            
            // Add Enter key support for buttons
            if (event.key === 'Enter' && event.target.classList.contains('check-answer-btn')) {
                event.preventDefault();
                event.target.click();
            }
            
            // Add Space key support for radio buttons
            if (event.key === ' ' && event.target.type === 'radio') {
                event.preventDefault();
                event.target.checked = true;
                event.target.dispatchEvent(new Event('change'));
            }
        });

        // Add focus management
        const exerciseInputs = document.querySelectorAll('.exercise-input');
        exerciseInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.parentElement.classList.add('focused');
                // Announce exercise to screen readers
                this.announceExercise(input);
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.parentElement.classList.remove('focused');
            });
        });

        // Add ARIA live region for announcements
        this.createAriaLiveRegion();
    }

    /**
     * Create ARIA live region for screen reader announcements
     */
    createAriaLiveRegion() {
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    }

    /**
     * Announce exercise information to screen readers
     */
    announceExercise(inputElement) {
        const exerciseIndex = parseInt(inputElement.dataset.exercise);
        const exercise = this.exercises[exerciseIndex];
        
        if (exercise) {
            const announcement = `Exercise ${exerciseIndex + 1}. ${exercise.question}`;
            this.announceToScreenReader(announcement);
        }
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Setup event listeners for exercise interactions
     */
    setupEventListeners() {
        // Listen for check answer button clicks
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('check-answer-btn')) {
                const exerciseIndex = parseInt(event.target.dataset.exercise);
                this.checkAnswer(exerciseIndex);
            }
        });

        // Listen for Enter key in input fields
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.classList.contains('exercise-input')) {
                const exerciseIndex = parseInt(event.target.dataset.exercise);
                this.checkAnswer(exerciseIndex);
            }
        });

        // Listen for progress updates
        document.addEventListener('progressUpdate', () => {
            this.updateProgressDisplay();
        });
    }

    /**
     * Load exercises from the page
     */
    loadExercises() {
        const exerciseElements = document.querySelectorAll('.exercise');
        exerciseElements.forEach((element, index) => {
            const exercise = this.parseExerciseElement(element, index);
            if (exercise) {
                this.exercises.push(exercise);
                
                // Create corresponding Exercise class instance
                const exerciseObject = this.createExerciseObject(exercise);
                if (exerciseObject) {
                    exerciseObject.element = element;
                    this.exerciseObjects.push(exerciseObject);
                }
            }
        });
    }

    /**
     * Parse exercise element to extract exercise data
     */
    parseExerciseElement(element, index) {
        const type = element.dataset.type || 'fill-blank';
        const question = element.querySelector('.exercise-question')?.textContent || '';
        const correctAnswer = element.dataset.answer || '';
        const hint = element.dataset.hint || '';
        
        return {
            index,
            type,
            question,
            correctAnswer: correctAnswer.toLowerCase().trim(),
            hint,
            element,
            completed: false,
            attempts: 0
        };
    }

    /**
     * Create Exercise class instance based on exercise data
     */
    createExerciseObject(exerciseData) {
        const { type, question, correctAnswer, hint, index } = exerciseData;
        
        switch (type) {
            case 'fill-blank':
                return new FillInBlankExercise(question, correctAnswer, hint, index);
            
            case 'multiple-choice':
                // Extract options from the element
                const options = Array.from(exerciseData.element.querySelectorAll('.exercise-option span'))
                    .map(span => span.textContent.trim());
                return new MultipleChoiceExercise(question, options, correctAnswer, hint, index);
            
            case 'translation':
                // Extract source text from question
                const sourceMatch = question.match(/Tarjima qiling \/ Translate:\s*(.+)/);
                const sourceText = sourceMatch ? sourceMatch[1] : question;
                return new TranslationExercise(sourceText, correctAnswer, 'en-uz', hint, index);
            
            case 'scenario':
                // Extract scenario from element
                const scenarioElement = exerciseData.element.querySelector('.exercise-scenario');
                const scenario = scenarioElement ? scenarioElement.textContent.replace(/Vaziyat \/ Scenario:\s*/, '').trim() : '';
                const context = exerciseData.element.dataset.context || 'farm';
                return new ScenarioExercise(scenario, question, correctAnswer, context, hint, index);
            
            case 'supervisor-communication':
                const supervisorScenarioElement = exerciseData.element.querySelector('.exercise-scenario');
                const supervisorScenario = supervisorScenarioElement ? supervisorScenarioElement.textContent.replace(/Vaziyat \/ Scenario:\s*/, '').trim() : '';
                return new SupervisorCommunicationExercise(supervisorScenario, question, correctAnswer, hint, index);
            
            case 'farm-safety':
                const safetyScenarioElement = exerciseData.element.querySelector('.exercise-scenario');
                const safetyScenario = safetyScenarioElement ? safetyScenarioElement.textContent.replace(/Vaziyat \/ Scenario:\s*/, '').trim() : '';
                return new FarmSafetyExercise(safetyScenario, question, correctAnswer, hint, index);
            
            case 'farm-equipment':
                const equipmentScenarioElement = exerciseData.element.querySelector('.exercise-scenario');
                const equipmentScenario = equipmentScenarioElement ? equipmentScenarioElement.textContent.replace(/Vaziyat \/ Scenario:\s*/, '').trim() : '';
                const equipment = exerciseData.element.dataset.equipment ? exerciseData.element.dataset.equipment.split(',') : [];
                return new FarmEquipmentExercise(equipmentScenario, question, correctAnswer, equipment, hint, index);
            
            case 'role-playing':
                const roleElement = exerciseData.element.querySelector('.exercise-role');
                const situationElement = exerciseData.element.querySelector('.exercise-situation');
                const role = exerciseData.element.dataset.role || 'worker';
                const situation = situationElement ? situationElement.textContent.replace(/Vaziyat \/ Situation:\s*/, '').trim() : '';
                return new RolePlayingExercise(role, situation, question, correctAnswer, hint, index);
            
            default:
                return new Exercise(question, correctAnswer, hint, index);
        }
    }

    /**
     * Check answer for specific exercise
     */
    checkAnswer(exerciseIndex) {
        const exercise = this.exercises[exerciseIndex];
        const exerciseObject = this.exerciseObjects[exerciseIndex];
        
        if (!exercise || !exerciseObject) {
            console.error(`Exercise ${exerciseIndex} not found`);
            return;
        }

        const userInput = this.getUserInput(exercise);
        
        // Use the Exercise class method for validation and feedback
        const result = exerciseObject.checkAnswer(userInput);
        
        // Update local exercise data
        exercise.attempts = exerciseObject.attempts;
        exercise.completed = exerciseObject.completed;
        
        // Update UI with feedback
        this.showFeedback(exercise, result.isCorrect, userInput, result.feedback);
        
        // Update progress if correct
        if (result.isCorrect && result.completed) {
            this.updateProgress(exerciseIndex, true);
        }
        
        // Dispatch completion event
        this.dispatchExerciseEvent(exerciseIndex, result.isCorrect);
        
        return result;
    }

    /**
     * Get user input from exercise
     */
    getUserInput(exercise) {
        const inputElement = exercise.element.querySelector('.exercise-input');
        if (!inputElement) return '';
        
        switch (exercise.type) {
            case 'fill-blank':
            case 'translation':
                return inputElement.value.toLowerCase().trim();
            
            case 'multiple-choice':
                const selectedOption = exercise.element.querySelector('input[type="radio"]:checked');
                return selectedOption ? selectedOption.value.toLowerCase().trim() : '';
            
            default:
                return inputElement.value.toLowerCase().trim();
        }
    }

    /**
     * Handle tab navigation for accessibility
     */
    handleTabNavigation(event) {
        const focusableElements = document.querySelectorAll(
            '.exercise-input, .check-answer-btn, input[type="radio"]'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (event.shiftKey) {
            // Shift+Tab - go backwards
            if (currentIndex === 0) {
                event.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab - go forwards
            if (currentIndex === focusableElements.length - 1) {
                event.preventDefault();
                focusableElements[0].focus();
            }
        }
    }

    /**
     * Add exercise to the system programmatically
     */
    addExercise(exerciseObject) {
        const index = this.exercises.length;
        exerciseObject.exerciseIndex = index;
        
        // Create HTML and add to page
        const exerciseHTML = exerciseObject.generateHTML();
        const container = document.querySelector('.exercises-container') || document.body;
        container.insertAdjacentHTML('beforeend', exerciseHTML);
        
        // Get the newly created element
        const element = container.lastElementChild;
        exerciseObject.element = element;
        
        // Add to arrays
        this.exerciseObjects.push(exerciseObject);
        this.exercises.push({
            index,
            type: exerciseObject.type,
            question: exerciseObject.question,
            correctAnswer: exerciseObject.correctAnswer,
            hint: exerciseObject.hint,
            element,
            completed: false,
            attempts: 0
        });
        
        return index;
    }

    /**
     * Enhanced showFeedback method with consistent styling and accessibility
     * Requirements: 1.3, 1.4, 2.3
     */
    showFeedback(exercise, isCorrect, userInput, feedbackData = null) {
        const feedbackElement = exercise.element.querySelector('.exercise-feedback') || 
                               this.createFeedbackElement(exercise.element);
        
        // Clear previous feedback
        feedbackElement.innerHTML = '';
        feedbackElement.className = 'exercise-feedback';
        
        // Use feedbackData from Exercise class if available, with fallback
        const feedback = feedbackData || {
            type: isCorrect ? 'success' : 'error',
            icon: isCorrect ? '✓' : '✗',
            message: isCorrect ? "To'g'ri! (Correct!)" : `Noto'g'ri. To'g'ri javob: <strong>${exercise.correctAnswer}</strong>`,
            class: isCorrect ? 'correct' : 'incorrect',
            hint: !isCorrect && exercise.hint ? `Maslahat: ${exercise.hint}` : null
        };
        
        // Apply consistent styling across all chapters (Requirement 1.3)
        this.applyFeedbackStyling(feedbackElement, feedback);
        
        // Create accessible feedback content (Requirement 1.4, 2.3)
        this.createFeedbackContent(feedbackElement, feedback);
        
        // Show feedback with proper positioning for mobile (Requirement 2.3)
        this.displayFeedback(feedbackElement, exercise.element);
        
        // Handle accessibility announcements (Requirement 1.4)
        this.announceToScreenReader(isCorrect ? 
            "Correct answer! Well done." : 
            `Incorrect. The correct answer is ${exercise.correctAnswer}`);
        
        if (isCorrect) {
            // Disable input after correct answer
            const inputElement = exercise.element.querySelector('.exercise-input');
            if (inputElement) {
                inputElement.disabled = true;
                inputElement.classList.add('completed');
                inputElement.setAttribute('aria-label', 'Exercise completed successfully');
            }
            
            // Disable check button
            const checkButton = exercise.element.querySelector('.check-answer-btn');
            if (checkButton) {
                checkButton.disabled = true;
                checkButton.textContent = 'Completed';
                checkButton.setAttribute('aria-label', 'Exercise completed');
            }
        }
        
        // Manage focus for accessibility (Requirement 1.4)
        this.manageFeedbackFocus(feedbackElement);
    }

    /**
     * Create feedback element if missing (Requirement 2.1, 2.2)
     */
    createFeedbackElement(exerciseElement) {
        try {
            const feedback = document.createElement('div');
            feedback.className = 'exercise-feedback';
            feedback.style.display = 'none';
            feedback.setAttribute('aria-live', 'polite');
            feedback.setAttribute('aria-atomic', 'true');
            feedback.setAttribute('role', 'status');
            
            // Find the best insertion point
            const insertionPoint = this.findFeedbackInsertionPoint(exerciseElement);
            
            if (insertionPoint.parent && insertionPoint.reference) {
                insertionPoint.parent.insertBefore(feedback, insertionPoint.reference);
            } else {
                // Fallback: append to exercise container
                exerciseElement.appendChild(feedback);
            }
            
            return feedback;
        } catch (error) {
            console.warn('Error creating feedback element:', error);
            // Create minimal fallback element (Requirement 2.1, 2.2)
            const fallback = document.createElement('div');
            fallback.className = 'exercise-feedback';
            fallback.setAttribute('aria-live', 'polite');
            exerciseElement.appendChild(fallback);
            return fallback;
        }
    }

    /**
     * Find optimal insertion point for feedback element
     */
    findFeedbackInsertionPoint(exerciseElement) {
        // Try to insert after input group
        const inputGroup = exerciseElement.querySelector('.exercise-input-group');
        if (inputGroup) {
            return {
                parent: inputGroup.parentNode,
                reference: inputGroup.nextSibling
            };
        }
        
        // Try to insert after last input element
        const lastInput = exerciseElement.querySelector('input:last-of-type, textarea:last-of-type, select:last-of-type');
        if (lastInput) {
            return {
                parent: lastInput.parentNode,
                reference: lastInput.nextSibling
            };
        }
        
        // Try to insert after check button
        const checkButton = exerciseElement.querySelector('.check-answer-btn, button[onclick*="checkAnswer"]');
        if (checkButton) {
            return {
                parent: checkButton.parentNode,
                reference: checkButton.nextSibling
            };
        }
        
        // Fallback to end of container
        return {
            parent: exerciseElement,
            reference: null
        };
    }

    /**
     * Apply consistent feedback styling across all chapters (Requirement 1.3)
     */
    applyFeedbackStyling(feedback, feedbackData) {
        // Base classes for consistent styling
        feedback.classList.add('exercise-feedback', feedbackData.class);
        
        // Add type-specific classes
        if (feedbackData.type === 'success') {
            feedback.classList.add('feedback-success');
        } else if (feedbackData.type === 'error') {
            feedback.classList.add('feedback-error');
        } else if (feedbackData.type === 'warning') {
            feedback.classList.add('feedback-warning');
        }
        
        // Ensure mobile-friendly styling (Requirement 2.3)
        feedback.style.cssText = `
            display: block;
            margin-top: 12px;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
            max-width: 100%;
            box-sizing: border-box;
        `;
        
        // Apply color scheme based on feedback type
        if (feedbackData.type === 'success') {
            feedback.style.backgroundColor = '#e8f5e8';
            feedback.style.color = '#2e7d32';
            feedback.style.border = '1px solid #4caf50';
        } else if (feedbackData.type === 'error') {
            feedback.style.backgroundColor = '#ffebee';
            feedback.style.color = '#d32f2f';
            feedback.style.border = '1px solid #f44336';
        } else if (feedbackData.type === 'warning') {
            feedback.style.backgroundColor = '#fff3e0';
            feedback.style.color = '#f57c00';
            feedback.style.border = '1px solid #ff9800';
        }
    }

    /**
     * Create accessible feedback content (Requirement 1.4)
     */
    createFeedbackContent(feedback, feedbackData) {
        // Create main feedback container
        const feedbackContent = document.createElement('div');
        feedbackContent.className = 'feedback-content';
        feedbackContent.style.display = 'flex';
        feedbackContent.style.alignItems = 'flex-start';
        feedbackContent.style.gap = '8px';
        
        // Create icon element
        const iconElement = document.createElement('span');
        iconElement.className = 'feedback-icon';
        iconElement.setAttribute('aria-hidden', 'true');
        iconElement.textContent = feedbackData.icon;
        iconElement.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 2px;
        `;
        
        // Create message element
        const messageElement = document.createElement('span');
        messageElement.className = 'feedback-text';
        messageElement.innerHTML = feedbackData.message;
        messageElement.style.flex = '1';
        
        feedbackContent.appendChild(iconElement);
        feedbackContent.appendChild(messageElement);
        feedback.appendChild(feedbackContent);
        
        // Add hint if available
        if (feedbackData.hint) {
            const hintElement = document.createElement('div');
            hintElement.className = 'exercise-hint';
            hintElement.textContent = feedbackData.hint;
            hintElement.style.cssText = `
                margin-top: 8px;
                font-size: 12px;
                font-style: italic;
                opacity: 0.8;
            `;
            feedback.appendChild(hintElement);
        }
    }

    /**
     * Display feedback with proper positioning for mobile (Requirement 2.3)
     */
    displayFeedback(feedback, exerciseElement) {
        // Show the feedback
        feedback.style.display = 'block';
        
        // Ensure feedback is visible on mobile devices
        setTimeout(() => {
            const feedbackRect = feedback.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If feedback is below viewport, scroll it into view
            if (feedbackRect.bottom > viewportHeight) {
                feedback.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }, 100);
    }

    /**
     * Manage focus for accessibility (Requirement 1.4)
     */
    manageFeedbackFocus(feedback) {
        // Make feedback focusable temporarily for screen readers
        feedback.setAttribute('tabindex', '-1');
        
        // Focus the feedback for screen reader announcement
        setTimeout(() => {
            feedback.focus();
        }, 100);
        
        // Remove focus management after announcement
        setTimeout(() => {
            feedback.removeAttribute('tabindex');
            feedback.blur();
        }, 2000);
    }

    /**
     * Update progress for completed exercise
     * Integrates with ProgressTracker system
     * Requirements: 4.4, 5.3
     */
    updateProgress(exerciseIndex, isCompleted) {
        if (!isCompleted) return;
        
        try {
            // Call the global updateProgressTracking function
            if (typeof updateProgressTracking === 'function') {
                updateProgressTracking(exerciseIndex, isCompleted);
            } else {
                console.warn('updateProgressTracking function not available');
            }
            
            // Update local exercise state
            if (this.exercises[exerciseIndex]) {
                this.exercises[exerciseIndex].completed = true;
            }
            
            // Update progress display
            this.updateProgressDisplay();
            
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    /**
     * Dispatch exercise completion event
     * Allows other systems to listen for exercise completion
     * Requirements: 5.3
     */
    dispatchExerciseEvent(exerciseIndex, isCorrect) {
        try {
            const event = new CustomEvent('exerciseCompleted', {
                detail: {
                    exerciseIndex,
                    isCorrect,
                    chapterId: this.chapterId,
                    timestamp: new Date().toISOString()
                }
            });
            
            document.dispatchEvent(event);
            
            // Also dispatch progress update event if correct
            if (isCorrect) {
                const progressEvent = new CustomEvent('progressUpdate', {
                    detail: {
                        exerciseIndex,
                        chapterId: this.chapterId
                    }
                });
                
                document.dispatchEvent(progressEvent);
            }
            
        } catch (error) {
            console.error('Error dispatching exercise event:', error);
        }
    }
}

/**
 * Farm Work Exercise Manager
 * Specialized manager for farm-specific exercise scenarios
 */
class FarmWorkExerciseManager {
    constructor() {
        this.farmScenarios = this.initializeFarmScenarios();
        this.safetyScenarios = this.initializeSafetyScenarios();
        this.supervisorScenarios = this.initializeSupervisorScenarios();
    }

    initializeFarmScenarios() {
        return [
            {
                scenario: "You are picking strawberries in the field. Your supervisor asks you to move to a different row.",
                question: "How do you respond to show you understand?",
                correctAnswer: ["yes sir", "okay", "i understand", "which row"],
                context: "farm"
            },
            {
                scenario: "It's raining and you're working outside. Your clothes are getting wet.",
                question: "What should you ask your supervisor?",
                correctAnswer: ["can we go inside", "should we stop", "is there shelter"],
                context: "weather"
            },
            {
                scenario: "You finished your section early. Other workers are still busy.",
                question: "What do you say to your supervisor?",
                correctAnswer: ["i finished my section", "what should i do next", "can i help others"],
                context: "farm"
            }
        ];
    }

    initializeSafetyScenarios() {
        return [
            {
                scenario: "You see a broken tool on the ground that could hurt someone.",
                question: "What is the first thing you should do?",
                correctAnswer: ["report to supervisor", "tell someone", "move it away", "make it safe"],
                context: "safety"
            },
            {
                scenario: "A coworker cuts their hand while working. They are bleeding.",
                question: "What should you do immediately?",
                correctAnswer: ["get first aid", "call supervisor", "help stop bleeding", "get help"],
                context: "emergency"
            },
            {
                scenario: "You don't know how to use a new piece of equipment safely.",
                question: "What should you do before using it?",
                correctAnswer: ["ask for training", "ask supervisor", "learn how to use", "get help"],
                context: "safety"
            }
        ];
    }

    initializeSupervisorScenarios() {
        return [
            {
                scenario: "Your supervisor gives you instructions but you don't understand everything.",
                question: "How do you politely ask for clarification?",
                correctAnswer: ["could you repeat please", "i don't understand", "can you explain", "sorry what"],
                context: "communication"
            },
            {
                scenario: "You need to take a break but you're not sure if it's break time.",
                question: "How do you ask your supervisor?",
                correctAnswer: ["can i take a break", "is it break time", "may i rest", "excuse me"],
                context: "supervisor"
            },
            {
                scenario: "Your supervisor asks if you can work overtime today.",
                question: "How do you respond if you can work extra hours?",
                correctAnswer: ["yes i can", "okay", "how many hours", "what time"],
                context: "supervisor"
            }
        ];
    }

    createRandomFarmExercise(exerciseIndex = 0) {
        const scenarios = [...this.farmScenarios, ...this.safetyScenarios, ...this.supervisorScenarios];
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        return new ScenarioExercise(
            randomScenario.scenario,
            randomScenario.question,
            randomScenario.correctAnswer,
            randomScenario.context,
            '',
            exerciseIndex
        );
    }

    createSafetyExercise(exerciseIndex = 0) {
        const scenario = this.safetyScenarios[Math.floor(Math.random() * this.safetyScenarios.length)];
        
        return new FarmSafetyExercise(
            scenario.scenario,
            scenario.question,
            scenario.correctAnswer,
            '',
            exerciseIndex
        );
    }

    createSupervisorCommunicationExercise(exerciseIndex = 0) {
        const scenario = this.supervisorScenarios[Math.floor(Math.random() * this.supervisorScenarios.length)];
        
        return new SupervisorCommunicationExercise(
            scenario.scenario,
            scenario.question,
            scenario.correctAnswer,
            '',
            exerciseIndex
        );
    }

    createEquipmentExercise(exerciseIndex = 0) {
        const equipmentScenarios = [
            {
                scenario: "You need to use a wheelbarrow to move harvested vegetables.",
                question: "What equipment do you need?",
                correctAnswer: "wheelbarrow",
                equipment: ["wheelbarrow", "cart", "trolley"]
            },
            {
                scenario: "It's sunny and you'll be working outside all day.",
                question: "What should you wear to protect yourself?",
                correctAnswer: "hat and sunscreen",
                equipment: ["hat", "cap", "sunscreen", "sunblock"]
            }
        ];
        
        const scenario = equipmentScenarios[Math.floor(Math.random() * equipmentScenarios.length)];
        
        return new FarmEquipmentExercise(
            scenario.scenario,
            scenario.question,
            scenario.correctAnswer,
            scenario.equipment,
            '',
            exerciseIndex
        );
    }

    createRolePlayingExercise(role = 'worker', exerciseIndex = 0) {
        const rolePlayScenarios = {
            'worker': [
                {
                    situation: "First day at the farm, meeting your supervisor",
                    question: "Introduce yourself and ask what you should do first.",
                    correctAnswer: "hello my name is... what should i do first"
                },
                {
                    situation: "You don't feel well and need to go home early",
                    question: "How do you tell your supervisor?",
                    correctAnswer: "excuse me i don't feel well can i go home"
                }
            ],
            'supervisor': [
                {
                    situation: "A new worker doesn't understand the task",
                    question: "How do you explain the task clearly?",
                    correctAnswer: "let me show you how to do this task"
                }
            ]
        };
        
        const scenarios = rolePlayScenarios[role] || rolePlayScenarios['worker'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        return new RolePlayingExercise(
            role,
            scenario.situation,
            scenario.question,
            scenario.correctAnswer,
            '',
            exerciseIndex
        );
    }
}

/**
 * Exercise Factory for creating different exercise types
 * Updated to work with new Exercise class system and farm-specific exercises
 */
class ExerciseFactory {
    static farmManager = new FarmWorkExerciseManager();

    /**
     * Create fill-in-the-blank exercise
     */
    static createFillBlankExercise(question, answer, hint = '', exerciseIndex = 0, placeholder = "Javobingizni kiriting...") {
        return new FillInBlankExercise(question, answer, hint, exerciseIndex, placeholder);
    }

    /**
     * Create multiple choice exercise
     */
    static createMultipleChoiceExercise(question, options, correctAnswer, hint = '', exerciseIndex = 0) {
        return new MultipleChoiceExercise(question, options, correctAnswer, hint, exerciseIndex);
    }

    /**
     * Create translation exercise
     */
    static createTranslationExercise(sourceText, targetAnswer, direction = 'en-uz', hint = '', exerciseIndex = 0) {
        return new TranslationExercise(sourceText, targetAnswer, direction, hint, exerciseIndex);
    }

    /**
     * Create scenario exercise for farm work
     */
    static createScenarioExercise(scenario, question, correctAnswer, context = 'farm', hint = '', exerciseIndex = 0) {
        return new ScenarioExercise(scenario, question, correctAnswer, context, hint, exerciseIndex);
    }

    /**
     * Create farm safety exercise
     */
    static createSafetyExercise(scenario, question, correctAnswer, hint = '', exerciseIndex = 0) {
        return new FarmSafetyExercise(scenario, question, correctAnswer, hint, exerciseIndex);
    }

    /**
     * Create supervisor communication exercise
     */
    static createSupervisorExercise(scenario, question, correctAnswer, hint = '', exerciseIndex = 0) {
        return new SupervisorCommunicationExercise(scenario, question, correctAnswer, hint, exerciseIndex);
    }

    /**
     * Create farm equipment exercise
     */
    static createEquipmentExercise(scenario, question, correctAnswer, equipment, hint = '', exerciseIndex = 0) {
        return new FarmEquipmentExercise(scenario, question, correctAnswer, equipment, hint, exerciseIndex);
    }

    /**
     * Create role playing exercise
     */
    static createRolePlayingExercise(role, situation, question, correctAnswer, hint = '', exerciseIndex = 0) {
        return new RolePlayingExercise(role, situation, question, correctAnswer, hint, exerciseIndex);
    }

    /**
     * Farm-specific exercise generators using the FarmWorkExerciseManager
     */
    static createRandomFarmExercise(exerciseIndex = 0) {
        return this.farmManager.createRandomFarmExercise(exerciseIndex);
    }

    static createRandomSafetyExercise(exerciseIndex = 0) {
        return this.farmManager.createSafetyExercise(exerciseIndex);
    }

    static createRandomSupervisorExercise(exerciseIndex = 0) {
        return this.farmManager.createSupervisorCommunicationExercise(exerciseIndex);
    }

    static createRandomEquipmentExercise(exerciseIndex = 0) {
        return this.farmManager.createEquipmentExercise(exerciseIndex);
    }

    static createRandomRolePlayExercise(role = 'worker', exerciseIndex = 0) {
        return this.farmManager.createRolePlayingExercise(role, exerciseIndex);
    }

    /**
     * Legacy HTML generation methods (for backward compatibility)
     */
    static createFillBlankExerciseHTML(question, answer, hint = '', exerciseIndex = 0) {
        const exercise = new FillInBlankExercise(question, answer, hint, exerciseIndex);
        return exercise.generateHTML();
    }

    static createMultipleChoiceExerciseHTML(question, options, correctAnswer, exerciseIndex = 0) {
        const exercise = new MultipleChoiceExercise(question, options, correctAnswer, '', exerciseIndex);
        return exercise.generateHTML();
    }

    static createTranslationExerciseHTML(sourceText, targetAnswer, direction = 'en-uz', exerciseIndex = 0) {
        const exercise = new TranslationExercise(sourceText, targetAnswer, direction, '', exerciseIndex);
        return exercise.generateHTML();
    }
}

/**
 * CSS Styles for Exercise System
 * These styles should be included in the chapter HTML files
 */
const EXERCISE_STYLES = `
<style>
/* Exercise Container Styles */
.exercise {
    margin: 20px 0;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: #fafafa;
    transition: all 0.3s ease;
    position: relative;
}

.exercise.focused {
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.exercise-completed {
    border-color: #4caf50;
    background: #f1f8e9;
}

/* Farm-Specific Exercise Styles */
.scenario-exercise {
    border-left: 5px solid #2196f3;
}

.scenario-farm {
    border-left-color: #4caf50;
    background: #f1f8e9;
}

.scenario-safety {
    border-left-color: #ff9800;
    background: #fff3e0;
}

.scenario-supervisor {
    border-left-color: #9c27b0;
    background: #f3e5f5;
}

.scenario-equipment {
    border-left-color: #607d8b;
    background: #eceff1;
}

.scenario-weather {
    border-left-color: #03a9f4;
    background: #e1f5fe;
}

.scenario-emergency {
    border-left-color: #f44336;
    background: #ffebee;
}

.scenario-communication {
    border-left-color: #795548;
    background: #efebe9;
}

.role-playing-exercise {
    border: 2px dashed #673ab7;
    background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
}

/* Exercise Question Styles */
.exercise-question {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    color: #333;
    line-height: 1.5;
}

.exercise-scenario {
    background: #e3f2fd;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
    border-left: 4px solid #1976d2;
    font-style: italic;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.scenario-icon {
    font-size: 20px;
    margin-right: 8px;
    flex-shrink: 0;
}

.exercise-role {
    background: #f3e5f5;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
    border-left: 3px solid #9c27b0;
    font-weight: 500;
}

.exercise-situation {
    background: #e8eaf6;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
    border-left: 3px solid #673ab7;
}

/* Input Group Styles */
.exercise-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}

.exercise-input {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.exercise-input:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.exercise-input.completed {
    background: #e8f5e8;
    border-color: #4caf50;
}

.exercise-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.exercise-textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    line-height: 1.4;
}

/* Button Styles */
.check-answer-btn {
    padding: 12px 24px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 44px;
    min-width: 44px;
}

.check-answer-btn:hover {
    background: #1565c0;
    transform: translateY(-1px);
}

.check-answer-btn:active {
    transform: translateY(0);
}

.check-answer-btn:focus {
    outline: 3px solid rgba(25, 118, 210, 0.3);
    outline-offset: 2px;
}

/* Multiple Choice Styles */
.exercise-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 15px 0;
}

.exercise-option {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 44px;
}

.exercise-option:hover {
    border-color: #1976d2;
    background: #f5f5f5;
}

.exercise-option input[type="radio"] {
    margin-right: 12px;
    transform: scale(1.2);
}

/* Enhanced Feedback Styles with Error Category Support */
.exercise-feedback {
    margin-top: 15px;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 500;
    position: relative;
    transition: all 0.3s ease;
}

.exercise-feedback.correct {
    background: #e8f5e8;
    border: 2px solid #4caf50;
    border-left: 6px solid #4caf50;
    color: #2e7d32;
}

.exercise-feedback.incorrect {
    background: #ffebee;
    border: 2px solid #f44336;
    border-left: 6px solid #f44336;
    color: #c62828;
}

/* Category-Specific Feedback Styles (Requirements 3.1, 3.2, 3.3, 3.4) */
.feedback-category-structure {
    background: #fff3e0 !important;
    border-color: #ff9800 !important;
    border-left-color: #ff9800 !important;
    color: #e65100 !important;
}

.feedback-category-spelling {
    background: #f3e5f5 !important;
    border-color: #9c27b0 !important;
    border-left-color: #9c27b0 !important;
    color: #7b1fa2 !important;
}

.feedback-category-grammar {
    background: #e3f2fd !important;
    border-color: #2196f3 !important;
    border-left-color: #2196f3 !important;
    color: #1565c0 !important;
}

.feedback-category-content {
    background: #fce4ec !important;
    border-color: #e91e63 !important;
    border-left-color: #e91e63 !important;
    color: #c2185b !important;
}

/* Visual Indicator Styles */
.feedback-indicator-incomplete-sentence::before {
    content: "📝";
    position: absolute;
    top: -8px;
    left: 12px;
    background: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
}

.feedback-indicator-spelling-error::before {
    content: "📖";
    position: absolute;
    top: -8px;
    left: 12px;
    background: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
}

.feedback-indicator-grammar-error::before {
    content: "📚";
    position: absolute;
    top: -8px;
    left: 12px;
    background: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
}

.feedback-indicator-content-error::before {
    content: "✂️";
    position: absolute;
    top: -8px;
    left: 12px;
    background: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
}

.feedback-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.feedback-icon {
    font-size: 18px;
    font-weight: bold;
    flex-shrink: 0;
    padding: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
}

.feedback-message-container {
    flex: 1;
}

.feedback-text {
    font-weight: 500;
    margin-bottom: 4px;
}

.feedback-explanation {
    font-size: 12px;
    opacity: 0.9;
    margin-top: 4px;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    border-left: 3px solid currentColor;
}

.feedback-category-badge {
    position: absolute;
    top: -8px;
    right: 12px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid currentColor;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exercise-hint {
    margin-top: 8px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    border: 1px dashed currentColor;
    font-size: 12px;
    opacity: 0.9;
}

/* Animation Styles */
.success-animation {
    animation: successPulse 0.6s ease-in-out;
}

.error-animation {
    animation: errorShake 0.6s ease-in-out;
}

@keyframes successPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}

@keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .exercise {
        padding: 15px;
        margin: 15px 0;
    }
    
    .exercise-input-group {
        flex-direction: column;
        align-items: stretch;
    }
    
    .exercise-input {
        min-width: auto;
        margin-bottom: 10px;
    }
    
    .check-answer-btn {
        width: 100%;
    }
    
    .exercise-options {
        gap: 8px;
    }
    
    .exercise-option {
        padding: 10px;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .exercise {
        border-width: 3px;
    }
    
    .exercise-input {
        border-width: 3px;
    }
    
    .check-answer-btn {
        border: 3px solid #000;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .exercise,
    .exercise-input,
    .check-answer-btn,
    .exercise-option {
        transition: none;
    }
    
    .success-animation,
    .error-animation {
        animation: none;
    }
}
</style>
`;

/**
 * Utility function to inject exercise styles
 */
function injectExerciseStyles() {
    if (!document.querySelector('#exercise-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'exercise-styles';
        styleElement.textContent = EXERCISE_STYLES.replace(/<\/?style>/g, '');
        document.head.appendChild(styleElement);
    }
}

// Initialize exercises when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Inject exercise styles
    injectExerciseStyles();
    
    // Get chapter ID from page (you'll need to set this in each chapter)
    const chapterIdElement = document.querySelector('[data-chapter-id]');
    if (chapterIdElement) {
        const chapterId = parseInt(chapterIdElement.dataset.chapterId);
        window.exerciseSystem = new InteractiveExercises(chapterId);
    } else {
        // Fallback: try to get chapter ID from URL or default to 1
        const urlParams = new URLSearchParams(window.location.search);
        const chapterId = parseInt(urlParams.get('chapter')) || 1;
        window.exerciseSystem = new InteractiveExercises(chapterId);
    }
});

// Make classes available globally
if (typeof window !== 'undefined') {
    window.InteractiveExercises = InteractiveExercises;
    window.ExerciseFactory = ExerciseFactory;
    window.FarmWorkExerciseManager = FarmWorkExerciseManager;
    window.Exercise = Exercise;
    window.FillInBlankExercise = FillInBlankExercise;
    window.MultipleChoiceExercise = MultipleChoiceExercise;
    window.TranslationExercise = TranslationExercise;
    window.ScenarioExercise = ScenarioExercise;
    window.SupervisorCommunicationExercise = SupervisorCommunicationExercise;
    window.FarmSafetyExercise = FarmSafetyExercise;
    window.FarmEquipmentExercise = FarmEquipmentExercise;
    window.RolePlayingExercise = RolePlayingExercise;
    window.injectExerciseStyles = injectExerciseStyles;
}

/**
 * Unit Tests for Exercise System
 * Simple testing framework for validating exercise functionality
 */
class ExerciseTestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    /**
     * Add a test case
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    runTests() {
        console.log('🧪 Running Exercise System Tests...\n');
        this.results = [];

        this.tests.forEach(test => {
            try {
                const result = test.testFunction();
                if (result === true) {
                    this.results.push({ name: test.name, status: 'PASS', error: null });
                    console.log(`✅ ${test.name}`);
                } else {
                    this.results.push({ name: test.name, status: 'FAIL', error: result || 'Test returned false' });
                    console.log(`❌ ${test.name}: ${result || 'Test returned false'}`);
                }
            } catch (error) {
                this.results.push({ name: test.name, status: 'ERROR', error: error.message });
                console.log(`💥 ${test.name}: ${error.message}`);
            }
        });

        this.printSummary();
        return this.results;
    }

    /**
     * Print test summary
     */
    printSummary() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const errors = this.results.filter(r => r.status === 'ERROR').length;
        const total = this.results.length;

        console.log(`\n📊 Test Summary:`);
        console.log(`   Total: ${total}`);
        console.log(`   Passed: ${passed}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%`);
    }

    /**
     * Assert helper functions
     */
    static assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
        return true;
    }

    static assertEqual(actual, expected, message = 'Values are not equal') {
        if (actual !== expected) {
            throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
        }
        return true;
    }

    static assertArrayEqual(actual, expected, message = 'Arrays are not equal') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
        }
        return true;
    }

    static assertContains(haystack, needle, message = 'Value not found') {
        if (!haystack.includes(needle)) {
            throw new Error(`${message}. Expected "${haystack}" to contain "${needle}"`);
        }
        return true;
    }
}

/**
 * Initialize and run exercise system tests
 */
function initializeExerciseTests() {
    const testSuite = new ExerciseTestSuite();

    // Test 1: Basic Exercise Creation
    testSuite.addTest('Basic Exercise Creation', () => {
        const exercise = new Exercise('Test question', 'test answer', 'test hint', 0);
        ExerciseTestSuite.assertEqual(exercise.question, 'Test question');
        ExerciseTestSuite.assertEqual(exercise.correctAnswer, 'test answer');
        ExerciseTestSuite.assertEqual(exercise.hint, 'test hint');
        ExerciseTestSuite.assertEqual(exercise.exerciseIndex, 0);
        ExerciseTestSuite.assertEqual(exercise.completed, false);
        ExerciseTestSuite.assertEqual(exercise.attempts, 0);
        return true;
    });

    // Test 2: Fill-in-Blank Exercise Validation
    testSuite.addTest('Fill-in-Blank Exercise Validation', () => {
        const exercise = new FillInBlankExercise('What is 2+2?', 'four', 'Think about basic math', 0);
        
        // Test correct answer
        const result1 = exercise.checkAnswer('four');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept correct answer');
        
        // Test incorrect answer
        const result2 = exercise.checkAnswer('five');
        ExerciseTestSuite.assert(!result2.isCorrect, 'Should reject incorrect answer');
        
        // Test case insensitive
        const result3 = exercise.checkAnswer('FOUR');
        ExerciseTestSuite.assert(result3.isCorrect, 'Should be case insensitive');
        
        // Test with extra spaces
        const result4 = exercise.checkAnswer('  four  ');
        ExerciseTestSuite.assert(result4.isCorrect, 'Should handle extra spaces');
        
        return true;
    });

    // Test 3: Multiple Choice Exercise Validation
    testSuite.addTest('Multiple Choice Exercise Validation', () => {
        const options = ['apple', 'banana', 'orange'];
        const exercise = new MultipleChoiceExercise('Which is a fruit?', options, 'apple', '', 0);
        
        // Test correct answer
        const result1 = exercise.checkAnswer('apple');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept correct answer');
        
        // Test incorrect answer
        const result2 = exercise.checkAnswer('banana');
        ExerciseTestSuite.assert(!result2.isCorrect, 'Should reject incorrect answer');
        
        return true;
    });

    // Test 4: Translation Exercise Validation
    testSuite.addTest('Translation Exercise Validation', () => {
        const exercise = new TranslationExercise('Hello', 'salom', 'en-uz', '', 0);
        
        // Test correct translation
        const result1 = exercise.checkAnswer('salom');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept correct translation');
        
        // Test incorrect translation
        const result2 = exercise.checkAnswer('goodbye');
        ExerciseTestSuite.assert(!result2.isCorrect, 'Should reject incorrect translation');
        
        return true;
    });

    // Test 5: Scenario Exercise Validation
    testSuite.addTest('Scenario Exercise Validation', () => {
        const scenario = 'You are working in the field and it starts raining.';
        const question = 'What should you do?';
        const exercise = new ScenarioExercise(scenario, question, 'go inside', 'farm', '', 0);
        
        // Test correct answer
        const result1 = exercise.checkAnswer('go inside');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept correct answer');
        
        // Test fuzzy matching
        const result2 = exercise.checkAnswer('go inside the building');
        ExerciseTestSuite.assert(result2.isCorrect, 'Should handle fuzzy matching');
        
        return true;
    });

    // Test 6: Supervisor Communication Exercise
    testSuite.addTest('Supervisor Communication Exercise', () => {
        const scenario = 'Your supervisor gives you new instructions.';
        const question = 'How do you respond?';
        const exercise = new SupervisorCommunicationExercise(scenario, question, 'yes sir', '', 0);
        
        // Test polite response
        const result1 = exercise.checkAnswer('yes sir, I understand');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept polite response');
        
        // Test with polite keywords
        const result2 = exercise.checkAnswer('please explain more');
        ExerciseTestSuite.assert(result2.isCorrect, 'Should accept responses with polite keywords');
        
        return true;
    });

    // Test 7: Farm Safety Exercise
    testSuite.addTest('Farm Safety Exercise', () => {
        const scenario = 'You see a dangerous situation.';
        const question = 'What should you do?';
        const exercise = new FarmSafetyExercise(scenario, question, 'report danger', '', 0);
        
        // Test safety-aware response
        const result1 = exercise.checkAnswer('call for help');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept safety-aware response');
        
        // Test with safety keywords
        const result2 = exercise.checkAnswer('wear helmet and gloves');
        ExerciseTestSuite.assert(result2.isCorrect, 'Should accept responses with safety keywords');
        
        return true;
    });

    // Test 8: Multiple Correct Answers
    testSuite.addTest('Multiple Correct Answers', () => {
        const exercise = new Exercise('What color is grass?', ['green', 'verde'], '', 0);
        
        // Test first correct answer
        const result1 = exercise.checkAnswer('green');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should accept first correct answer');
        
        // Test second correct answer
        const result2 = exercise.checkAnswer('verde');
        ExerciseTestSuite.assert(result2.isCorrect, 'Should accept second correct answer');
        
        // Test incorrect answer
        const result3 = exercise.checkAnswer('blue');
        ExerciseTestSuite.assert(!result3.isCorrect, 'Should reject incorrect answer');
        
        return true;
    });

    // Test 9: Edge Cases - Empty Input
    testSuite.addTest('Edge Cases - Empty Input', () => {
        const exercise = new FillInBlankExercise('Test question', 'answer', '', 0);
        
        // Test empty string
        const result1 = exercise.checkAnswer('');
        ExerciseTestSuite.assert(!result1.isCorrect, 'Should reject empty string');
        
        // Test whitespace only
        const result2 = exercise.checkAnswer('   ');
        ExerciseTestSuite.assert(!result2.isCorrect, 'Should reject whitespace only');
        
        // Test null/undefined
        const result3 = exercise.checkAnswer(null);
        ExerciseTestSuite.assert(!result3.isCorrect, 'Should reject null');
        
        return true;
    });

    // Test 10: Exercise Factory
    testSuite.addTest('Exercise Factory Creation', () => {
        // Test fill-blank creation
        const fillBlank = ExerciseFactory.createFillBlankExercise('Question', 'answer', 'hint', 0);
        ExerciseTestSuite.assert(fillBlank instanceof FillInBlankExercise, 'Should create FillInBlankExercise');
        
        // Test multiple choice creation
        const multiChoice = ExerciseFactory.createMultipleChoiceExercise('Question', ['a', 'b', 'c'], 'a', 'hint', 0);
        ExerciseTestSuite.assert(multiChoice instanceof MultipleChoiceExercise, 'Should create MultipleChoiceExercise');
        
        // Test translation creation
        const translation = ExerciseFactory.createTranslationExercise('Hello', 'Salom', 'en-uz', 'hint', 0);
        ExerciseTestSuite.assert(translation instanceof TranslationExercise, 'Should create TranslationExercise');
        
        return true;
    });

    // Test 11: Farm Exercise Manager
    testSuite.addTest('Farm Exercise Manager', () => {
        const manager = new FarmWorkExerciseManager();
        
        // Test random farm exercise creation
        const farmExercise = manager.createRandomFarmExercise(0);
        ExerciseTestSuite.assert(farmExercise instanceof ScenarioExercise, 'Should create ScenarioExercise');
        
        // Test safety exercise creation
        const safetyExercise = manager.createSafetyExercise(0);
        ExerciseTestSuite.assert(safetyExercise instanceof FarmSafetyExercise, 'Should create FarmSafetyExercise');
        
        // Test supervisor exercise creation
        const supervisorExercise = manager.createSupervisorCommunicationExercise(0);
        ExerciseTestSuite.assert(supervisorExercise instanceof SupervisorCommunicationExercise, 'Should create SupervisorCommunicationExercise');
        
        return true;
    });

    // Test 12: Fuzzy Matching Edge Cases
    testSuite.addTest('Fuzzy Matching Edge Cases', () => {
        const exercise = new Exercise('Test', 'the quick brown fox', '', 0);
        
        // Test with articles
        const result1 = exercise.checkAnswer('quick brown fox');
        ExerciseTestSuite.assert(result1.isCorrect, 'Should match without articles');
        
        // Test with punctuation
        const result2 = exercise.checkAnswer('the quick, brown fox!');
        ExerciseTestSuite.assert(result2.isCorrect, 'Should match with punctuation');
        
        // Test with extra spaces
        const result3 = exercise.checkAnswer('the  quick   brown  fox');
        ExerciseTestSuite.assert(result3.isCorrect, 'Should match with extra spaces');
        
        return true;
    });

    return testSuite;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InteractiveExercises,
        ExerciseFactory,
        FarmWorkExerciseManager,
        Exercise,
        FillInBlankExercise,
        MultipleChoiceExercise,
        TranslationExercise,
        ScenarioExercise,
        SupervisorCommunicationExercise,
        FarmSafetyExercise,
        FarmEquipmentExercise,
        RolePlayingExercise,
        ExerciseTestSuite,
        initializeExerciseTests,
        injectExerciseStyles
    };
}

// Add test runner to global scope
if (typeof window !== 'undefined') {
    window.ExerciseTestSuite = ExerciseTestSuite;
    window.initializeExerciseTests = initializeExerciseTests;
    
    // Add a global function to run tests from console
    window.runExerciseTests = function() {
        const testSuite = initializeExerciseTests();
        return testSuite.runTests();
    };
}

// Global checkAnswer function for backward compatibility with existing HTML
/**
 * Enhanced global checkAnswer function with comprehensive error handling
 * Requirements: 2.1, 2.2
 */
window.checkAnswer = function(buttonOrInputId, correctAnswer, feedbackMessage) {
    console.log('checkAnswer called with:', {
        buttonOrInputId: buttonOrInputId,
        correctAnswer: correctAnswer,
        feedbackMessage: feedbackMessage,
        typeOfFirst: typeof buttonOrInputId
    });
    
    try {
        // Handle both calling patterns:
        // Pattern 1: checkAnswer(buttonElement) - chapters 0-18
        // Pattern 2: checkAnswer(inputId, correctAnswer, feedbackMessage) - chapters 19-24
        
        if (typeof buttonOrInputId === 'string') {
            // Pattern 2: chapters 19-24 format
            console.log('Using legacy pattern for chapters 19-24');
            return handleLegacyCheckAnswer(buttonOrInputId, correctAnswer, feedbackMessage);
        }
        
        // Pattern 1: chapters 0-18 format
        console.log('Using button pattern for chapters 0-18');
        const button = buttonOrInputId;
        
        // Validate button parameter (Requirement 2.1, 2.2)
        if (!button || !button.nodeType) {
            console.error('Invalid button parameter passed to checkAnswer:', button);
            handleCriticalError('Invalid button parameter', null);
            return;
        }

        // 1. Determine exercise index - auto-detect if missing data-exercise attribute
        let exerciseIndex = parseInt(button.dataset.exercise);
        
        if (isNaN(exerciseIndex)) {
            // Auto-detect from DOM structure with error handling
            try {
                exerciseIndex = autoDetectExerciseIndex(button);
                if (exerciseIndex === -1) {
                    throw new Error('Could not determine exercise index');
                }
            } catch (error) {
                console.warn('Failed to auto-detect exercise index:', error);
                handleExerciseError(button, 'Could not determine exercise index', error);
                return;
            }
        }
        
        // 2. Find the exercise container with error handling
        const exerciseContainer = findExerciseContainer(button);
        if (!exerciseContainer) {
            console.error('Exercise container not found for button:', button);
            handleCriticalError('Exercise container not found', button);
            return;
        }
        
        // 2.5. Validate exercise structure for debugging (Requirement 2.2)
        const validation = logExerciseValidation(exerciseContainer, exerciseIndex);
        if (!validation.valid) {
            console.warn('Exercise structure validation failed:', validation.errors);
            showFeedbackSafely(exerciseContainer, false, '', {
                type: 'error',
                icon: '❌',
                message: 'Mashq tuzilishi xato / Exercise structure error: ' + validation.errors.join(', '),
                class: 'incorrect'
            });
            return;
        }
        
        // 3. Find input element within exercise container with error handling
        const inputElement = findInputElement(exerciseContainer);
        
        // 4. Get user input with enhanced error handling
        let userInput;
        try {
            userInput = getUserAnswer(inputElement, exerciseContainer);
        } catch (error) {
            console.error('Error getting user input:', error);
            handleInputError(exerciseContainer, inputElement, error);
            return;
        }
        
        // Enhanced input validation with specific error messages (Requirement 2.1, 2.2)
        if (!userInput) {
            handleEmptyInput(exerciseContainer, inputElement);
            return;
        }
        
        // 5. Get correct answer from multiple possible sources with error handling
        let exerciseCorrectAnswer;
        try {
            exerciseCorrectAnswer = getCorrectAnswer(exerciseContainer, inputElement);
        } catch (error) {
            console.error('Error getting correct answer:', error);
            handleAnswerRetrievalError(exerciseContainer, error);
            return;
        }
        
        if (!exerciseCorrectAnswer) {
            console.error('Correct answer not found for exercise');
            handleMissingAnswerError(exerciseContainer);
            return;
        }
        
        // 6. Validate answer with enhanced normalization and error handling
        // Now includes exercise type detection
        let isCorrect;
        try {
            isCorrect = validateAnswer(userInput, exerciseCorrectAnswer, exerciseContainer);
        } catch (error) {
            console.error('Error validating answer:', error);
            handleValidationError(exerciseContainer, userInput, exerciseCorrectAnswer, error);
            return;
        }
        
        // 7. Show feedback and update progress with error handling
        try {
            const feedbackData = {
                type: isCorrect ? 'success' : 'error',
                icon: isCorrect ? '✓' : '✗',
                message: isCorrect ? 'To\'g\'ri! (Correct!)' : `Noto'g'ri. To'g'ri javob: <strong>${exerciseCorrectAnswer}</strong>`,
                class: isCorrect ? 'correct' : 'incorrect'
            };
            
            showFeedbackSafely(exerciseContainer, isCorrect, exerciseCorrectAnswer, feedbackData);
            
            if (isCorrect) {
                // Explicit progress tracking integration (Requirements 1.5, 2.2)
                try {
                    if (typeof ProgressTracker !== 'undefined' && typeof ProgressTracker.updateExercise === 'function') {
                        updateProgressTracking(exerciseIndex, true);
                    }
                } catch (progressError) {
                    console.warn('Progress tracking failed:', progressError);
                }
                
                handleCorrectAnswer(inputElement, button, exerciseIndex);
            } else {
                handleIncorrectAnswer(exerciseCorrectAnswer);
            }
        } catch (error) {
            console.error('Error handling answer result:', error);
            handleFeedbackError(exerciseContainer, error);
        }
        
    } catch (error) {
        // Top-level error handler (Requirement 2.1, 2.2)
        console.error('Critical error in checkAnswer function:', error);
        console.error('Error stack:', error.stack);
        
        // Try to show error feedback in any available container
        let errorContainer = null;
        
        if (typeof buttonOrInputId === 'string') {
            // For legacy format, try to find feedback element
            const feedbackId = buttonOrInputId.replace('ex', 'feedback');
            errorContainer = document.getElementById(feedbackId);
            console.log('Looking for feedback element:', feedbackId, 'found:', errorContainer);
        } else if (buttonOrInputId && buttonOrInputId.nodeType) {
            // For button format, find exercise container
            errorContainer = buttonOrInputId.closest('.exercise');
            console.log('Looking for exercise container, found:', errorContainer);
        }
        
        if (errorContainer) {
            if (errorContainer.tagName === 'DIV' && errorContainer.id && errorContainer.id.includes('feedback')) {
                // This is a feedback element
                errorContainer.innerHTML = '<span style="color: red;">❌ Tizim xatosi / System error: ' + error.message + '</span>';
                errorContainer.style.display = 'block';
                errorContainer.style.backgroundColor = '#ffebee';
                errorContainer.style.border = '1px solid #d32f2f';
                errorContainer.style.padding = '12px';
                errorContainer.style.borderRadius = '8px';
            } else {
                // This is an exercise container, find feedback element within it
                const feedbackElement = errorContainer.querySelector('.exercise-feedback');
                if (feedbackElement) {
                    feedbackElement.innerHTML = '<span style="color: red;">❌ Tizim xatosi / System error: ' + error.message + '</span>';
                    feedbackElement.style.display = 'block';
                    feedbackElement.style.backgroundColor = '#ffebee';
                    feedbackElement.style.border = '1px solid #d32f2f';
                    feedbackElement.style.padding = '12px';
                    feedbackElement.style.borderRadius = '8px';
                }
            }
        } else {
            console.error('No error container found to display error message');
            // Fallback: try to use handleCriticalError
            const buttonElement = (typeof buttonOrInputId !== 'string') ? buttonOrInputId : null;
            handleCriticalError('Unexpected error occurred', buttonElement, error);
        }
    }
};

/**
 * Handle critical errors that prevent exercise functionality (Requirement 2.1, 2.2)
 */
function handleCriticalError(message, button, error = null) {
    console.error('Critical error:', message, error);
    
    // Try to find any exercise container to show error
    let container = null;
    if (button) {
        container = button.closest('.exercise') || button.parentElement;
    }
    
    if (!container) {
        // Create temporary error display
        container = createTemporaryErrorContainer();
    }
    
    showFeedbackSafely(container, false, '', {
        type: 'error',
        icon: '❌',
        message: `Tizim xatosi / System error: ${message}`,
        class: 'incorrect'
    });
}

/**
 * Create temporary error container when no exercise container is found (Requirement 2.1)
 */
function createTemporaryErrorContainer() {
    const container = document.createElement('div');
    container.className = 'exercise error-container';
    container.style.cssText = `
        background: #ffebee;
        border: 1px solid #f44336;
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(container);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 5000);
    
    return container;
}

/**
 * Handle exercise-specific errors (Requirement 2.1, 2.2)
 */
function handleExerciseError(button, message, error) {
    console.warn('Exercise error:', message, error);
    
    const container = button.closest('.exercise') || button.parentElement;
    if (container) {
        showFeedbackSafely(container, false, '', {
            type: 'warning',
            icon: '⚠️',
            message: `Mashq xatosi / Exercise error: ${message}`,
            class: 'incorrect'
        });
    }
}

/**
 * Handle input-related errors (Requirement 2.1, 2.2)
 */
function handleInputError(exerciseContainer, inputElement, error) {
    console.error('Input error:', error);
    
    let errorMessage = 'Javob olishda xatolik / Error getting input';
    
    if (!inputElement) {
        errorMessage = 'Javob kiritish maydoni topilmadi / Input field not found';
    } else if (inputElement.disabled) {
        errorMessage = 'Bu mashq allaqachon bajarilgan / This exercise is already completed';
    }
    
    showFeedbackSafely(exerciseContainer, false, '', {
        type: 'error',
        icon: '❌',
        message: errorMessage,
        class: 'incorrect'
    });
}

/**
 * Handle empty input validation (Requirement 2.1, 2.2)
 */
function handleEmptyInput(exerciseContainer, inputElement) {
    let errorMessage = 'Iltimos, javob kiriting / Please enter an answer';
    
    // Provide more specific error messages based on input type
    if (!inputElement) {
        errorMessage = 'Xatolik: Javob kiritish maydoni topilmadi / Error: Input field not found';
        console.error('No input element found in exercise container');
    } else {
        const inputType = inputElement.type ? inputElement.type.toLowerCase() : 'text';
        
        switch (inputType) {
            case 'radio':
                errorMessage = 'Iltimos, variantlardan birini tanlang / Please select one of the options';
                break;
            case 'checkbox':
                errorMessage = 'Iltimos, kamida bitta variantni belgilang / Please check at least one option';
                break;
            default:
                errorMessage = 'Iltimos, javob kiriting / Please enter an answer';
        }
    }
    
    showFeedbackSafely(exerciseContainer, false, '', {
        type: 'warning',
        icon: '⚠️',
        message: errorMessage,
        class: 'incorrect'
    });
}

/**
 * Handle answer retrieval errors (Requirement 2.1, 2.2)
 */
function handleAnswerRetrievalError(exerciseContainer, error) {
    console.error('Answer retrieval error:', error);
    
    showFeedbackSafely(exerciseContainer, false, '', {
        type: 'error',
        icon: '❌',
        message: 'To\'g\'ri javobni olishda xatolik / Error retrieving correct answer',
        class: 'incorrect'
    });
}

/**
 * Handle missing answer configuration (Requirement 2.1, 2.2)
 */
function handleMissingAnswerError(exerciseContainer) {
    console.error('Correct answer not found for exercise');
    
    showFeedbackSafely(exerciseContainer, false, '', {
        type: 'error',
        icon: '❌',
        message: 'Mashq konfiguratsiyasi xato - to\'g\'ri javob topilmadi / Exercise configuration error - no correct answer found',
        class: 'incorrect'
    });
}

/**
 * Handle answer validation errors (Requirement 2.1, 2.2)
 */
function handleValidationError(exerciseContainer, userInput, correctAnswer, error) {
    console.error('Validation error:', error);
    
    showFeedbackSafely(exerciseContainer, false, '', {
        type: 'error',
        icon: '❌',
        message: 'Javobni tekshirishda xatolik / Error validating answer',
        class: 'incorrect'
    });
}

/**
 * Handle feedback display errors (Requirement 2.1, 2.2)
 */
function handleFeedbackError(exerciseContainer, error) {
    console.error('Feedback error:', error);
    
    // Try to show minimal feedback
    try {
        const feedback = exerciseContainer.querySelector('.exercise-feedback') || 
                        createFeedbackElement(exerciseContainer);
        feedback.innerHTML = '<span style="color: red;">⚠️ Xatolik yuz berdi / An error occurred</span>';
        feedback.style.display = 'block';
    } catch (fallbackError) {
        console.error('Could not display error feedback:', fallbackError);
    }
}

/**
 * Handle correct answer processing (Requirement 2.2)
 */
function handleCorrectAnswer(inputElement, button, exerciseIndex) {
    try {
        // Disable input and button for completed exercises
        if (inputElement) {
            inputElement.classList.add('completed');
            inputElement.disabled = true;
        }
        button.disabled = true;
        button.textContent = 'Completed';
        
        // Enhanced progress tracking integration (Requirements 1.5, 2.2)
        updateProgressTracking(exerciseIndex, true);
        
        // Log validation result for progress tracking (Requirements 4.4, 5.3)
        logValidationResultForProgress(exerciseIndex, true, inputElement);
        
        // Announce to screen readers
        announceToScreenReaderSafely(`Exercise ${exerciseIndex + 1} completed correctly!`);
    } catch (error) {
        console.error('Error handling correct answer:', error);
    }
}

/**
 * Log validation results for progress tracking compatibility
 * Ensures strict validation works with existing progress system
 * Requirements: 4.4, 5.3
 */
function logValidationResultForProgress(exerciseIndex, isCorrect, inputElement) {
    try {
        // Get validation result from element if available
        let validationResult = null;
        if (inputElement && inputElement.closest('.exercise')) {
            const exerciseElement = inputElement.closest('.exercise');
            const storedResult = exerciseElement.dataset.lastValidationResult;
            if (storedResult) {
                try {
                    validationResult = JSON.parse(storedResult);
                } catch (parseError) {
                    console.warn('Could not parse stored validation result:', parseError);
                }
            }
        }
        
        // Create progress log entry
        const progressLogEntry = {
            exerciseIndex: exerciseIndex,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString(),
            validationType: validationResult ? 'STRICT_VALIDATION' : 'STANDARD_VALIDATION',
            validationDetails: validationResult ? {
                errorType: validationResult.errorType,
                exerciseType: validationResult.debugInfo?.exerciseType || 'UNKNOWN',
                validationSteps: validationResult.debugInfo?.validationSteps || []
            } : null
        };
        
        // Store in localStorage for progress tracking analysis
        const progressLogKey = 'uzbek-textbook-validation-log';
        try {
            const existingLog = localStorage.getItem(progressLogKey);
            const logEntries = existingLog ? JSON.parse(existingLog) : [];
            
            // Keep only last 100 entries to prevent storage bloat
            if (logEntries.length >= 100) {
                logEntries.shift();
            }
            
            logEntries.push(progressLogEntry);
            localStorage.setItem(progressLogKey, JSON.stringify(logEntries));
            
        } catch (storageError) {
            console.warn('Could not store validation log:', storageError);
        }
        
        // Log for debugging
        console.log('Validation result logged for progress tracking:', progressLogEntry);
        
    } catch (error) {
        console.error('Error logging validation result for progress:', error);
    }
}

/**
 * Test integration between strict validation and progress tracking
 * Ensures compatibility between passive voice validation and progress system
 * Requirements: 4.4, 5.3
 */
function testValidationProgressIntegration() {
    try {
        console.log('Testing validation-progress integration...');
        
        // Test 1: Verify progress structure compatibility
        const isCompatible = verifyProgressStructureCompatibility();
        console.log('Progress structure compatible:', isCompatible);
        
        // Test 2: Test validation result storage
        const testElement = document.createElement('div');
        testElement.className = 'exercise';
        testElement.dataset.lastValidationResult = JSON.stringify({
            isCorrect: true,
            errorType: null,
            debugInfo: {
                exerciseType: 'PASSIVE_VOICE',
                validationSteps: [
                    { step: 'sentence_completeness', passed: true },
                    { step: 'passive_voice_structure', passed: true }
                ]
            }
        });
        
        // Test 3: Test validation result logging
        logValidationResultForProgress(0, true, testElement);
        
        // Test 4: Verify localStorage format is maintained
        if (typeof ProgressTracker !== 'undefined' && ProgressTracker.getProgress) {
            const progress = ProgressTracker.getProgress();
            const hasRequiredStructure = progress.chapters && 
                                        typeof progress.overallProgress === 'number' &&
                                        progress.chapters[0] && 
                                        Array.isArray(progress.chapters[0].exercises);
            console.log('Progress structure maintained:', hasRequiredStructure);
        }
        
        console.log('Validation-progress integration test completed successfully');
        return true;
        
    } catch (error) {
        console.error('Validation-progress integration test failed:', error);
        return false;
    }
}

/**
 * Handle incorrect answer processing (Requirement 2.2)
 */
function handleIncorrectAnswer(correctAnswer) {
    try {
        // Announce to screen readers
        announceToScreenReaderSafely(`Incorrect. The correct answer is ${correctAnswer}`);
    } catch (error) {
        console.error('Error handling incorrect answer:', error);
    }
}

/**
 * Enhanced progress tracking integration with comprehensive error handling
 * Requirements: 1.5, 2.2
 */
function updateProgressTracking(exerciseIndex, isCompleted) {
    try {
        // Enhanced ProgressTracker availability check with multiple fallback strategies
        if (typeof ProgressTracker === 'undefined') {
            console.warn('ProgressTracker not available - using direct localStorage fallback');
            
            // Use direct localStorage fallback if ProgressTracker unavailable
            return attemptDirectProgressSave(null, exerciseIndex, isCompleted);
        }
        
        // Get current chapter number with enhanced fallback handling
        let chapterNum;
        try {
            chapterNum = getCurrentChapterNumber();
            
            // Enhanced validation for chapter number (0-24 range)
            if (chapterNum < 0 || chapterNum > 24) {
                console.warn(`Invalid chapter number detected: ${chapterNum}, using enhanced fallback`);
                chapterNum = getEnhancedChapterNumberFallback();
            }
        } catch (chapterError) {
            console.error('Error getting chapter number:', chapterError);
            chapterNum = getEnhancedChapterNumberFallback();
        }
        
        // Enhanced exercise index validation with auto-correction
        if (exerciseIndex < 0 || exerciseIndex > 9) {
            console.warn(`Invalid exercise index: ${exerciseIndex}, adjusting to valid range`);
            exerciseIndex = Math.max(0, Math.min(9, exerciseIndex));
        }
        
        // Attempt to update progress with comprehensive error handling
        let updateSuccess = false;
        
        try {
            // Enhanced ProgressTracker method availability check
            if (typeof ProgressTracker.updateExercise !== 'function') {
                throw new Error('ProgressTracker.updateExercise method not available');
            }
            
            // Enhanced localStorage availability and quota check
            if (!isLocalStorageAvailable()) {
                throw new Error('localStorage not available or quota exceeded');
            }
            
            // Verify existing progress structure compatibility (Requirement 1.5)
            if (!verifyProgressStructureCompatibility()) {
                console.warn('Progress structure incompatible, attempting migration');
                migrateProgressStructure();
            }
            
            // Update the exercise progress with retry mechanism (Requirement 1.5)
            updateSuccess = ProgressTracker.updateExercise(chapterNum, exerciseIndex, isCompleted);
            
            if (updateSuccess) {
                console.log(`Progress updated successfully: Chapter ${chapterNum}, Exercise ${exerciseIndex}, Completed: ${isCompleted}`);
                
                // Enhanced event dispatching for UI updates (Requirement 1.5)
                dispatchEnhancedProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted);
                
                // Check for chapter completion and show celebration if needed
                checkChapterCompletion(chapterNum);
                
                // Validate progress consistency after update (Requirement 1.5)
                validateProgressConsistency(chapterNum, exerciseIndex);
                
                // Verify localStorage format compatibility after update (Requirement 1.5)
                verifyLocalStorageFormatCompatibility(chapterNum, exerciseIndex);
                
            } else {
                throw new Error('ProgressTracker.updateExercise returned false - possible data corruption');
            }
            
        } catch (updateError) {
            console.warn('Progress update failed, attempting recovery:', updateError);
            
            // Enhanced failure handling with multiple recovery strategies (Requirement 2.2)
            updateSuccess = handleProgressTrackingFailureWithRecovery(chapterNum, exerciseIndex, isCompleted, updateError);
        }
        
        return updateSuccess;
        
    } catch (error) {
        console.error('Critical error in progress tracking:', error);
        
        // Final fallback - ensure exercise functionality continues even if progress fails (Requirement 2.2)
        return handleCriticalProgressTrackingFailure(exerciseIndex, isCompleted, error);
    }
}

/**
 * Fallback method to determine chapter number when primary methods fail
 */
function getChapterNumberFallback() {
    try {
        // Try to extract from filename in URL
        const pathname = window.location.pathname;
        
        // Handle special case for Chapter 0 (English_for_Uzbek_Seasonal_Workers.html)
        if (pathname.includes('English_for_Uzbek_Seasonal_Workers.html')) {
            return 0;
        }
        
        // Try to match any number in the filename
        const numberMatch = pathname.match(/(\d+)/);
        if (numberMatch) {
            const num = parseInt(numberMatch[1]);
            if (num >= 0 && num <= 24) {
                return num;
            }
        }
        
        // Try to get from meta tags
        const chapterMeta = document.querySelector('meta[name="chapter"]');
        if (chapterMeta && chapterMeta.content) {
            const metaNum = parseInt(chapterMeta.content);
            if (!isNaN(metaNum) && metaNum >= 0 && metaNum <= 24) {
                return metaNum;
            }
        }
        
        // Last resort - return 1 as default
        console.warn('Could not determine chapter number, defaulting to 1');
        return 1;
        
    } catch (error) {
        console.error('Error in chapter number fallback:', error);
        return 1;
    }
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.warn('localStorage not available:', error);
        return false;
    }
}

/**
 * Dispatch custom event for progress updates
 */
function dispatchProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted) {
    try {
        const event = new CustomEvent('exerciseProgressUpdate', {
            detail: {
                chapterNumber: chapterNum,
                exerciseIndex: exerciseIndex,
                isCompleted: isCompleted,
                timestamp: new Date().toISOString()
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
        
        // Also dispatch the legacy event for backward compatibility
        const legacyEvent = new CustomEvent('exerciseCompleted', {
            detail: {
                exerciseIndex: exerciseIndex,
                isCorrect: isCompleted
            },
            bubbles: true
        });
        
        document.dispatchEvent(legacyEvent);
        
    } catch (error) {
        console.warn('Error dispatching progress update event:', error);
    }
}

/**
 * Check if chapter is completed and show celebration
 */
function checkChapterCompletion(chapterNum) {
    try {
        if (typeof ProgressTracker !== 'undefined' && typeof ProgressTracker.getChapterProgress === 'function') {
            const chapterProgress = ProgressTracker.getChapterProgress(chapterNum);
            
            if (chapterProgress && chapterProgress.completed === chapterProgress.total) {
                // Chapter completed - show celebration
                showChapterCompletionCelebration(chapterNum);
                
                // Check for course completion
                if (typeof ProgressTracker.isCourseCompleted === 'function' && ProgressTracker.isCourseCompleted()) {
                    showCourseCompletionCelebration();
                }
            }
        }
    } catch (error) {
        console.warn('Error checking chapter completion:', error);
    }
}

/**
 * Show chapter completion celebration
 */
function showChapterCompletionCelebration(chapterNum) {
    try {
        // Create celebration notification
        const notification = document.createElement('div');
        notification.className = 'chapter-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-text">
                    <strong>Tabriklaymiz!</strong><br>
                    Chapter ${chapterNum} completed!
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
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.5s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 4000);
        
        // Announce to screen readers
        announceToScreenReaderSafely(`Chapter ${chapterNum} completed! Congratulations!`);
        
    } catch (error) {
        console.warn('Error showing chapter completion celebration:', error);
    }
}

/**
 * Show course completion celebration
 */
function showCourseCompletionCelebration() {
    try {
        // Create course completion notification
        const notification = document.createElement('div');
        notification.className = 'course-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="celebration-icon">🏆</div>
                <div class="celebration-text">
                    <strong>Ajoyib!</strong><br>
                    Course completed! You can now generate your certificate.
                </div>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--md-sys-color-success-container, #d4edda);
            color: var(--md-sys-color-on-success-container, #155724);
            padding: 24px 32px;
            border-radius: 16px;
            box-shadow: 0px 8px 24px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: scaleIn 0.6s ease-out;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 6 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'scaleIn 0.6s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 600);
            }
        }, 6000);
        
        // Announce to screen readers
        announceToScreenReaderSafely('Congratulations! You have completed the entire course and can now generate your certificate!');
        
    } catch (error) {
        console.warn('Error showing course completion celebration:', error);
    }
}

/**
 * Handle progress tracking failures gracefully
 */
function handleProgressTrackingFailure(chapterNum, exerciseIndex, isCompleted, error) {
    try {
        console.error('Progress tracking failed:', {
            chapter: chapterNum,
            exercise: exerciseIndex,
            completed: isCompleted,
            error: error
        });
        
        // Store failed update for retry later
        storeFailedProgressUpdate(chapterNum, exerciseIndex, isCompleted);
        
        // Show user-friendly warning (non-blocking)
        showProgressWarning();
        
        // Try to recover by checking if we can still save to localStorage directly
        attemptDirectProgressSave(chapterNum, exerciseIndex, isCompleted);
        
    } catch (handlingError) {
        console.error('Error handling progress tracking failure:', handlingError);
    }
}

/**
 * Store failed progress update for retry later
 */
function storeFailedProgressUpdate(chapterNum, exerciseIndex, isCompleted) {
    try {
        const failedUpdates = JSON.parse(sessionStorage.getItem('failedProgressUpdates') || '[]');
        failedUpdates.push({
            chapter: chapterNum,
            exercise: exerciseIndex,
            completed: isCompleted,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 failed updates to prevent storage bloat
        if (failedUpdates.length > 50) {
            failedUpdates.splice(0, failedUpdates.length - 50);
        }
        
        sessionStorage.setItem('failedProgressUpdates', JSON.stringify(failedUpdates));
    } catch (error) {
        console.warn('Could not store failed progress update:', error);
    }
}

/**
 * Show non-blocking progress warning to user
 */
function showProgressWarning() {
    try {
        // Only show warning once per session
        if (sessionStorage.getItem('progressWarningShown')) {
            return;
        }
        
        const warning = document.createElement('div');
        warning.className = 'progress-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">Progress saving temporarily unavailable. Your answers are still being checked.</span>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        warning.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--md-sys-color-warning-container, #fff3cd);
            color: var(--md-sys-color-on-warning-container, #856404);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
            z-index: 999;
            max-width: 300px;
            font-size: 14px;
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 8000);
        
        sessionStorage.setItem('progressWarningShown', 'true');
        
    } catch (error) {
        console.warn('Error showing progress warning:', error);
    }
}

/**
 * Attempt direct progress save as fallback
 */
function attemptDirectProgressSave(chapterNum, exerciseIndex, isCompleted) {
    try {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        
        // Try to save directly to localStorage using the same format as ProgressTracker
        const storageKey = 'uzbek-textbook-progress';
        const existingData = localStorage.getItem(storageKey);
        
        if (existingData) {
            const progress = JSON.parse(existingData);
            
            if (progress.chapters && progress.chapters[chapterNum]) {
                progress.chapters[chapterNum].exercises[exerciseIndex] = isCompleted;
                progress.chapters[chapterNum].completed = progress.chapters[chapterNum].exercises.filter(Boolean).length;
                progress.lastAccessed = new Date().toISOString();
                
                localStorage.setItem(storageKey, JSON.stringify(progress));
                console.log('Direct progress save successful as fallback');
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        console.warn('Direct progress save failed:', error);
        return false;
    }
}

/**
 * Safe wrapper for showFeedback function (Requirement 2.1, 2.2)
 */
function showFeedbackSafely(exerciseContainer, isCorrect, correctAnswer, feedbackData) {
    try {
        showFeedback(exerciseContainer, isCorrect, correctAnswer, feedbackData);
    } catch (error) {
        console.error('Error in showFeedback:', error);
        // Fallback to basic feedback display
        try {
            let feedback = exerciseContainer.querySelector('.exercise-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'exercise-feedback';
                exerciseContainer.appendChild(feedback);
            }
            feedback.innerHTML = `<span style="color: ${isCorrect ? 'green' : 'red'};">${feedbackData.icon} ${feedbackData.message}</span>`;
            feedback.style.display = 'block';
        } catch (fallbackError) {
            console.error('Fallback feedback also failed:', fallbackError);
        }
    }
}

/**
 * Safe wrapper for screen reader announcements (Requirement 2.2)
 */
function announceToScreenReaderSafely(message) {
    try {
        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader(message);
        } else {
            // Fallback announcement method
            const liveRegion = document.getElementById('aria-live-region') || createAriaLiveRegion();
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    } catch (error) {
        console.warn('Error announcing to screen reader:', error);
    }
}

/**
 * Create ARIA live region if it doesn't exist (Requirement 2.2)
 */
function createAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(liveRegion);
    return liveRegion;
}

/**
 * Auto-detect exercise index from DOM structure when data-exercise is missing
 * Enhanced with comprehensive error handling (Requirement 2.1, 2.2)
 */
function autoDetectExerciseIndex(button) {
    try {
        // Validate button parameter
        if (!button || !button.nodeType) {
            console.error('Invalid button parameter in autoDetectExerciseIndex');
            return -1;
        }

        // First try to find exercise container and extract from data-exercise-id
        const exerciseContainer = button.closest('.exercise');
        if (exerciseContainer && exerciseContainer.dataset.exerciseId) {
            try {
                // Extract index from format like "15-1" -> 0, "15-2" -> 1, etc.
                const match = exerciseContainer.dataset.exerciseId.match(/-(\d+)$/);
                if (match) {
                    const index = parseInt(match[1]) - 1; // Convert to 0-based index
                    if (!isNaN(index) && index >= 0) {
                        return index;
                    } else {
                        console.warn('Invalid exercise index extracted from data-exercise-id:', match[1]);
                    }
                }
            } catch (error) {
                console.warn('Error parsing data-exercise-id:', error);
            }
        }
        
        // Fallback: calculate position among all exercises on the page
        try {
            const allExercises = document.querySelectorAll('.exercise');
            const currentExercise = button.closest('.exercise');
            
            if (currentExercise && allExercises.length > 0) {
                for (let i = 0; i < allExercises.length; i++) {
                    if (allExercises[i] === currentExercise) {
                        return i;
                    }
                }
            } else {
                console.warn('No current exercise found or no exercises on page');
            }
        } catch (error) {
            console.error('Error in fallback exercise index detection:', error);
        }
        
        // Final fallback: return -1 to indicate failure (Requirement 2.1, 2.2)
        console.error('Could not auto-detect exercise index from any method');
        return -1;
        
    } catch (error) {
        console.error('Critical error in autoDetectExerciseIndex:', error);
        return -1;
    }
}

/**
 * Find exercise container from button
 */
function findExerciseContainer(button) {
    return button.closest('.exercise');
}

/**
 * Robust input element finder within exercise container with comprehensive type support
 * Enhanced with error handling (Requirement 2.1, 2.2)
 */
function findInputElement(exerciseContainer) {
    try {
        if (!exerciseContainer || !exerciseContainer.nodeType) {
            console.warn('findInputElement: Invalid exercise container provided');
            return null;
        }
        
        // Try different input types in order of preference with detailed logging
        let inputElement = null;
        
        // 1. Look for designated exercise input class
        try {
            inputElement = exerciseContainer.querySelector('.exercise-input');
            if (inputElement && !inputElement.disabled) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding .exercise-input:', error);
        }
        
        // 2. Look for text inputs
        try {
            inputElement = exerciseContainer.querySelector('input[type="text"]');
            if (inputElement && !inputElement.disabled) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding text input:', error);
        }
        
        // 3. Look for textareas
        try {
            inputElement = exerciseContainer.querySelector('textarea');
            if (inputElement && !inputElement.disabled) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding textarea:', error);
        }
        
        // 4. Look for radio buttons (for multiple choice)
        try {
            const radioButtons = exerciseContainer.querySelectorAll('input[type="radio"]');
            if (radioButtons.length > 0) {
                // Return the radio group container or first radio button
                return radioButtons[0];
            }
        } catch (error) {
            console.warn('Error finding radio buttons:', error);
        }
        
        // 5. Look for any input element (fallback)
        try {
            inputElement = exerciseContainer.querySelector('input:not([disabled])');
            if (inputElement) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding any input:', error);
        }
        
        // 6. Look for contenteditable elements
        try {
            inputElement = exerciseContainer.querySelector('[contenteditable="true"]');
            if (inputElement) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding contenteditable element:', error);
        }
        
        // 7. Look for select elements
        try {
            inputElement = exerciseContainer.querySelector('select');
            if (inputElement && !inputElement.disabled) {
                return inputElement;
            }
        } catch (error) {
            console.warn('Error finding select element:', error);
        }
        
        console.warn('findInputElement: No suitable input element found in exercise container');
        return null;
        
    } catch (error) {
        console.error('Critical error in findInputElement:', error);
        return null;
    }
}

/**
 * Robust user answer retrieval system supporting multiple input types
 * Enhanced with comprehensive error handling (Requirement 2.1, 2.2)
 */
function getUserAnswer(inputElement, exerciseContainer) {
    try {
        if (!exerciseContainer || !exerciseContainer.nodeType) {
            console.warn('getUserAnswer: Invalid exercise container provided');
            return '';
        }
        
        // If no specific input element provided, try to find one
        if (!inputElement) {
            try {
                inputElement = findInputElement(exerciseContainer);
            } catch (error) {
                console.error('Error finding input element:', error);
                return '';
            }
        }
        
        // Handle different input types with error handling
        if (inputElement) {
            try {
                const inputType = inputElement.type ? inputElement.type.toLowerCase() : 'text';
                const tagName = inputElement.tagName.toLowerCase();
                
                switch (inputType) {
                    case 'text':
                    case 'email':
                    case 'url':
                    case 'search':
                        try {
                            return inputElement.value ? inputElement.value.trim() : '';
                        } catch (error) {
                            console.warn('Error getting text input value:', error);
                            return '';
                        }
                        
                    case 'textarea':
                    case undefined: // For textarea elements
                        if (tagName === 'textarea') {
                            try {
                                return inputElement.value ? inputElement.value.trim() : '';
                            } catch (error) {
                                console.warn('Error getting textarea value:', error);
                                return '';
                            }
                        }
                        break;
                        
                    case 'radio':
                        // For radio buttons, we need to find the checked one
                        try {
                            const checkedRadio = exerciseContainer.querySelector('input[type="radio"]:checked');
                            return checkedRadio ? checkedRadio.value.trim() : '';
                        } catch (error) {
                            console.warn('Error getting radio button value:', error);
                            return '';
                        }
                        
                    case 'checkbox':
                        // For checkboxes, collect all checked values
                        try {
                            const checkedBoxes = exerciseContainer.querySelectorAll('input[type="checkbox"]:checked');
                            const checkedValues = Array.from(checkedBoxes).map(cb => cb.value.trim());
                            return checkedValues.join(', ');
                        } catch (error) {
                            console.warn('Error getting checkbox values:', error);
                            return '';
                        }
                        
                    case 'select-one':
                    case 'select-multiple':
                        try {
                            if (inputElement.value !== undefined) {
                                return inputElement.value.trim();
                            }
                        } catch (error) {
                            console.warn('Error getting select value:', error);
                            return '';
                        }
                        break;
                        
                    default:
                        // Fallback for other input types
                        try {
                            if (inputElement.value !== undefined) {
                                return inputElement.value.trim();
                            }
                        } catch (error) {
                            console.warn('Error getting default input value:', error);
                            return '';
                        }
                }
                
                // Handle contenteditable elements
                try {
                    if (inputElement.hasAttribute('contenteditable')) {
                        return inputElement.textContent ? inputElement.textContent.trim() : '';
                    }
                } catch (error) {
                    console.warn('Error getting contenteditable value:', error);
                }
                
            } catch (error) {
                console.error('Error processing input element:', error);
            }
        }
        
        // Final fallback: try to find any checked radio button in the container
        try {
            const radioElement = exerciseContainer.querySelector('input[type="radio"]:checked');
            if (radioElement) {
                return radioElement.value.trim();
            }
        } catch (error) {
            console.warn('Error in radio fallback:', error);
        }
        
        // Try to find any checkbox that's checked
        try {
            const checkboxElement = exerciseContainer.querySelector('input[type="checkbox"]:checked');
            if (checkboxElement) {
                return checkboxElement.value.trim();
            }
        } catch (error) {
            console.warn('Error in checkbox fallback:', error);
        }
        
        // Try to find any select element
        try {
            const selectElement = exerciseContainer.querySelector('select');
            if (selectElement && selectElement.value) {
                return selectElement.value.trim();
            }
        } catch (error) {
            console.warn('Error in select fallback:', error);
        }
        
        console.warn('getUserAnswer: Could not retrieve user input from exercise container');
        return '';
        
    } catch (error) {
        console.error('Critical error in getUserAnswer:', error);
        return '';
    }
}

/**
 * Get correct answer from multiple possible data attribute sources
 * Enhanced with comprehensive error handling (Requirement 2.1, 2.2)
 */
function getCorrectAnswer(exerciseContainer, inputElement) {
    try {
        if (!exerciseContainer || !exerciseContainer.nodeType) {
            console.warn('getCorrectAnswer: Invalid exercise container provided');
            return '';
        }

        // Priority 1: data-correct on input element (chapters 0-10 format)
        try {
            if (inputElement && inputElement.dataset && inputElement.dataset.correct) {
                const answer = inputElement.dataset.correct.trim();
                if (answer) {
                    return answer;
                }
            }
        } catch (error) {
            console.warn('Error getting data-correct from input element:', error);
        }
        
        // Priority 2: data-answer on exercise container (chapters 11-24 format)
        try {
            if (exerciseContainer.dataset && exerciseContainer.dataset.answer) {
                const answer = exerciseContainer.dataset.answer.trim();
                if (answer) {
                    return answer;
                }
            }
        } catch (error) {
            console.warn('Error getting data-answer from exercise container:', error);
        }
        
        // Priority 3: Check for data-correct on any input within the container
        try {
            const inputWithCorrect = exerciseContainer.querySelector('[data-correct]');
            if (inputWithCorrect && inputWithCorrect.dataset && inputWithCorrect.dataset.correct) {
                const answer = inputWithCorrect.dataset.correct.trim();
                if (answer) {
                    return answer;
                }
            }
        } catch (error) {
            console.warn('Error finding input with data-correct:', error);
        }
        
        // Priority 4: Check for data-answer on any element within the container
        try {
            const elementWithAnswer = exerciseContainer.querySelector('[data-answer]');
            if (elementWithAnswer && elementWithAnswer.dataset && elementWithAnswer.dataset.answer) {
                const answer = elementWithAnswer.dataset.answer.trim();
                if (answer) {
                    return answer;
                }
            }
        } catch (error) {
            console.warn('Error finding element with data-answer:', error);
        }
        
        // Priority 5: Check for answer in exercise configuration (if using class-based system)
        try {
            const exerciseId = exerciseContainer.dataset.exerciseId || exerciseContainer.id;
            if (exerciseId && window.exerciseAnswers && window.exerciseAnswers[exerciseId]) {
                return window.exerciseAnswers[exerciseId];
            }
        } catch (error) {
            console.warn('Error checking global exercise answers:', error);
        }
        
        console.warn('getCorrectAnswer: No correct answer found in any expected location');
        return '';
        
    } catch (error) {
        console.error('Critical error in getCorrectAnswer:', error);
        return '';
    }
}

/**
 * Exercise Type Detection System for Passive Voice Validation Fix
 * Detects exercise types based on context and applies appropriate validation
 */

/**
 * Detect exercise type from context information
 * Requirements: 4.1, 4.2, 4.3
 */
function detectExerciseType(exerciseContext) {
    if (!exerciseContext) {
        return 'STANDARD';
    }
    
    // Convert context to lowercase for case-insensitive matching
    const contextText = exerciseContext.toLowerCase();
    
    // Passive voice indicators to look for
    const passiveIndicators = [
        'vaziyat: talk about an official process, passive voice',
        'passive voice',
        'passiv nisbat',
        'official process',
        'rasmiy jarayon',
        'majhul nisbat',
        'write your sentence using passive voice',
        'using passive voice',
        'passive voice formation',
        'active to passive voice',
        'past passive voice'
    ];
    
    // Check if any passive voice indicator is present
    for (const indicator of passiveIndicators) {
        if (contextText.includes(indicator)) {
            return 'PASSIVE_VOICE';
        }
    }
    
    return 'STANDARD';
}

/**
 * Extract exercise context from exercise element
 * Scans exercise containers for passive voice indicators
 * Requirements: 4.1, 4.2
 */
function extractExerciseContext(exerciseElement) {
    if (!exerciseElement) {
        return '';
    }
    
    let contextText = '';
    
    // Get text from exercise question
    const questionElement = exerciseElement.querySelector('.exercise-question');
    if (questionElement) {
        contextText += questionElement.textContent + ' ';
    }
    
    // Get text from scenario elements (for scenario exercises)
    const scenarioElement = exerciseElement.querySelector('.exercise-scenario');
    if (scenarioElement) {
        contextText += scenarioElement.textContent + ' ';
    }
    
    // Get text from any paragraph elements within the exercise
    // This is crucial for passive voice exercises which have "Vaziyat:" in <p> elements
    const paragraphs = exerciseElement.querySelectorAll('p');
    paragraphs.forEach(p => {
        contextText += p.textContent + ' ';
    });
    
    // Get text from data attributes that might contain context
    const contextData = exerciseElement.dataset.context || '';
    const hintData = exerciseElement.dataset.hint || '';
    contextText += contextData + ' ' + hintData;
    
    // Enhanced: Look for specific passive voice context patterns
    // Check for "Vaziyat:" followed by passive voice indicators
    const vaziyatElements = exerciseElement.querySelectorAll('p strong');
    vaziyatElements.forEach(strong => {
        if (strong.textContent.toLowerCase().includes('vaziyat')) {
            // Get the full paragraph containing the Vaziyat
            const paragraph = strong.closest('p');
            if (paragraph) {
                contextText += paragraph.textContent + ' ';
            }
        }
    });
    
    // Also check parent elements for broader context (like section headers)
    let parentElement = exerciseElement.parentElement;
    let searchDepth = 0;
    while (parentElement && searchDepth < 3) {
        // Look for grammar section headers or context information
        const grammarHeaders = parentElement.querySelectorAll('h3, h4, .grammar-intro');
        grammarHeaders.forEach(header => {
            if (header.textContent.toLowerCase().includes('passive') || 
                header.textContent.toLowerCase().includes('majhul')) {
                contextText += header.textContent + ' ';
            }
        });
        
        // Also check for any Vaziyat elements in parent containers
        const parentVaziyatElements = parentElement.querySelectorAll('p strong');
        parentVaziyatElements.forEach(strong => {
            if (strong.textContent.toLowerCase().includes('vaziyat')) {
                const paragraph = strong.closest('p');
                if (paragraph) {
                    contextText += paragraph.textContent + ' ';
                }
            }
        });
        
        parentElement = parentElement.parentElement;
        searchDepth++;
    }
    
    return contextText.trim();
}

/**
 * Create mapping system for different exercise types
 * Requirements: 4.3
 */
const EXERCISE_TYPE_MAPPING = {
    'PASSIVE_VOICE': {
        name: 'Passive Voice Exercise',
        description: 'Exercises focusing on passive voice grammar structure',
        validationMethod: 'validatePassiveVoiceAnswer',
        strictValidation: true,
        requiresCompletesentence: true,
        requiresPassiveStructure: true
    },
    'STANDARD': {
        name: 'Standard Exercise',
        description: 'Regular exercises with standard validation',
        validationMethod: 'validateStandardAnswer',
        strictValidation: false,
        requiresCompletesentence: false,
        requiresPassiveStructure: false
    }
};

/**
 * Get exercise type configuration
 * Requirements: 4.3
 */
function getExerciseTypeConfig(exerciseType) {
    return EXERCISE_TYPE_MAPPING[exerciseType] || EXERCISE_TYPE_MAPPING['STANDARD'];
}

/**
 * Validation logging system for debugging and monitoring
 * Provides detailed logging for each validation step with performance timing
 * Requirements: 4.3, 5.4, 5.5
 */
const ValidationLogger = {
    // Enable/disable logging (can be controlled via localStorage or config)
    enabled: localStorage.getItem('validation-debug') === 'true' || false,
    
    // Performance timing storage
    timings: {},
    
    // Validation step logs
    logs: [],
    
    // Maximum number of logs to keep in memory
    maxLogs: 100,
    
    /**
     * Start timing a validation step
     */
    startTiming(stepName) {
        if (!this.enabled) return;
        this.timings[stepName] = performance.now();
    },
    
    /**
     * End timing a validation step and log the duration
     */
    endTiming(stepName) {
        if (!this.enabled || !this.timings[stepName]) return;
        
        const duration = performance.now() - this.timings[stepName];
        delete this.timings[stepName];
        
        this.log('TIMING', `${stepName}: ${duration.toFixed(2)}ms`, { duration, step: stepName });
        return duration;
    },
    
    /**
     * Log validation step with details
     */
    log(level, message, details = {}) {
        if (!this.enabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            details,
            stack: new Error().stack
        };
        
        // Add to logs array
        this.logs.push(logEntry);
        
        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Console output with appropriate level
        switch (level) {
            case 'ERROR':
                console.error(`[VALIDATION] ${message}`, details);
                break;
            case 'WARN':
                console.warn(`[VALIDATION] ${message}`, details);
                break;
            case 'INFO':
                console.info(`[VALIDATION] ${message}`, details);
                break;
            case 'DEBUG':
                console.debug(`[VALIDATION] ${message}`, details);
                break;
            case 'TIMING':
                console.log(`[VALIDATION-TIMING] ${message}`, details);
                break;
            default:
                console.log(`[VALIDATION] ${message}`, details);
        }
    },
    
    /**
     * Log validation pipeline step
     */
    logStep(stepName, passed, details = {}) {
        this.log('DEBUG', `Validation step: ${stepName} - ${passed ? 'PASSED' : 'FAILED'}`, {
            step: stepName,
            passed,
            ...details
        });
    },
    
    /**
     * Log validation failure with detailed information
     */
    logFailure(stepName, userInput, expectedAnswer, reason, details = {}) {
        this.log('WARN', `Validation failed at ${stepName}: ${reason}`, {
            step: stepName,
            userInput,
            expectedAnswer,
            reason,
            ...details
        });
    },
    
    /**
     * Log validation success
     */
    logSuccess(exerciseType, userInput, expectedAnswer, details = {}) {
        this.log('INFO', `Validation successful for ${exerciseType}`, {
            exerciseType,
            userInput,
            expectedAnswer,
            ...details
        });
    },
    
    /**
     * Get recent logs for debugging
     */
    getRecentLogs(count = 20) {
        return this.logs.slice(-count);
    },
    
    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.timings = {};
    },
    
    /**
     * Export logs as JSON for analysis
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    },
    
    /**
     * Enable debugging mode
     */
    enableDebug() {
        this.enabled = true;
        localStorage.setItem('validation-debug', 'true');
        this.log('INFO', 'Validation debugging enabled');
    },
    
    /**
     * Disable debugging mode
     */
    disableDebug() {
        this.enabled = false;
        localStorage.removeItem('validation-debug');
        console.log('[VALIDATION] Debugging disabled');
    }
};

/**
 * Enhanced answer validation with exercise type detection and comprehensive logging
 * Main entry point that routes to appropriate validation method
 * Requirements: 4.1, 4.2, 4.4
 */
function validateAnswer(userInput, correctAnswer, exerciseElement = null) {
    ValidationLogger.startTiming('total_validation');
    ValidationLogger.log('DEBUG', 'Starting validation', { 
        userInput, 
        correctAnswer, 
        hasElement: !!exerciseElement 
    });
    
    if (!userInput || !correctAnswer) {
        ValidationLogger.logFailure('input_validation', userInput, correctAnswer, 'Empty input or correct answer');
        ValidationLogger.endTiming('total_validation');
        return false;
    }
    
    // Extract exercise context and detect type
    ValidationLogger.startTiming('exercise_type_detection');
    let exerciseType = 'STANDARD';
    let exerciseContext = '';
    
    if (exerciseElement) {
        exerciseContext = extractExerciseContext(exerciseElement);
        exerciseType = detectExerciseType(exerciseContext);
        
        ValidationLogger.logStep('exercise_type_detection', true, {
            exerciseType,
            contextLength: exerciseContext.length,
            contextPreview: exerciseContext.substring(0, 100) + '...'
        });
    }
    ValidationLogger.endTiming('exercise_type_detection');
    
    // Route to appropriate validation method based on exercise type
    ValidationLogger.startTiming('validation_routing');
    const config = getExerciseTypeConfig(exerciseType);
    let result;
    
    if (exerciseType === 'PASSIVE_VOICE') {
        ValidationLogger.log('INFO', 'Routing to passive voice validation');
        const validationResult = validatePassiveVoiceAnswer(userInput, correctAnswer);
        
        // Store detailed validation result for potential use by calling code
        if (exerciseElement) {
            exerciseElement.dataset.lastValidationResult = JSON.stringify(validationResult);
        }
        
        result = validationResult.isCorrect;
        
        if (result) {
            ValidationLogger.logSuccess('PASSIVE_VOICE', userInput, correctAnswer, validationResult);
        } else {
            ValidationLogger.logFailure('passive_voice_validation', userInput, correctAnswer, 
                validationResult.errorType, validationResult);
        }
    } else {
        ValidationLogger.log('INFO', 'Routing to standard validation');
        result = validateStandardAnswer(userInput, correctAnswer);
        
        if (result) {
            ValidationLogger.logSuccess('STANDARD', userInput, correctAnswer);
        } else {
            ValidationLogger.logFailure('standard_validation', userInput, correctAnswer, 'Standard validation failed');
        }
    }
    
    ValidationLogger.endTiming('validation_routing');
    const totalTime = ValidationLogger.endTiming('total_validation');
    
    ValidationLogger.log('INFO', `Validation completed in ${totalTime?.toFixed(2)}ms`, {
        result,
        exerciseType,
        totalTime
    });
    
    return result;
}

/**
 * Standard answer validation (existing logic)
 * Used for non-passive voice exercises
 * Requirements: 4.2, 4.4
 */
function validateStandardAnswer(userInput, correctAnswer) {
    if (!userInput || !correctAnswer) return false;
    
    // Normalize both answers with comprehensive cleaning
    const normalizedUser = normalizeAnswer(userInput);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Handle multiple correct answers separated by delimiters
    const correctAnswers = parseMultipleAnswers(normalizedCorrect);
    
    // Check if user answer matches any of the correct answers using fuzzy matching
    return correctAnswers.some(answer => fuzzyMatch(normalizedUser, answer));
}

/**
 * Check if the user input is a complete sentence
 * Validates word count, capitalization, and basic verb presence
 * Requirements: 1.1, 1.2
 */
function isCompleteSentence(answer) {
    if (!answer || typeof answer !== 'string') {
        return false;
    }
    
    const trimmed = answer.trim();
    
    // Must have content
    if (trimmed.length === 0) {
        return false;
    }
    
    // Must have at least 3 words for a basic sentence
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 3) {
        return false;
    }
    
    // Must start with capital letter
    const startsWithCapital = /^[A-Z]/.test(trimmed);
    if (!startsWithCapital) {
        return false;
    }
    
    // Must contain a verb (basic check for common verbs including "to be" verbs)
    const containsVerb = /\b(is|are|was|were|am|been|be|have|has|had|do|does|did|will|would|can|could|should|must|may|might)\b/i.test(trimmed);
    if (!containsVerb) {
        return false;
    }
    
    // Additional sentence structure validation
    return hasValidSentenceStructure(trimmed);
}

/**
 * Validate sentence structure using pattern matching
 * Implements subject-verb-object detection logic and complete grammatical units
 * Requirements: 1.1, 2.1
 */
function hasValidSentenceStructure(sentence) {
    if (!sentence || typeof sentence !== 'string') {
        return false;
    }
    
    const normalized = sentence.toLowerCase().trim();
    
    // Basic sentence structure patterns - more flexible to handle spelling variations
    const sentencePatterns = [
        // Subject + Verb + Object/Complement patterns
        // Pattern 1: [Subject] + [to be] + [adjective/noun] (e.g., "The forms are required")
        /^[a-z\s]+(is|are|was|were|am|been|a+re|i+s|wa+s|we+re)\s+[a-z\s]+$/,
        
        // Pattern 2: [Subject] + [auxiliary] + [been] + [past participle] (e.g., "The forms have been completed")
        /^[a-z\s]+(have|has|had|ha+ve|ha+s|ha+d)\s+been\s+[a-z\s]+$/,
        
        // Pattern 3: [Subject] + [modal] + [be] + [past participle] (e.g., "The forms must be signed")
        /^[a-z\s]+(must|should|could|would|can|may|might)\s+be\s+[a-z\s]+$/,
        
        // Pattern 4: [Subject] + [verb] + [object] (general SVO pattern)
        /^[a-z\s]+(is|are|was|were|am|have|has|had|do|does|did|will|would|can|could|should|must|may|might|a+re|i+s|wa+s|we+re|ha+ve|ha+s|ha+d)\s+[a-z\s]+$/,
        
        // Pattern 5: [There] + [to be] + [noun phrase] (e.g., "There are forms required")
        /^there\s+(is|are|was|were|a+re|i+s|wa+s|we+re)\s+[a-z\s]+$/,
        
        // Pattern 6: [It] + [to be] + [adjective/past participle] (e.g., "It is required")
        /^it\s+(is|was|i+s|wa+s)\s+[a-z\s]+$/
    ];
    
    // Check if sentence matches any valid pattern
    const matchesPattern = sentencePatterns.some(pattern => pattern.test(normalized));
    
    if (!matchesPattern) {
        return false;
    }
    
    // Additional validation for complete grammatical units
    return hasCompleteGrammaticalUnit(normalized);
}

/**
 * Check for complete grammatical units
 * Validates that the sentence has proper subject-verb agreement and structure
 * Requirements: 1.1, 2.1
 */
function hasCompleteGrammaticalUnit(sentence) {
    if (!sentence) {
        return false;
    }
    
    const words = sentence.split(/\s+/).filter(word => word.length > 0);
    
    // Must have at least subject + verb + complement/object
    if (words.length < 3) {
        return false;
    }
    
    // Check for basic subject-verb patterns - more flexible with spelling
    const subjectVerbPatterns = [
        // Singular subjects with singular verbs (including spelling variations)
        /\b(the\s+\w+|this\s+\w+|that\s+\w+|a\s+\w+|an\s+\w+|\w+)\s+(is|was|has|does|i+s|wa+s|ha+s|doe+s)\b/,
        
        // Plural subjects with plural verbs (including spelling variations)
        /\b(the\s+\w+s|these\s+\w+|those\s+\w+|\w+s|the\s+\w+)\s+(are|were|have|do|a+re|we+re|ha+ve|d+o)\b/,
        
        // Modal verbs (work with any subject)
        /\b(\w+)\s+(must|should|could|would|can|may|might)\s+be\b/,
        
        // Perfect tenses (including spelling variations)
        /\b(\w+)\s+(have|has|had|ha+ve|ha+s|ha+d)\s+been\b/,
        
        // There constructions (including spelling variations)
        /\bthere\s+(is|are|was|were|i+s|a+re|wa+s|we+re)\s+\w+/,
        
        // It constructions (including spelling variations)
        /\bit\s+(is|was|i+s|wa+s)\s+\w+/
    ];
    
    // Check if sentence contains valid subject-verb patterns
    const hasValidSubjectVerb = subjectVerbPatterns.some(pattern => pattern.test(sentence));
    
    if (!hasValidSubjectVerb) {
        return false;
    }
    
    // Check that sentence doesn't consist only of disconnected words
    // (e.g., reject "was have worked can speak" as it has no coherent structure)
    const hasCoherentStructure = !isDisconnectedWords(sentence);
    
    return hasCoherentStructure;
}

/**
 * Check if the sentence consists of disconnected words without proper structure
 * Helps reject answers like "was have worked can speak has made"
 * Requirements: 1.1, 2.1
 */
function isDisconnectedWords(sentence) {
    if (!sentence) {
        return true;
    }
    
    const words = sentence.split(/\s+/).filter(word => word.length > 0);
    
    // Count auxiliary verbs and modals
    const auxiliaryVerbs = ['is', 'are', 'was', 'were', 'am', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did'];
    const modalVerbs = ['will', 'would', 'can', 'could', 'should', 'must', 'may', 'might'];
    
    let auxiliaryCount = 0;
    let modalCount = 0;
    
    words.forEach(word => {
        if (auxiliaryVerbs.includes(word)) {
            auxiliaryCount++;
        }
        if (modalVerbs.includes(word)) {
            modalCount++;
        }
    });
    
    // If there are too many auxiliary verbs or modals relative to sentence length,
    // it's likely disconnected words
    const totalVerbs = auxiliaryCount + modalCount;
    const verbRatio = totalVerbs / words.length;
    
    // If more than 40% of words are auxiliary/modal verbs, likely disconnected
    if (verbRatio > 0.4) {
        return true;
    }
    
    // Check for specific problematic patterns
    const problematicPatterns = [
        // Multiple auxiliary verbs in sequence without proper structure
        /\b(was|were|is|are)\s+(have|has|had)\s+(worked|made|done|taken)\b/,
        
        // Random collection of modals and auxiliaries
        /\b(can|could|must|should)\s+(have|has|had)\s+(was|were|is|are)\b/,
        
        // Multiple past participles without proper structure
        /\b(worked|made|done|taken|required|completed)\s+(worked|made|done|taken|required|completed)\b/
    ];
    
    return problematicPatterns.some(pattern => pattern.test(sentence));
}

/**
 * Dictionary of irregular past participles for passive voice validation
 * Comprehensive list of common irregular verbs and their past participle forms
 * Requirements: 2.1, 2.2
 */
const IRREGULAR_PAST_PARTICIPLES = [
    // Common irregular verbs
    'made', 'done', 'taken', 'given', 'written', 'spoken', 'broken', 'chosen',
    'driven', 'eaten', 'fallen', 'forgotten', 'grown', 'hidden', 'known', 'seen',
    'shown', 'thrown', 'worn', 'built', 'bought', 'brought', 'caught', 'cut',
    'felt', 'found', 'heard', 'held', 'kept', 'left', 'lost', 'met', 'paid',
    'put', 'read', 'said', 'sent', 'sold', 'told', 'thought', 'understood', 'won',
    
    // Additional irregular forms common in workplace contexts
    'begun', 'bent', 'bet', 'bound', 'bled', 'blown', 'bred', 'come', 'cost',
    'dealt', 'dug', 'drawn', 'drunk', 'fed', 'fled', 'flown', 'forbidden',
    'frozen', 'gotten', 'gone', 'hung', 'hurt', 'laid', 'led', 'lent', 'lit',
    'meant', 'overcome', 'ridden', 'risen', 'run', 'shaken', 'shed', 'shone',
    'shot', 'shut', 'slept', 'slid', 'spent', 'split', 'spread', 'stood',
    'stolen', 'stuck', 'stung', 'struck', 'strung', 'sung', 'sunk', 'swept',
    'swum', 'swung', 'taught', 'torn', 'woken', 'woven',
    
    // Forms specific to seasonal work contexts
    'grown', 'picked', 'planted', 'harvested', 'packed', 'sorted', 'loaded',
    'unloaded', 'cleaned', 'washed', 'dried', 'stored', 'transported', 'delivered'
];

/**
 * Check if the answer contains proper passive voice structure
 * Validates passive voice grammar patterns including simple, perfect, and modal passive
 * Requirements: 2.1, 2.2, 2.3
 */
function hasPassiveVoiceStructure(answer) {
    if (!answer || typeof answer !== 'string') {
        return false;
    }
    
    const normalized = answer.toLowerCase().trim();
    
    // Simple passive voice pattern: [Subject] + [to be verb] + [past participle]
    // Examples: "The forms are required", "It is done", "They were taken"
    const simplePassivePattern = /\b(is|are|was|were|am|been)\s+\w*(ed|en|d)\b/;
    
    // Perfect passive voice pattern: [Subject] + [have/has/had] + been + [past participle]
    // Examples: "The forms have been required", "It has been done"
    const perfectPassivePattern = /\b(have|has|had)\s+been\s+\w*(ed|en|d)\b/;
    
    // Modal passive voice pattern: [Subject] + [modal] + be + [past participle]
    // Examples: "The forms must be required", "It should be done"
    const modalPassivePattern = /\b(must|should|could|would|can|may|might|will)\s+be\s+\w*(ed|en|d)\b/;
    
    // Check for regular past participle patterns first
    if (simplePassivePattern.test(normalized) || 
        perfectPassivePattern.test(normalized) || 
        modalPassivePattern.test(normalized)) {
        return true;
    }
    
    // Create dynamic patterns for irregular past participles
    const irregularParticiples = IRREGULAR_PAST_PARTICIPLES.join('|');
    
    // Check for irregular past participles with simple passive
    const irregularSimplePassive = new RegExp(`\\b(is|are|was|were|am|been)\\s+(${irregularParticiples})\\b`);
    
    // Check for irregular past participles with perfect passive
    const irregularPerfectPassive = new RegExp(`\\b(have|has|had)\\s+been\\s+(${irregularParticiples})\\b`);
    
    // Check for irregular past participles with modal passive
    const irregularModalPassive = new RegExp(`\\b(must|should|could|would|can|may|might|will)\\s+be\\s+(${irregularParticiples})\\b`);
    
    return irregularSimplePassive.test(normalized) || 
           irregularPerfectPassive.test(normalized) || 
           irregularModalPassive.test(normalized);
}

/**
 * Validate irregular past participle forms in passive constructions
 * Implements pattern matching for irregular forms and common irregular passive constructions
 * Requirements: 2.1, 2.2
 */
function validateIrregularPassiveConstruction(answer) {
    if (!answer || typeof answer !== 'string') {
        return false;
    }
    
    const normalized = answer.toLowerCase().trim();
    
    // Check for common irregular passive constructions specific to workplace contexts
    const workplacePassivePatterns = [
        // Forms completion patterns
        /\b(forms|documents|papers)\s+(are|were|have been|must be)\s+(completed|filled|signed|submitted)\b/,
        
        // Work task patterns
        /\b(work|tasks|jobs)\s+(are|were|have been|will be)\s+(done|finished|completed|assigned)\b/,
        
        // Safety equipment patterns
        /\b(equipment|tools|safety gear)\s+(is|was|has been|must be)\s+(worn|used|checked|maintained)\b/,
        
        // Communication patterns
        /\b(instructions|orders|information)\s+(are|were|have been|will be)\s+(given|told|explained|understood)\b/,
        
        // Process patterns
        /\b(process|procedure|method)\s+(is|was|has been|should be)\s+(followed|understood|known|taught)\b/
    ];
    
    // Check if the answer matches any workplace-specific passive patterns
    return workplacePassivePatterns.some(pattern => pattern.test(normalized));
}

/**
 * Specific error message system for passive voice validation
 * Provides detailed Uzbek error messages for different validation failures
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
const PassiveVoiceErrorMessages = {
    EMPTY_INPUT: {
        uzbek: "Noto'g'ri - Javob kiritilmagan",
        english: "Incorrect - No answer provided",
        icon: "❌",
        type: "error",
        category: "input"
    },
    INCOMPLETE: {
        uzbek: "Noto'g'ri - Javob to'liq jumla bo'lishi kerak",
        english: "Incorrect - Answer must be a complete sentence",
        icon: "📝",
        type: "error",
        category: "structure",
        hint: "Jumla kamida 3 ta so'zdan iborat bo'lishi va bosh harf bilan boshlanishi kerak"
    },
    SPELLING: {
        uzbek: "Noto'g'ri - Imlo xatosi bor",
        english: "Incorrect - There are spelling errors",
        icon: "📖",
        type: "error",
        category: "spelling",
        hint: "So'zlarning to'g'ri yozilishini tekshiring"
    },
    GRAMMAR: {
        uzbek: "Noto'g'ri - Passiv nisbat ishlatilmagan",
        english: "Incorrect - Passive voice not used",
        icon: "📚",
        type: "error",
        category: "grammar",
        hint: "Passiv nisbat: Subject + 'to be' (am/is/are/was/were) + Past Participle (V3)"
    },
    CONTENT: {
        uzbek: "Noto'g'ri - Ortiqcha so'zlar mavjud",
        english: "Incorrect - Extra words present",
        icon: "✂️",
        type: "error",
        category: "content",
        hint: "Faqat kerakli so'zlarni ishlating, ortiqcha so'zlarni olib tashlang"
    },
    SUCCESS: {
        uzbek: "To'g'ri!",
        english: "Correct!",
        icon: "✅",
        type: "success",
        category: "success"
    }
};

/**
 * Get formatted error message for passive voice validation
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
function getPassiveVoiceErrorMessage(errorType, userInput = '', correctAnswer = '') {
    const messageData = PassiveVoiceErrorMessages[errorType] || PassiveVoiceErrorMessages.EMPTY_INPUT;
    
    let message = `${messageData.uzbek} (${messageData.english})`;
    
    // Add correct answer for certain error types
    if (errorType === 'CONTENT' || errorType === 'SPELLING') {
        message += `<br><strong>To'g'ri javob:</strong> ${correctAnswer}`;
    }
    
    // Add hint if available
    if (messageData.hint) {
        message += `<br><small><em>Maslahat:</em> ${messageData.hint}</small>`;
    }
    
    return {
        message: message,
        icon: messageData.icon,
        type: messageData.type,
        category: messageData.category,
        class: messageData.type === 'success' ? 'correct' : 'incorrect'
    };
}

/**
 * Passive voice answer validation with multi-layer validation pipeline and error reporting
 * Implements strict validation for passive voice exercises with early returns
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
function validatePassiveVoiceAnswer(userInput, correctAnswer) {
    ValidationLogger.startTiming('passive_voice_validation');
    ValidationLogger.log('DEBUG', 'Starting passive voice validation', { userInput, correctAnswer });
    
    if (!userInput || !correctAnswer) {
        const errorMessage = getPassiveVoiceErrorMessage('EMPTY_INPUT', userInput, correctAnswer);
        const errorId = ValidationErrorReporter.reportValidationFailure({
            category: ValidationErrorReporter.errorCategories.INPUT_VALIDATION,
            step: 'input_validation',
            userInput: userInput,
            expectedAnswer: correctAnswer,
            exerciseType: 'PASSIVE_VOICE',
            errorType: 'EMPTY_INPUT',
            reason: 'Empty input or correct answer provided',
            details: { 
                userInputLength: userInput?.length || 0, 
                correctAnswerLength: correctAnswer?.length || 0,
                context: ValidationErrorReporter.collectContextData()
            }
        });
        
        ValidationLogger.endTiming('passive_voice_validation');
        return {
            isCorrect: false,
            errorType: 'EMPTY_INPUT',
            feedback: errorMessage,
            debugInfo: {
                step: 'input_validation',
                userInput: userInput,
                correctAnswer: correctAnswer,
                errorId: errorId
            }
        };
    }

    const validation = {
        isCorrect: false,
        errorType: null,
        feedback: null,
        debugInfo: {
            userInput: userInput,
            correctAnswer: correctAnswer,
            validationSteps: []
        }
    };

    try {
        // Layer 1: Completeness check
        ValidationLogger.startTiming('sentence_completeness_check');
        if (!isCompleteSentence(userInput)) {
            validation.errorType = 'INCOMPLETE';
            validation.feedback = getPassiveVoiceErrorMessage('INCOMPLETE', userInput, correctAnswer);
            validation.debugInfo.validationSteps.push({
                step: 'sentence_completeness',
                passed: false,
                details: 'Answer is not a complete sentence'
            });
            
            const errorId = ValidationErrorReporter.reportValidationFailure({
                category: ValidationErrorReporter.errorCategories.SENTENCE_COMPLETENESS,
                step: 'sentence_completeness',
                userInput: userInput,
                expectedAnswer: correctAnswer,
                exerciseType: 'PASSIVE_VOICE',
                errorType: 'INCOMPLETE',
                reason: 'Answer is not a complete sentence',
                details: { 
                    wordCount: userInput.trim().split(/\s+/).length,
                    startsWithCapital: /^[A-Z]/.test(userInput.trim()),
                    containsVerb: /\b(is|are|was|were|am|been|be|have|has|had|do|does|did|will|would|can|could|should|must|may|might)\b/i.test(userInput)
                }
            });
            validation.debugInfo.errorId = errorId;
            
            ValidationLogger.endTiming('sentence_completeness_check');
            ValidationLogger.endTiming('passive_voice_validation');
            return validation;
        }
        ValidationLogger.endTiming('sentence_completeness_check');
        validation.debugInfo.validationSteps.push({
            step: 'sentence_completeness',
            passed: true,
            details: 'Answer is a complete sentence'
        });

        // Layer 2: Spelling accuracy
        ValidationLogger.startTiming('spelling_accuracy_check');
        if (!hasCorrectSpelling(userInput, correctAnswer)) {
            validation.errorType = 'SPELLING';
            validation.feedback = getPassiveVoiceErrorMessage('SPELLING', userInput, correctAnswer);
            validation.debugInfo.validationSteps.push({
                step: 'spelling_accuracy',
                passed: false,
                details: 'Answer contains spelling errors'
            });
            
            const errorId = ValidationErrorReporter.reportValidationFailure({
                category: ValidationErrorReporter.errorCategories.SPELLING_ACCURACY,
                step: 'spelling_accuracy',
                userInput: userInput,
                expectedAnswer: correctAnswer,
                exerciseType: 'PASSIVE_VOICE',
                errorType: 'SPELLING',
                reason: 'Answer contains spelling errors',
                details: {
                    userWords: userInput.toLowerCase().trim().split(/\s+/),
                    expectedWords: correctAnswer.toLowerCase().trim().split(/\s+/)
                }
            });
            validation.debugInfo.errorId = errorId;
            
            ValidationLogger.endTiming('spelling_accuracy_check');
            ValidationLogger.endTiming('passive_voice_validation');
            return validation;
        }
        ValidationLogger.endTiming('spelling_accuracy_check');
        validation.debugInfo.validationSteps.push({
            step: 'spelling_accuracy',
            passed: true,
            details: 'Spelling is correct'
        });

        // Layer 3: Passive voice structure
        ValidationLogger.startTiming('passive_voice_structure_check');
        if (!hasPassiveVoiceStructure(userInput)) {
            validation.errorType = 'GRAMMAR';
            validation.feedback = getPassiveVoiceErrorMessage('GRAMMAR', userInput, correctAnswer);
            validation.debugInfo.validationSteps.push({
                step: 'passive_voice_structure',
                passed: false,
                details: 'Answer does not contain proper passive voice structure'
            });
            
            const errorId = ValidationErrorReporter.reportValidationFailure({
                category: ValidationErrorReporter.errorCategories.PASSIVE_VOICE_STRUCTURE,
                step: 'passive_voice_structure',
                userInput: userInput,
                expectedAnswer: correctAnswer,
                exerciseType: 'PASSIVE_VOICE',
                errorType: 'GRAMMAR',
                reason: 'Answer does not contain proper passive voice structure',
                details: {
                    normalized: userInput.toLowerCase().trim(),
                    hasToBeVerb: /\b(is|are|was|were|am|been)\b/.test(userInput.toLowerCase()),
                    hasPastParticiple: /\w+(ed|en|d)\b/.test(userInput.toLowerCase()),
                    hasIrregularParticiple: IRREGULAR_PAST_PARTICIPLES.some(p => userInput.toLowerCase().includes(p))
                }
            });
            validation.debugInfo.errorId = errorId;
            
            ValidationLogger.endTiming('passive_voice_structure_check');
            ValidationLogger.endTiming('passive_voice_validation');
            return validation;
        }
        ValidationLogger.endTiming('passive_voice_structure_check');
        validation.debugInfo.validationSteps.push({
            step: 'passive_voice_structure',
            passed: true,
            details: 'Answer contains proper passive voice structure'
        });

        // Layer 4: Exact match with allowed variations
        ValidationLogger.startTiming('content_matching_check');
        if (!matchesExpectedAnswer(userInput, correctAnswer)) {
            validation.errorType = 'CONTENT';
            validation.feedback = getPassiveVoiceErrorMessage('CONTENT', userInput, correctAnswer);
            validation.debugInfo.validationSteps.push({
                step: 'content_matching',
                passed: false,
                details: 'Answer does not match expected content'
            });
            
            const errorId = ValidationErrorReporter.reportValidationFailure({
                category: ValidationErrorReporter.errorCategories.CONTENT_MATCHING,
                step: 'content_matching',
                userInput: userInput,
                expectedAnswer: correctAnswer,
                exerciseType: 'PASSIVE_VOICE',
                errorType: 'CONTENT',
                reason: 'Answer does not match expected content',
                details: {
                    userNormalized: normalizeForComparison(userInput),
                    expectedNormalized: normalizeForComparison(correctAnswer),
                    extraWords: userInput.trim().split(/\s+/).length - correctAnswer.trim().split(/\s+/).length
                }
            });
            validation.debugInfo.errorId = errorId;
            
            ValidationLogger.endTiming('content_matching_check');
            ValidationLogger.endTiming('passive_voice_validation');
            return validation;
        }
        ValidationLogger.endTiming('content_matching_check');
        validation.debugInfo.validationSteps.push({
            step: 'content_matching',
            passed: true,
            details: 'Answer matches expected content'
        });

        // All validations passed
        validation.isCorrect = true;
        validation.feedback = getPassiveVoiceErrorMessage('SUCCESS', userInput, correctAnswer);
        
        ValidationLogger.logSuccess('PASSIVE_VOICE', userInput, correctAnswer, validation.debugInfo);
        
    } catch (error) {
        // Handle any unexpected errors during validation
        const errorId = ValidationErrorReporter.reportSystemError(error, {
            step: 'passive_voice_validation',
            userInput: userInput,
            expectedAnswer: correctAnswer,
            exerciseType: 'PASSIVE_VOICE'
        });
        
        validation.errorType = 'SYSTEM_ERROR';
        validation.feedback = getPassiveVoiceErrorMessage('SYSTEM_ERROR', userInput, correctAnswer);
        validation.debugInfo.errorId = errorId;
        validation.debugInfo.systemError = error.message;
    }
    
    ValidationLogger.endTiming('passive_voice_validation');
    return validation;
}

/**
 * Check if user answer matches expected answer with allowed variations
 * For passive voice exercises, requires exact match with no extra words
 * Requirements: 2.4, 3.5
 */
function matchesExpectedAnswer(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) {
        return false;
    }

    const userNormalized = normalizeForComparison(userAnswer);
    const correctNormalized = normalizeForComparison(correctAnswer);
    
    // For passive voice exercises, require exact match (no extra words)
    return userNormalized === correctNormalized;
}

/**
 * Normalize text for comparison by removing punctuation and normalizing whitespace
 * Used for content matching validation
 */
function normalizeForComparison(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:]/g, '') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if user answer has correct spelling without fuzzy logic
 * Implements exact word matching with punctuation normalization
 * Requirements: 1.4, 3.2
 */
function hasCorrectSpelling(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) {
        return false;
    }
    
    // Normalize punctuation for comparison but keep exact spelling
    const normalizeForSpelling = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[.,!?;:"'`]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')        // Normalize whitespace
            .trim();
    };
    
    const userNormalized = normalizeForSpelling(userAnswer);
    const correctNormalized = normalizeForSpelling(correctAnswer);
    
    // Split into words for exact word matching
    const userWords = userNormalized.split(/\s+/).filter(word => word.length > 0);
    const correctWords = correctNormalized.split(/\s+/).filter(word => word.length > 0);
    
    // For passive voice exercises, require exact spelling match
    // Check each word in user answer exists in correct answer or is a valid variation
    for (const userWord of userWords) {
        const hasExactMatch = correctWords.some(correctWord => userWord === correctWord);
        
        if (!hasExactMatch) {
            // Check if it's a valid variation (contractions, etc.)
            if (!isValidSpellingVariation(userWord, correctWords)) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Check if a word is a valid spelling variation
 * Handles contractions and common grammatical variations
 * Requirements: 5.1, 5.2
 */
function isValidSpellingVariation(word, correctWords) {
    // Dictionary of acceptable contractions and variations
    const validVariations = {
        "they're": ["they", "are"],
        "it's": ["it", "is"],
        "we're": ["we", "are"],
        "you're": ["you", "are"],
        "i'm": ["i", "am"],
        "he's": ["he", "is"],
        "she's": ["she", "is"],
        "that's": ["that", "is"],
        "there's": ["there", "is"],
        "here's": ["here", "is"],
        "what's": ["what", "is"],
        "who's": ["who", "is"],
        "where's": ["where", "is"],
        "when's": ["when", "is"],
        "how's": ["how", "is"],
        "isn't": ["is", "not"],
        "aren't": ["are", "not"],
        "wasn't": ["was", "not"],
        "weren't": ["were", "not"],
        "don't": ["do", "not"],
        "doesn't": ["does", "not"],
        "didn't": ["did", "not"],
        "won't": ["will", "not"],
        "wouldn't": ["would", "not"],
        "can't": ["can", "not"],
        "couldn't": ["could", "not"],
        "shouldn't": ["should", "not"],
        "mustn't": ["must", "not"],
        "haven't": ["have", "not"],
        "hasn't": ["has", "not"],
        "hadn't": ["had", "not"]
    };
    
    // Check if the word is a valid contraction
    if (validVariations[word]) {
        return validVariations[word].every(part => correctWords.includes(part));
    }
    
    // Check for British vs American spelling variations where appropriate
    const spellingVariations = {
        "colour": "color",
        "colour": "color",
        "realise": "realize",
        "realised": "realized",
        "centre": "center",
        "theatre": "theater",
        "metre": "meter",
        "litre": "liter",
        "organised": "organized",
        "recognised": "recognized"
    };
    
    // Check if it's a British/American spelling variation
    for (const [british, american] of Object.entries(spellingVariations)) {
        if (word === british && correctWords.includes(american)) {
            return true;
        }
        if (word === american && correctWords.includes(british)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Comprehensive answer normalization for consistent comparison
 */
function normalizeAnswer(answer) {
    if (!answer) return '';
    
    return answer
        .toLowerCase()                           // Convert to lowercase
        .trim()                                 // Remove leading/trailing whitespace
        .replace(/[.,!?;:"'`]/g, '')           // Remove common punctuation
        .replace(/[-_]/g, ' ')                 // Convert hyphens and underscores to spaces
        .replace(/\s+/g, ' ')                  // Normalize multiple spaces to single space
        .replace(/^\s+|\s+$/g, '')             // Final trim to ensure no edge whitespace
        .replace(/\b(um|uh|er|ah)\b/g, '')     // Remove filler words
        .trim();                               // Final trim after filler word removal
}

/**
 * Parse multiple correct answers from various delimiter formats with enhanced support
 */
function parseMultipleAnswers(correctAnswer) {
    if (!correctAnswer) return [];
    
    let answers = [];
    
    // Handle pipe-separated answers: "can|could|might"
    if (correctAnswer.includes('|')) {
        answers = correctAnswer.split('|');
    }
    // Handle slash-separated answers: "can/could/might"  
    else if (correctAnswer.includes('/')) {
        answers = correctAnswer.split('/');
    }
    // Handle semicolon-separated answers: "can; could; might"
    else if (correctAnswer.includes(';')) {
        answers = correctAnswer.split(';');
    }
    // Handle comma-separated answers: "can, could, might"
    else if (correctAnswer.includes(',')) {
        answers = correctAnswer.split(',');
    }
    // Handle "or" separated answers: "can or could"
    else if (correctAnswer.includes(' or ')) {
        answers = correctAnswer.split(' or ');
    }
    // Single answer
    else {
        answers = [correctAnswer];
    }
    
    // Clean up each answer and filter out empty ones
    return answers
        .map(answer => answer.trim())
        .filter(answer => answer.length > 0)
        .map(answer => normalizeAnswer(answer));
}

/**
 * Enhanced fuzzy matching for common variations and comprehensive article handling
 */
function fuzzyMatch(userAnswer, correctAnswer) {
    // Exact match after normalization
    if (userAnswer === correctAnswer) return true;
    
    // Remove common articles and determiners for comparison
    const removeArticles = (str) => str
        .replace(/\b(a|an|the|this|that|these|those|some|any)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    const userWithoutArticles = removeArticles(userAnswer);
    const correctWithoutArticles = removeArticles(correctAnswer);
    
    if (userWithoutArticles === correctWithoutArticles) return true;
    
    // Handle contractions and expansions
    const expandedUser = expandContractions(userAnswer);
    const expandedCorrect = expandContractions(correctAnswer);
    
    if (expandedUser === expandedCorrect) return true;
    
    // Check with articles removed from expanded versions
    if (removeArticles(expandedUser) === removeArticles(expandedCorrect)) return true;
    
    // Handle common preposition variations
    const normalizePrepositions = (str) => str
        .replace(/\b(in|on|at)\b/g, 'PREP')
        .replace(/\b(to|for|with)\b/g, 'PREP2');
    
    if (normalizePrepositions(userAnswer) === normalizePrepositions(correctAnswer)) return true;
    
    // Partial word matching for multi-word answers
    if (correctAnswer.includes(' ') || userAnswer.includes(' ')) {
        return checkPartialWordMatch(userAnswer, correctAnswer);
    }
    
    // Check for common spelling variations
    if (checkSpellingVariations(userAnswer, correctAnswer)) return true;
    
    return false;
}

/**
 * Expand common contractions
 */
function expandContractions(text) {
    const contractions = {
        "don't": "do not",
        "doesn't": "does not", 
        "can't": "cannot",
        "won't": "will not",
        "i'm": "i am",
        "you're": "you are",
        "he's": "he is",
        "she's": "she is",
        "it's": "it is",
        "we're": "we are",
        "they're": "they are",
        "would've": "would have",
        "could've": "could have",
        "should've": "should have"
    };
    
    let expanded = text;
    Object.entries(contractions).forEach(([contraction, expansion]) => {
        expanded = expanded.replace(new RegExp(contraction, 'gi'), expansion);
    });
    
    return expanded;
}

/**
 * Check partial word matching for multi-word answers with improved logic
 */
function checkPartialWordMatch(userAnswer, correctAnswer) {
    const userWords = userAnswer.split(' ').filter(word => word.length > 0);
    const correctWords = correctAnswer.split(' ').filter(word => word.length > 0);
    
    if (userWords.length === 0 || correctWords.length === 0) return false;
    
    // Check if at least 70% of significant words match
    const matchingWords = correctWords.filter(correctWord => {
        // Skip very short words (articles, prepositions) for matching
        if (correctWord.length <= 2) return true;
        
        return userWords.some(userWord => {
            // Exact match
            if (userWord === correctWord) return true;
            
            // Substring match for longer words
            if (userWord.length > 3 && correctWord.length > 3) {
                return userWord.includes(correctWord) || correctWord.includes(userWord);
            }
            
            // Levenshtein distance for similar words
            return calculateLevenshteinDistance(userWord, correctWord) <= 1;
        });
    });
    
    return matchingWords.length >= Math.ceil(correctWords.length * 0.7);
}

/**
 * Check for common spelling variations and typos
 */
function checkSpellingVariations(userAnswer, correctAnswer) {
    // Only check for single-word answers to avoid false positives
    if (userAnswer.includes(' ') || correctAnswer.includes(' ')) return false;
    
    // Skip very short words
    if (userAnswer.length < 3 || correctAnswer.length < 3) return false;
    
    // Calculate Levenshtein distance (edit distance)
    const distance = calculateLevenshteinDistance(userAnswer, correctAnswer);
    
    // Allow 1 character difference for words up to 5 characters
    // Allow 2 character differences for longer words
    const maxDistance = correctAnswer.length <= 5 ? 1 : 2;
    
    return distance <= maxDistance;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function calculateLevenshteinDistance(str1, str2) {
    const matrix = [];
    
    // Create matrix
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

/**
 * Enhanced feedback display system with consistent styling and accessibility
 * Requirements: 1.3, 1.4, 2.3
 */
function showFeedback(exerciseContainer, isCorrect, correctAnswer, feedbackData) {
    let feedback = exerciseContainer.querySelector('.exercise-feedback');
    
    // Create feedback container if it doesn't exist (Requirement 2.1, 2.2)
    if (!feedback) {
        feedback = createFeedbackElement(exerciseContainer);
    }
    
    // Clear previous content and reset classes
    feedback.innerHTML = '';
    feedback.className = 'exercise-feedback';
    
    // Ensure consistent feedback data structure
    const normalizedFeedback = normalizeFeedbackData(feedbackData, isCorrect, correctAnswer);
    
    // Apply consistent styling across all chapters (Requirement 1.3)
    applyFeedbackStyling(feedback, normalizedFeedback);
    
    // Create accessible feedback content (Requirement 1.4, 2.3)
    createFeedbackContent(feedback, normalizedFeedback);
    
    // Show feedback with proper positioning for mobile (Requirement 2.3)
    displayFeedback(feedback, exerciseContainer);
    
    // Handle accessibility announcements (Requirement 1.4)
    announceToScreenReader(normalizedFeedback, isCorrect, correctAnswer);
    
    // Manage focus for accessibility (Requirement 1.4)
    manageFeedbackFocus(feedback);
}

/**
 * Create feedback element if missing (Requirement 2.1, 2.2)
 */
function createFeedbackElement(exerciseContainer) {
    try {
        const feedback = document.createElement('div');
        feedback.className = 'exercise-feedback';
        feedback.style.display = 'none';
        feedback.setAttribute('aria-live', 'polite');
        feedback.setAttribute('aria-atomic', 'true');
        feedback.setAttribute('role', 'status');
        
        // Find the best insertion point
        const insertionPoint = findFeedbackInsertionPoint(exerciseContainer);
        
        if (insertionPoint.parent && insertionPoint.reference) {
            insertionPoint.parent.insertBefore(feedback, insertionPoint.reference);
        } else {
            // Fallback: append to exercise container
            exerciseContainer.appendChild(feedback);
        }
        
        return feedback;
    } catch (error) {
        console.warn('Error creating feedback element:', error);
        // Create minimal fallback element
        const fallback = document.createElement('div');
        fallback.className = 'exercise-feedback';
        fallback.setAttribute('aria-live', 'polite');
        exerciseContainer.appendChild(fallback);
        return fallback;
    }
}

/**
 * Find optimal insertion point for feedback element
 */
function findFeedbackInsertionPoint(exerciseContainer) {
    // Try to insert after input group
    const inputGroup = exerciseContainer.querySelector('.exercise-input-group');
    if (inputGroup) {
        return {
            parent: inputGroup.parentNode,
            reference: inputGroup.nextSibling
        };
    }
    
    // Try to insert after last input element
    const lastInput = exerciseContainer.querySelector('input:last-of-type, textarea:last-of-type, select:last-of-type');
    if (lastInput) {
        return {
            parent: lastInput.parentNode,
            reference: lastInput.nextSibling
        };
    }
    
    // Try to insert after check button
    const checkButton = exerciseContainer.querySelector('.check-answer-btn, button[onclick*="checkAnswer"]');
    if (checkButton) {
        return {
            parent: checkButton.parentNode,
            reference: checkButton.nextSibling
        };
    }
    
    // Fallback to end of container
    return {
        parent: exerciseContainer,
        reference: null
    };
}

/**
 * Normalize feedback data to ensure consistency (Requirement 1.3)
 * Enhanced to handle passive voice error categories and visual indicators
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
function normalizeFeedbackData(feedbackData, isCorrect, correctAnswer) {
    // Handle missing or malformed feedback data (Requirement 2.1, 2.2)
    if (!feedbackData || typeof feedbackData !== 'object') {
        console.warn('Invalid feedback data provided, using defaults');
        feedbackData = {};
    }
    
    // Handle passive voice validation feedback structure with enhanced error categorization
    if (feedbackData.message && typeof feedbackData.message === 'object') {
        return {
            type: feedbackData.message.type || (isCorrect ? 'success' : 'error'),
            icon: feedbackData.message.icon || (isCorrect ? '✓' : '✗'),
            message: feedbackData.message.message || (isCorrect ? 
                "To'g'ri! (Correct!)" : 
                `Noto'g'ri. To'g'ri javob: <strong>${correctAnswer}</strong>`),
            class: feedbackData.message.class || (isCorrect ? 'correct' : 'incorrect'),
            category: feedbackData.message.category || 'general',
            errorType: feedbackData.errorType || null,
            hint: feedbackData.hint || null
        };
    }
    
    // Handle enhanced passive voice feedback structure (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.errorType) {
        const errorTypeMapping = {
            'INCOMPLETE': { category: 'structure', visualIndicator: 'incomplete-sentence' },
            'SPELLING': { category: 'spelling', visualIndicator: 'spelling-error' },
            'GRAMMAR': { category: 'grammar', visualIndicator: 'grammar-error' },
            'CONTENT': { category: 'content', visualIndicator: 'content-error' },
            'SUCCESS': { category: 'success', visualIndicator: 'success' }
        };
        
        const errorInfo = errorTypeMapping[feedbackData.errorType] || { category: 'general', visualIndicator: 'general-error' };
        
        return {
            type: feedbackData.type || (isCorrect ? 'success' : 'error'),
            icon: feedbackData.icon || (isCorrect ? '✓' : '✗'),
            message: feedbackData.message || (isCorrect ? 
                "To'g'ri! (Correct!)" : 
                `Noto'g'ri. To'g'ri javob: <strong>${correctAnswer}</strong>`),
            class: feedbackData.class || (isCorrect ? 'correct' : 'incorrect'),
            category: errorInfo.category,
            errorType: feedbackData.errorType,
            visualIndicator: errorInfo.visualIndicator,
            hint: feedbackData.hint || null
        };
    }
    
    // Handle standard feedback structure
    return {
        type: feedbackData.type || (isCorrect ? 'success' : 'error'),
        icon: feedbackData.icon || (isCorrect ? '✓' : '✗'),
        message: feedbackData.message || (isCorrect ? 
            "To'g'ri! (Correct!)" : 
            `Noto'g'ri. To'g'ri javob: <strong>${correctAnswer}</strong>`),
        class: feedbackData.class || (isCorrect ? 'correct' : 'incorrect'),
        category: feedbackData.category || 'general',
        errorType: null,
        visualIndicator: 'general',
        hint: feedbackData.hint || null
    };
}

/**
 * Apply consistent feedback styling across all chapters (Requirement 1.3)
 * Enhanced with visual indicators for different error categories (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function applyFeedbackStyling(feedback, feedbackData) {
    // Base classes for consistent styling
    feedback.classList.add('exercise-feedback', feedbackData.class);
    
    // Add type-specific classes
    if (feedbackData.type === 'success') {
        feedback.classList.add('feedback-success');
    } else if (feedbackData.type === 'error') {
        feedback.classList.add('feedback-error');
    } else if (feedbackData.type === 'warning') {
        feedback.classList.add('feedback-warning');
    }
    
    // Add category-specific classes for enhanced visual indicators (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.category) {
        feedback.classList.add(`feedback-category-${feedbackData.category}`);
    }
    
    if (feedbackData.visualIndicator) {
        feedback.classList.add(`feedback-indicator-${feedbackData.visualIndicator}`);
    }
    
    // Add error type specific classes for passive voice validation (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.errorType) {
        feedback.classList.add(`feedback-error-type-${feedbackData.errorType.toLowerCase()}`);
    }
    
    // Ensure mobile-friendly styling (Requirement 2.3)
    feedback.style.cssText = `
        display: block;
        margin-top: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        max-width: 100%;
        box-sizing: border-box;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;
    
    // Apply enhanced color scheme based on feedback type and category
    if (feedbackData.type === 'success') {
        feedback.style.backgroundColor = '#e8f5e8';
        feedback.style.color = '#2e7d32';
        feedback.style.border = '2px solid #4caf50';
        feedback.style.borderLeft = '6px solid #4caf50';
        feedback.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.2)';
    } else if (feedbackData.type === 'error') {
        // Apply category-specific styling for different error types (Requirements 3.1, 3.2, 3.3, 3.4)
        switch (feedbackData.category) {
            case 'structure':
                feedback.style.backgroundColor = '#fff3e0';
                feedback.style.color = '#e65100';
                feedback.style.border = '2px solid #ff9800';
                feedback.style.borderLeft = '6px solid #ff9800';
                feedback.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.2)';
                break;
            case 'spelling':
                feedback.style.backgroundColor = '#f3e5f5';
                feedback.style.color = '#7b1fa2';
                feedback.style.border = '2px solid #9c27b0';
                feedback.style.borderLeft = '6px solid #9c27b0';
                feedback.style.boxShadow = '0 2px 8px rgba(156, 39, 176, 0.2)';
                break;
            case 'grammar':
                feedback.style.backgroundColor = '#e3f2fd';
                feedback.style.color = '#1565c0';
                feedback.style.border = '2px solid #2196f3';
                feedback.style.borderLeft = '6px solid #2196f3';
                feedback.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.2)';
                break;
            case 'content':
                feedback.style.backgroundColor = '#fce4ec';
                feedback.style.color = '#c2185b';
                feedback.style.border = '2px solid #e91e63';
                feedback.style.borderLeft = '6px solid #e91e63';
                feedback.style.boxShadow = '0 2px 8px rgba(233, 30, 99, 0.2)';
                break;
            default:
                feedback.style.backgroundColor = '#ffebee';
                feedback.style.color = '#d32f2f';
                feedback.style.border = '2px solid #f44336';
                feedback.style.borderLeft = '6px solid #f44336';
                feedback.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.2)';
        }
    } else if (feedbackData.type === 'warning') {
        feedback.style.backgroundColor = '#fff3e0';
        feedback.style.color = '#f57c00';
        feedback.style.border = '2px solid #ff9800';
        feedback.style.borderLeft = '6px solid #ff9800';
        feedback.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.2)';
    }
    
    // Add visual indicator badge for error categories (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.category && feedbackData.category !== 'general' && feedbackData.category !== 'success') {
        addCategoryIndicatorBadge(feedback, feedbackData);
    }
    
    // Add enhanced visual indicators for passive voice error types (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.errorType && feedbackData.errorType !== 'SUCCESS') {
        addErrorTypeVisualIndicator(feedback, feedbackData);
    }
}

/**
 * Add visual indicator badge for error categories (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function addCategoryIndicatorBadge(feedback, feedbackData) {
    const categoryLabels = {
        'structure': { label: 'Jumla tuzilishi', icon: '📝' },
        'spelling': { label: 'Imlo', icon: '📖' },
        'grammar': { label: 'Grammatika', icon: '📚' },
        'content': { label: 'Mazmun', icon: '✂️' }
    };
    
    const categoryInfo = categoryLabels[feedbackData.category];
    if (categoryInfo) {
        const badge = document.createElement('div');
        badge.className = 'feedback-category-badge';
        badge.innerHTML = `
            <span class="badge-icon" aria-hidden="true">${categoryInfo.icon}</span>
            <span class="badge-label">${categoryInfo.label}</span>
        `;
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: 12px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid currentColor;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;
        feedback.appendChild(badge);
    }
}

/**
 * Add enhanced visual indicators for passive voice error types (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function addErrorTypeVisualIndicator(feedback, feedbackData) {
    const errorTypeIndicators = {
        'INCOMPLETE': { 
            icon: '📝', 
            label: 'To\'liq emas', 
            color: '#ff9800',
            description: 'Jumla to\'liq emas'
        },
        'SPELLING': { 
            icon: '📖', 
            label: 'Imlo xatosi', 
            color: '#9c27b0',
            description: 'So\'zlarda xato bor'
        },
        'GRAMMAR': { 
            icon: '📚', 
            label: 'Grammatika', 
            color: '#2196f3',
            description: 'Passiv nisbat noto\'g\'ri'
        },
        'CONTENT': { 
            icon: '✂️', 
            label: 'Ortiqcha so\'z', 
            color: '#e91e63',
            description: 'Keraksiz so\'zlar mavjud'
        }
    };
    
    const indicator = errorTypeIndicators[feedbackData.errorType];
    if (indicator) {
        // Create main error type indicator
        const errorIndicator = document.createElement('div');
        errorIndicator.className = 'feedback-error-type-indicator';
        errorIndicator.innerHTML = `
            <div class="error-type-icon" aria-hidden="true">${indicator.icon}</div>
            <div class="error-type-content">
                <div class="error-type-label">${indicator.label}</div>
                <div class="error-type-description">${indicator.description}</div>
            </div>
        `;
        errorIndicator.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            border-left: 4px solid ${indicator.color};
            font-size: 12px;
        `;
        
        // Style the icon
        const iconElement = errorIndicator.querySelector('.error-type-icon');
        iconElement.style.cssText = `
            font-size: 16px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            flex-shrink: 0;
        `;
        
        // Style the content
        const contentElement = errorIndicator.querySelector('.error-type-content');
        contentElement.style.cssText = `
            flex: 1;
        `;
        
        // Style the label
        const labelElement = errorIndicator.querySelector('.error-type-label');
        labelElement.style.cssText = `
            font-weight: bold;
            margin-bottom: 2px;
            color: ${indicator.color};
        `;
        
        // Style the description
        const descriptionElement = errorIndicator.querySelector('.error-type-description');
        descriptionElement.style.cssText = `
            opacity: 0.9;
            font-size: 11px;
        `;
        
        // Add to feedback element
        feedback.appendChild(errorIndicator);
        
        // Add accessibility attributes
        errorIndicator.setAttribute('role', 'status');
        errorIndicator.setAttribute('aria-label', `Error type: ${indicator.label}. ${indicator.description}`);
    }
}

/**
 * Create accessible feedback content (Requirement 1.4)
 * Enhanced with specific error type indicators (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
 */
function createFeedbackContent(feedback, feedbackData) {
    // Create main feedback container
    const feedbackContent = document.createElement('div');
    feedbackContent.className = 'feedback-content';
    feedbackContent.style.display = 'flex';
    feedbackContent.style.alignItems = 'flex-start';
    feedbackContent.style.gap = '12px';
    
    // Create enhanced icon element with category-specific styling
    const iconElement = document.createElement('span');
    iconElement.className = 'feedback-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = feedbackData.icon;
    iconElement.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        flex-shrink: 0;
        margin-top: 2px;
        padding: 4px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        min-height: 28px;
    `;
    
    // Create message container with enhanced structure
    const messageContainer = document.createElement('div');
    messageContainer.className = 'feedback-message-container';
    messageContainer.style.flex = '1';
    
    // Create main message element
    const messageElement = document.createElement('div');
    messageElement.className = 'feedback-text';
    messageElement.innerHTML = feedbackData.message;
    messageElement.style.cssText = `
        font-weight: 500;
        margin-bottom: 4px;
    `;
    
    messageContainer.appendChild(messageElement);
    
    // Add enhanced error type explanation for passive voice errors (Requirements 3.1, 3.2, 3.3, 3.4)
    if (feedbackData.errorType && feedbackData.errorType !== 'SUCCESS') {
        const explanationElement = document.createElement('div');
        explanationElement.className = 'feedback-explanation';
        explanationElement.innerHTML = getErrorTypeExplanation(feedbackData.errorType);
        explanationElement.style.cssText = `
            font-size: 12px;
            opacity: 0.9;
            margin-top: 6px;
            padding: 8px 10px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 6px;
            border-left: 4px solid currentColor;
            position: relative;
        `;
        
        // Add accessibility attributes for error explanations
        explanationElement.setAttribute('role', 'note');
        explanationElement.setAttribute('aria-label', `Error explanation for ${feedbackData.errorType.toLowerCase()} error`);
        
        messageContainer.appendChild(explanationElement);
        
        // Add interactive help button for complex errors
        if (feedbackData.errorType === 'GRAMMAR' || feedbackData.errorType === 'INCOMPLETE') {
            addInteractiveHelpButton(explanationElement, feedbackData.errorType);
        }
    }
    
    // Add hint if available with enhanced styling
    if (feedbackData.hint) {
        const hintElement = document.createElement('div');
        hintElement.className = 'exercise-hint';
        hintElement.innerHTML = `<strong>💡 Maslahat:</strong> ${feedbackData.hint}`;
        hintElement.style.cssText = `
            margin-top: 8px;
            font-size: 12px;
            padding: 8px 10px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            border: 1px dashed currentColor;
            opacity: 0.9;
        `;
        messageContainer.appendChild(hintElement);
    }
    
    feedbackContent.appendChild(iconElement);
    feedbackContent.appendChild(messageContainer);
    feedback.appendChild(feedbackContent);
}

/**
 * Get detailed explanation for specific error types (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function getErrorTypeExplanation(errorType) {
    const explanations = {
        'INCOMPLETE': `
            <div class="error-explanation-section">
                <strong>🔍 Nima noto'g'ri:</strong> Javob to'liq jumla emas<br>
                <strong>✅ Qanday tuzatish:</strong> Kamida 3 ta so'z, bosh harf bilan boshlang<br>
                <strong>📝 Misol:</strong> "The forms are required" (to'g'ri) vs "are required" (noto'g'ri)
            </div>
        `,
        'SPELLING': `
            <div class="error-explanation-section">
                <strong>🔍 Nima noto'g'ri:</strong> So'zlarda imlo xatolari bor<br>
                <strong>✅ Qanday tuzatish:</strong> Har bir so'zning to'g'ri yozilishini tekshiring<br>
                <strong>📝 Misol:</strong> "are" (to'g'ri) vs "aare" (noto'g'ri)
            </div>
        `,
        'GRAMMAR': `
            <div class="error-explanation-section">
                <strong>🔍 Nima noto'g'ri:</strong> Passiv nisbat ishlatilmagan<br>
                <strong>✅ Qanday tuzatish:</strong> Subject + "to be" + Past Participle formulasini ishlating<br>
                <strong>📝 Misol:</strong> "The work is completed" (passiv) vs "I complete the work" (aktiv)
            </div>
        `,
        'CONTENT': `
            <div class="error-explanation-section">
                <strong>🔍 Nima noto'g'ri:</strong> Ortiqcha yoki noto'g'ri so'zlar mavjud<br>
                <strong>✅ Qanday tuzatish:</strong> Faqat kerakli so'zlarni qoldiring<br>
                <strong>📝 Misol:</strong> "The forms are required" (to'g'ri) vs "The forms are required and done" (ortiqcha)
            </div>
        `
    };
    
    return explanations[errorType] || `
        <div class="error-explanation-section">
            <strong>🔍 Tekshiring:</strong> Javobni qaytadan ko'rib chiqing
        </div>
    `;
}

/**
 * Add interactive help button for complex error types (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function addInteractiveHelpButton(explanationElement, errorType) {
    const helpButton = document.createElement('button');
    helpButton.className = 'feedback-help-button';
    helpButton.innerHTML = '💡 Ko\'proq yordam';
    helpButton.type = 'button';
    helpButton.setAttribute('aria-label', `Get more help for ${errorType.toLowerCase()} error`);
    
    helpButton.style.cssText = `
        position: absolute;
        top: 4px;
        right: 8px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid currentColor;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: inherit;
    `;
    
    // Add hover and focus styles
    helpButton.addEventListener('mouseenter', () => {
        helpButton.style.background = 'rgba(255, 255, 255, 1)';
        helpButton.style.transform = 'scale(1.05)';
    });
    
    helpButton.addEventListener('mouseleave', () => {
        helpButton.style.background = 'rgba(255, 255, 255, 0.8)';
        helpButton.style.transform = 'scale(1)';
    });
    
    helpButton.addEventListener('focus', () => {
        helpButton.style.outline = '2px solid currentColor';
        helpButton.style.outlineOffset = '2px';
    });
    
    helpButton.addEventListener('blur', () => {
        helpButton.style.outline = '';
        helpButton.style.outlineOffset = '';
    });
    
    // Add click handler for detailed help
    helpButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showDetailedErrorHelp(errorType, explanationElement);
    });
    
    explanationElement.appendChild(helpButton);
}

/**
 * Show detailed error help modal or expanded content (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function showDetailedErrorHelp(errorType, parentElement) {
    // Remove existing detailed help if present
    const existingHelp = parentElement.querySelector('.detailed-error-help');
    if (existingHelp) {
        existingHelp.remove();
        return;
    }
    
    const detailedHelp = document.createElement('div');
    detailedHelp.className = 'detailed-error-help';
    
    const helpContent = getDetailedErrorHelp(errorType);
    detailedHelp.innerHTML = helpContent;
    
    detailedHelp.style.cssText = `
        margin-top: 8px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 6px;
        border: 1px dashed currentColor;
        font-size: 11px;
        animation: helpSlideDown 0.3s ease-out;
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.className = 'help-close-button';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close detailed help');
    closeButton.style.cssText = `
        float: right;
        background: none;
        border: none;
        font-size: 12px;
        cursor: pointer;
        color: inherit;
        padding: 0;
        margin-left: 8px;
    `;
    
    closeButton.addEventListener('click', () => {
        detailedHelp.remove();
    });
    
    detailedHelp.insertBefore(closeButton, detailedHelp.firstChild);
    parentElement.appendChild(detailedHelp);
    
    // Add CSS for animation if not present
    if (!document.getElementById('help-animation-style')) {
        const style = document.createElement('style');
        style.id = 'help-animation-style';
        style.textContent = `
            @keyframes helpSlideDown {
                0% {
                    opacity: 0;
                    max-height: 0;
                    transform: translateY(-10px);
                }
                100% {
                    opacity: 1;
                    max-height: 200px;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Get detailed help content for specific error types (Requirements 3.1, 3.2, 3.3, 3.4)
 */
function getDetailedErrorHelp(errorType) {
    const detailedHelp = {
        'INCOMPLETE': `
            <h4 style="margin: 0 0 8px 0; font-size: 12px;">📚 To'liq jumla qoidalari:</h4>
            <ul style="margin: 0; padding-left: 16px; font-size: 10px;">
                <li><strong>Kamida 3 ta so'z</strong> bo'lishi kerak</li>
                <li><strong>Bosh harf</strong> bilan boshlanishi kerak</li>
                <li><strong>Subject (ega)</strong> bo'lishi kerak</li>
                <li><strong>Verb (fe'l)</strong> bo'lishi kerak</li>
                <li><strong>Mazmunli</strong> bo'lishi kerak</li>
            </ul>
            <div style="margin-top: 8px; padding: 4px; background: rgba(255,255,255,0.3); border-radius: 3px;">
                <strong>✅ To'g'ri:</strong> "The documents are signed"<br>
                <strong>❌ Noto'g'ri:</strong> "are signed" (ega yo'q)
            </div>
        `,
        'GRAMMAR': `
            <h4 style="margin: 0 0 8px 0; font-size: 12px;">📚 Passiv nisbat formulasi:</h4>
            <div style="background: rgba(255,255,255,0.3); padding: 6px; border-radius: 3px; margin-bottom: 8px;">
                <strong>Subject + TO BE + Past Participle</strong>
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 10px;">
                <li><strong>TO BE:</strong> am, is, are, was, were, been</li>
                <li><strong>Past Participle:</strong> V3 (worked, done, made)</li>
            </ul>
            <div style="margin-top: 8px; padding: 4px; background: rgba(255,255,255,0.3); border-radius: 3px;">
                <strong>✅ Passiv:</strong> "The work is completed"<br>
                <strong>❌ Aktiv:</strong> "I complete the work"
            </div>
        `
    };
    
    return detailedHelp[errorType] || `
        <div style="text-align: center; padding: 8px;">
            <strong>Umumiy maslahat:</strong><br>
            Javobingizni diqqat bilan tekshiring va qaytadan urinib ko'ring.
        </div>
    `;
}

/**
 * Display feedback with proper positioning for mobile (Requirement 2.3)
 */
function displayFeedback(feedback, exerciseContainer) {
    // Show the feedback
    feedback.style.display = 'block';
    
    // Ensure feedback is visible on mobile devices
    setTimeout(() => {
        const feedbackRect = feedback.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If feedback is below viewport, scroll it into view
        if (feedbackRect.bottom > viewportHeight) {
            feedback.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }, 100);
}

/**
 * Announce feedback to screen readers (Requirement 1.4)
 * Enhanced with specific error type announcements (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
 */
function announceToScreenReader(feedbackData, isCorrect, correctAnswer) {
    // Create enhanced announcement text with error type information
    let announcement;
    if (isCorrect) {
        announcement = "Correct answer! Well done.";
        
        // Add success context for passive voice exercises
        if (feedbackData.category === 'success' && feedbackData.errorType === 'SUCCESS') {
            announcement += " Your passive voice sentence is grammatically correct and complete.";
        }
    } else {
        // Base incorrect message
        announcement = "Incorrect answer.";
        
        // Add specific error type information for passive voice validation (Requirements 3.1, 3.2, 3.3, 3.4)
        if (feedbackData.errorType) {
            const errorTypeAnnouncements = {
                'INCOMPLETE': "Error type: Incomplete sentence. Your answer must be a complete sentence with at least 3 words starting with a capital letter. Make sure your sentence has a subject, verb, and proper structure.",
                'SPELLING': "Error type: Spelling mistake. Please check the spelling of each word in your answer. Every word must be spelled correctly for passive voice exercises.",
                'GRAMMAR': "Error type: Grammar error. You need to use passive voice structure: subject plus to be verb plus past participle. For example: The forms are required, or The work was completed.",
                'CONTENT': "Error type: Content error. Your answer contains extra or incorrect words. Use only the necessary words that form a proper passive voice sentence."
            };
            
            const errorAnnouncement = errorTypeAnnouncements[feedbackData.errorType];
            if (errorAnnouncement) {
                announcement += ` ${errorAnnouncement}`;
            }
        }
        
        // Add correct answer with context
        if (correctAnswer) {
            announcement += ` The correct answer is: ${correctAnswer}`;
            
            // Add explanation of why this is correct for passive voice
            if (feedbackData.errorType === 'GRAMMAR') {
                announcement += " This follows the passive voice pattern with a to-be verb and past participle.";
            }
        }
        
        // Add hint if available
        if (feedbackData.hint) {
            announcement += ` Hint: ${feedbackData.hint}`;
        }
        
        // Add category-specific guidance (Requirements 3.1, 3.2, 3.3, 3.4)
        if (feedbackData.category) {
            const categoryGuidance = {
                'structure': "Focus on sentence structure and completeness.",
                'spelling': "Double-check your spelling before submitting.",
                'grammar': "Review passive voice grammar rules.",
                'content': "Make sure your answer contains only the required words."
            };
            
            const guidance = categoryGuidance[feedbackData.category];
            if (guidance) {
                announcement += ` ${guidance}`;
            }
        }
    }
    
    // Use existing ARIA live region or create one
    let liveRegion = document.getElementById('aria-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
    }
    
    // Announce to screen readers with enhanced error type information
    liveRegion.textContent = announcement;
    
    // Clear after announcement
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
    
    // Also announce error category for additional context (Requirements 3.1, 3.2, 3.3, 3.4)
    if (!isCorrect && feedbackData.category && feedbackData.category !== 'general') {
        setTimeout(() => {
            const categoryNames = {
                'structure': 'sentence structure',
                'spelling': 'spelling',
                'grammar': 'grammar',
                'content': 'content'
            };
            const categoryName = categoryNames[feedbackData.category] || feedbackData.category;
            liveRegion.textContent = `Error category: ${categoryName}`;
            
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }, 1500);
    }
}

/**
 * Manage focus for accessibility (Requirement 1.4)
 * Enhanced for error category feedback (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
 */
function manageFeedbackFocus(feedback) {
    // Make feedback focusable temporarily for screen readers
    feedback.setAttribute('tabindex', '-1');
    feedback.setAttribute('role', 'alert');
    
    // Add enhanced ARIA labels for different error types
    const feedbackText = feedback.querySelector('.feedback-text');
    const errorTypeIndicator = feedback.querySelector('.feedback-error-type-indicator');
    
    let ariaLabel = 'Exercise feedback: ';
    
    if (feedbackText) {
        const textContent = feedbackText.textContent || feedbackText.innerText;
        ariaLabel += textContent;
    }
    
    // Add error type information to ARIA label (Requirements 3.1, 3.2, 3.3, 3.4)
    if (errorTypeIndicator) {
        const errorTypeLabel = errorTypeIndicator.querySelector('.error-type-label');
        const errorTypeDescription = errorTypeIndicator.querySelector('.error-type-description');
        
        if (errorTypeLabel && errorTypeDescription) {
            ariaLabel += ` Error category: ${errorTypeLabel.textContent}. ${errorTypeDescription.textContent}`;
        }
    }
    
    feedback.setAttribute('aria-label', ariaLabel);
    
    // Add ARIA describedby for enhanced context
    const categoryBadge = feedback.querySelector('.feedback-category-badge');
    if (categoryBadge) {
        const badgeId = `feedback-badge-${Date.now()}`;
        categoryBadge.id = badgeId;
        feedback.setAttribute('aria-describedby', badgeId);
    }
    
    // Focus the feedback for screen reader announcement with enhanced timing
    setTimeout(() => {
        feedback.focus();
        
        // Ensure feedback is visible in viewport for users with low vision
        feedback.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
        });
        
        // Add visual focus indicator for low vision users
        feedback.style.outline = '3px solid #4A90E2';
        feedback.style.outlineOffset = '2px';
        
    }, 150);
    
    // Enhanced cleanup with better timing for different error types
    const cleanupDelay = errorTypeIndicator ? 4000 : 3000; // Longer for complex error feedback
    
    setTimeout(() => {
        feedback.removeAttribute('tabindex');
        feedback.blur();
        feedback.style.outline = '';
        feedback.style.outlineOffset = '';
        // Keep role="alert" for continued accessibility support
    }, cleanupDelay);
    
    // Add keyboard navigation support for feedback elements with error type awareness
    feedback.addEventListener('keydown', function(event) {
        // Allow Escape key to dismiss feedback
        if (event.key === 'Escape') {
            event.preventDefault();
            feedback.style.display = 'none';
            
            // Return focus to the exercise input
            const exerciseContainer = feedback.closest('.exercise');
            if (exerciseContainer) {
                const input = exerciseContainer.querySelector('.exercise-input, input[type="radio"]:checked');
                if (input) {
                    input.focus();
                }
            }
        }
        
        // Allow Tab to navigate to next focusable element
        if (event.key === 'Tab' && !event.shiftKey) {
            const exerciseContainer = feedback.closest('.exercise');
            if (exerciseContainer) {
                const nextInput = exerciseContainer.nextElementSibling?.querySelector('.exercise-input');
                if (nextInput) {
                    event.preventDefault();
                    nextInput.focus();
                }
            }
        }
    });
    
    // Add enhanced visual feedback animation for different error categories
    const feedbackCategory = feedback.classList.contains('feedback-category-structure') ? 'structure' :
                           feedback.classList.contains('feedback-category-spelling') ? 'spelling' :
                           feedback.classList.contains('feedback-category-grammar') ? 'grammar' :
                           feedback.classList.contains('feedback-category-content') ? 'content' : 'general';
    
    // Apply category-specific animation
    feedback.style.animation = `feedbackSlideIn-${feedbackCategory} 0.4s ease-out`;
    
    // Add CSS animations dynamically if not already present
    addFeedbackAnimations();
}

/**
 * Add CSS animations for enhanced feedback display (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
 */
function addFeedbackAnimations() {
    // Check if animations are already added
    if (document.getElementById('feedback-animations-style')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'feedback-animations-style';
    style.textContent = `
        /* Enhanced feedback animations for different error categories */
        @keyframes feedbackSlideIn-structure {
            0% {
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
                border-left-width: 2px;
            }
            50% {
                border-left-width: 8px;
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                border-left-width: 6px;
            }
        }
        
        @keyframes feedbackSlideIn-spelling {
            0% {
                opacity: 0;
                transform: translateX(-10px) scale(0.95);
                border-left-width: 2px;
            }
            50% {
                border-left-width: 8px;
            }
            100% {
                opacity: 1;
                transform: translateX(0) scale(1);
                border-left-width: 6px;
            }
        }
        
        @keyframes feedbackSlideIn-grammar {
            0% {
                opacity: 0;
                transform: translateY(10px) scale(0.95);
                border-left-width: 2px;
            }
            50% {
                border-left-width: 8px;
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                border-left-width: 6px;
            }
        }
        
        @keyframes feedbackSlideIn-content {
            0% {
                opacity: 0;
                transform: translateX(10px) scale(0.95);
                border-left-width: 2px;
            }
            50% {
                border-left-width: 8px;
            }
            100% {
                opacity: 1;
                transform: translateX(0) scale(1);
                border-left-width: 6px;
            }
        }
        
        @keyframes feedbackSlideIn-general {
            0% {
                opacity: 0;
                transform: scale(0.95);
                border-left-width: 2px;
            }
            50% {
                border-left-width: 8px;
            }
            100% {
                opacity: 1;
                transform: scale(1);
                border-left-width: 6px;
            }
        }
        
        /* Enhanced focus styles for accessibility */
        .exercise-feedback:focus {
            outline: 3px solid #4A90E2 !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 6px rgba(74, 144, 226, 0.2) !important;
        }
        
        /* Enhanced visual indicators for error types */
        .feedback-error-type-indicator {
            animation: errorTypeSlideIn 0.5s ease-out 0.2s both;
        }
        
        @keyframes errorTypeSlideIn {
            0% {
                opacity: 0;
                transform: translateY(5px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Category badge animations */
        .feedback-category-badge {
            animation: badgePopIn 0.3s ease-out 0.1s both;
        }
        
        @keyframes badgePopIn {
            0% {
                opacity: 0;
                transform: scale(0.8) translateY(-5px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        /* Mobile-specific enhancements */
        @media (max-width: 768px) {
            .exercise-feedback {
                margin-top: 8px;
                padding: 10px 12px;
                font-size: 13px;
            }
            
            .feedback-error-type-indicator {
                padding: 6px 10px;
                font-size: 11px;
            }
            
            .feedback-category-badge {
                top: -6px;
                right: 8px;
                padding: 1px 6px;
                font-size: 10px;
            }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .exercise-feedback {
                border-width: 3px !important;
                border-left-width: 8px !important;
            }
            
            .feedback-error-type-indicator {
                border-left-width: 6px !important;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .exercise-feedback,
            .feedback-error-type-indicator,
            .feedback-category-badge {
                animation: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
    feedback.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            feedback.style.display = 'none';
            // Return focus to the exercise input
            const exerciseContainer = feedback.closest('.exercise');
            if (exerciseContainer) {
                const input = exerciseContainer.querySelector('.exercise-input, input[type="text"], textarea');
                if (input) {
                    input.focus();
                }
            }
        }
    });
}

// Backward compatibility wrapper for existing checkAnswerFlexible function
function checkAnswerFlexible(userAnswer, correctAnswer) {
    return validateAnswer(userAnswer, correctAnswer);
}

// Get current chapter number from URL or page
function getCurrentChapterNumber() {
    try {
        // Enhanced chapter number detection with better fallback handling
        
        // Special case for Chapter 0 (English_for_Uzbek_Seasonal_Workers.html)
        if (window.location.pathname.includes('English_for_Uzbek_Seasonal_Workers.html')) {
            return 0;
        }
        
        // Try to get from URL pattern Chapter_X
        const urlMatch = window.location.pathname.match(/Chapter_(\d+)/);
        if (urlMatch) {
            const chapterNum = parseInt(urlMatch[1]);
            if (chapterNum >= 0 && chapterNum <= 24) {
                return chapterNum;
            }
        }
        
        // Try to get from page title
        const titleMatch = document.title.match(/Chapter (\d+)/);
        if (titleMatch) {
            const chapterNum = parseInt(titleMatch[1]);
            if (chapterNum >= 0 && chapterNum <= 24) {
                return chapterNum;
            }
        }
        
        // Try to get from first chapter heading
        const heading = document.querySelector('h1');
        if (heading) {
            const headingMatch = heading.textContent.match(/Chapter (\d+)/);
            if (headingMatch) {
                const chapterNum = parseInt(headingMatch[1]);
                if (chapterNum >= 0 && chapterNum <= 24) {
                    return chapterNum;
                }
            }
        }
        
        // Try to get from meta tag
        const chapterMeta = document.querySelector('meta[name="chapter"]');
        if (chapterMeta && chapterMeta.content) {
            const chapterNum = parseInt(chapterMeta.content);
            if (!isNaN(chapterNum) && chapterNum >= 0 && chapterNum <= 24) {
                return chapterNum;
            }
        }
        
        // Enhanced fallback using getEnhancedChapterNumberFallback
        return getEnhancedChapterNumberFallback();
        
    } catch (error) {
        console.error('Error getting current chapter number:', error);
        return getEnhancedChapterNumberFallback();
    }
}

/**
 * Validate exercise structure and provide debugging information
 */
function validateExerciseStructure(exerciseContainer) {
    if (!exerciseContainer) {
        return {
            valid: false,
            errors: ['Exercise container not found'],
            warnings: []
        };
    }
    
    const errors = [];
    const warnings = [];
    
    // Check for input elements
    const inputElement = findInputElement(exerciseContainer);
    if (!inputElement) {
        errors.push('No input element found in exercise container');
    }
    
    // Check for correct answer data
    const hasCorrectAnswer = exerciseContainer.dataset.answer || 
                           (inputElement && inputElement.dataset.correct) ||
                           exerciseContainer.querySelector('[data-correct]');
    
    if (!hasCorrectAnswer) {
        errors.push('No correct answer data found (missing data-answer or data-correct attributes)');
    }
    
    // Check for feedback container or ability to create one
    const feedbackContainer = exerciseContainer.querySelector('.exercise-feedback');
    if (!feedbackContainer) {
        warnings.push('No feedback container found - will create one dynamically');
    }
    
    // Check for check button
    const checkButton = exerciseContainer.querySelector('.check-answer-btn') ||
                       exerciseContainer.querySelector('button[onclick*="checkAnswer"]');
    
    if (!checkButton) {
        warnings.push('No check answer button found in exercise container');
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        inputElement,
        hasCorrectAnswer,
        feedbackContainer,
        checkButton
    };
}

/**
 * Log exercise structure validation results for debugging
 */
function logExerciseValidation(exerciseContainer, exerciseIndex) {
    const validation = validateExerciseStructure(exerciseContainer);
    
    if (!validation.valid) {
        console.error(`Exercise ${exerciseIndex} validation failed:`, validation.errors);
    }
    
    if (validation.warnings.length > 0) {
        console.warn(`Exercise ${exerciseIndex} warnings:`, validation.warnings);
    }
    
    return validation;
}

// Screen reader announcement function
function announceToScreenReader(message) {
    let liveRegion = document.getElementById('aria-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }
    
    // Clear previous message
    liveRegion.textContent = '';
    
    // Add new message after a brief delay
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
    
    // Clear after announcement
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 3000);
}

// Initialize global functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize InteractiveExercises if not already done
    if (typeof window.interactiveExercises === 'undefined') {
        const chapterNum = getCurrentChapterNumber();
        window.interactiveExercises = new InteractiveExercises(chapterNum);
    }
    
    // Initialize progress tracking integration
    initializeProgressTrackingIntegration();
});

/**
 * Initialize progress tracking integration
 * Requirements: 1.5, 2.2
 */
function initializeProgressTrackingIntegration() {
    try {
        console.log('Initializing progress tracking integration');
        
        // Check if ProgressTracker is available
        if (typeof ProgressTracker !== 'undefined') {
            console.log('ProgressTracker is available');
            
            // Retry any failed progress updates
            retryFailedProgressUpdates();
            
            // Verify progress structure compatibility
            if (!verifyProgressStructureCompatibility()) {
                console.log('Progress structure needs migration');
                migrateProgressStructure();
            }
            
            // Set up periodic retry of failed updates
            setInterval(() => {
                retryFailedProgressUpdates();
            }, 30000); // Retry every 30 seconds
            
        } else {
            console.warn('ProgressTracker not available during initialization');
            
            // Set up a listener for when ProgressTracker becomes available
            const checkProgressTracker = setInterval(() => {
                if (typeof ProgressTracker !== 'undefined') {
                    clearInterval(checkProgressTracker);
                    console.log('ProgressTracker became available, initializing integration');
                    initializeProgressTrackingIntegration();
                }
            }, 1000);
            
            // Stop checking after 10 seconds
            setTimeout(() => {
                clearInterval(checkProgressTracker);
            }, 10000);
        }
        
        // Set up event listeners for progress tracking
        setupProgressTrackingEventListeners();
        
    } catch (error) {
        console.error('Error initializing progress tracking integration:', error);
    }
}

/**
 * Set up event listeners for progress tracking integration
 * Requirements: 1.5, 2.2
 */
function setupProgressTrackingEventListeners() {
    try {
        // Listen for ProgressTracker events
        document.addEventListener('progressUpdate', function(event) {
            console.log('Progress update event received:', event.detail);
        });
        
        // Listen for exercise completion events
        document.addEventListener('exerciseCompleted', function(event) {
            console.log('Exercise completed event received:', event.detail);
        });
        
        // Listen for enhanced progress update events
        document.addEventListener('enhancedProgressUpdate', function(event) {
            console.log('Enhanced progress update event received:', event.detail);
        });
        
        // Listen for page visibility changes to retry failed updates
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && typeof ProgressTracker !== 'undefined') {
                // Page became visible and ProgressTracker is available, retry failed updates
                setTimeout(() => {
                    retryFailedProgressUpdates();
                }, 1000);
            }
        });
        
        console.log('Progress tracking event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up progress tracking event listeners:', error);
    }
}

/**
 * Handle legacy checkAnswer format for chapters 19-24
 * Format: checkAnswer(inputId, correctAnswer, feedbackMessage)
 */
function handleLegacyCheckAnswer(inputId, correctAnswer, feedbackMessage) {
    console.log('handleLegacyCheckAnswer called with:', { inputId, correctAnswer, feedbackMessage });
    
    try {
        // Validate parameters
        if (!inputId || !correctAnswer) {
            console.error('Missing required parameters:', { inputId, correctAnswer });
            return false;
        }
        
        // Find the input element by ID
        const inputElement = document.getElementById(inputId);
        if (!inputElement) {
            console.error('Input element not found:', inputId);
            // Try to show error in any available feedback element
            const feedbackId = inputId.replace('ex', 'feedback');
            const feedbackElement = document.getElementById(feedbackId);
            if (feedbackElement) {
                feedbackElement.innerHTML = '<span style="color: red;">❌ Input element not found</span>';
                feedbackElement.style.display = 'block';
            }
            return false;
        }
        
        // Get user input
        const userInput = inputElement.value.trim();
        console.log('User input:', userInput);
        
        if (!userInput) {
            // Show "please enter answer" message
            const feedbackId = inputId.replace('ex', 'feedback');
            const feedbackElement = document.getElementById(feedbackId);
            if (feedbackElement) {
                feedbackElement.innerHTML = '<span style="color: orange;">⚠️ Iltimos, javob kiriting / Please enter an answer</span>';
                feedbackElement.style.display = 'block';
            }
            return false;
        }
        
        // Find the exercise container for context detection
        const exerciseContainer = inputElement.closest('.exercise') || inputElement.parentElement;
        
        // Validate answer using the enhanced validation function with exercise type detection
        const isCorrect = validateAnswer(userInput, correctAnswer, exerciseContainer);
        console.log('Answer validation result:', isCorrect);
        
        // Find feedback element (should be next sibling or nearby)
        const feedbackId = inputId.replace('ex', 'feedback');
        let feedbackElement = document.getElementById(feedbackId);
        
        if (!feedbackElement) {
            // Try to find feedback element by class in parent
            const exerciseContainer = inputElement.closest('.exercise');
            if (exerciseContainer) {
                feedbackElement = exerciseContainer.querySelector('.exercise-feedback');
            }
        }
        
        // Show feedback
        if (feedbackElement) {
            if (isCorrect) {
                feedbackElement.innerHTML = '<span style="color: green;">✓ To\'g\'ri! (Correct!)</span>';
                feedbackElement.className = 'exercise-feedback correct';
                feedbackElement.style.backgroundColor = '#e8f5e8';
                feedbackElement.style.border = '1px solid #2e7d32';
                
                // Disable input and button
                inputElement.disabled = true;
                inputElement.classList.add('completed');
                inputElement.style.backgroundColor = '#e8f5e8';
                inputElement.style.borderColor = '#2e7d32';
                
                // Find and disable the button
                const button = inputElement.parentElement.querySelector('.check-answer-btn');
                if (button) {
                    button.disabled = true;
                    button.textContent = 'Completed';
                    button.style.backgroundColor = '#ccc';
                }
                
            } else {
                feedbackElement.innerHTML = `<span style="color: red;">✗ Noto'g'ri. To'g'ri javob: <strong>${correctAnswer}</strong></span>`;
                feedbackElement.className = 'exercise-feedback incorrect';
                feedbackElement.style.backgroundColor = '#ffebee';
                feedbackElement.style.border = '1px solid #d32f2f';
            }
            feedbackElement.style.display = 'block';
        } else {
            console.warn('Feedback element not found for:', feedbackId);
        }
        
        // Update progress if correct
        if (isCorrect) {
            try {
                // Extract chapter number from current page
                const chapterMatch = window.location.pathname.match(/Chapter_(\d+)/) || 
                                  document.title.match(/Chapter (\d+)/);
                if (chapterMatch) {
                    const chapterNum = parseInt(chapterMatch[1]);
                    const exerciseNum = parseInt(inputId.replace('ex', '')) - 1; // Convert to 0-based index
                    console.log('Updating progress for chapter', chapterNum, 'exercise', exerciseNum);
                    
                    // Check if updateProgressTracking function exists
                    if (typeof updateProgressTracking === 'function') {
                        updateProgressTracking(exerciseNum, true, chapterNum);
                    } else {
                        console.warn('updateProgressTracking function not found');
                    }
                }
            } catch (progressError) {
                console.warn('Error updating progress:', progressError);
                // Don't fail the whole function if progress update fails
            }
        }
        
        return isCorrect;
        
    } catch (error) {
        console.error('Error in handleLegacyCheckAnswer:', error);
        
        // Show error feedback
        const feedbackId = inputId.replace('ex', 'feedback');
        const feedbackElement = document.getElementById(feedbackId);
        if (feedbackElement) {
            feedbackElement.innerHTML = '<span style="color: red;">❌ Tizim xatosi / System error: ' + error.message + '</span>';
            feedbackElement.style.display = 'block';
            feedbackElement.style.backgroundColor = '#ffebee';
            feedbackElement.style.border = '1px solid #d32f2f';
        }
        return false;
    }
}

// Backward compatibility function for chapters that use checkExerciseAnswer
window.checkExerciseAnswer = function(button) {
    return window.checkAnswer(button);
};

/**
 * Add CSS animations for progress notifications
 */
function addProgressNotificationStyles() {
    if (document.getElementById('progress-notification-styles')) {
        return; // Already added
    }
    
    const style = document.createElement('style');
    style.id = 'progress-notification-styles';
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
        
        @keyframes scaleIn {
            from {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        .chapter-completion-notification .notification-content,
        .course-completion-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .celebration-icon {
            font-size: 24px;
        }
        
        .celebration-text {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .warning-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .warning-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            color: inherit;
        }
        
        .warning-close:hover {
            opacity: 0.7;
        }
    `;
    
    document.head.appendChild(style);
}

// Add styles when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addProgressNotificationStyles);
} else {
    addProgressNotificationStyles();
}

/**
 * Retry failed progress updates when system recovers
 */
function retryFailedProgressUpdates() {
    try {
        const failedUpdates = JSON.parse(sessionStorage.getItem('failedProgressUpdates') || '[]');
        
        if (failedUpdates.length === 0) {
            return;
        }
        
        console.log(`Attempting to retry ${failedUpdates.length} failed progress updates`);
        
        const successfulRetries = [];
        const stillFailed = [];
        
        for (const update of failedUpdates) {
            try {
                if (typeof ProgressTracker !== 'undefined' && 
                    typeof ProgressTracker.updateExercise === 'function' &&
                    isLocalStorageAvailable()) {
                    
                    const success = ProgressTracker.updateExercise(
                        update.chapter, 
                        update.exercise, 
                        update.completed
                    );
                    
                    if (success) {
                        successfulRetries.push(update);
                        console.log(`Successfully retried progress update: Chapter ${update.chapter}, Exercise ${update.exercise}`);
                    } else {
                        stillFailed.push(update);
                    }
                } else {
                    stillFailed.push(update);
                }
            } catch (error) {
                console.warn('Retry failed for update:', update, error);
                stillFailed.push(update);
            }
        }
        
        // Update the failed updates list
        sessionStorage.setItem('failedProgressUpdates', JSON.stringify(stillFailed));
        
        if (successfulRetries.length > 0) {
            console.log(`Successfully retried ${successfulRetries.length} progress updates`);
            
            // Dispatch events for successful retries
            successfulRetries.forEach(update => {
                dispatchProgressUpdateEvent(update.chapter, update.exercise, update.completed);
            });
        }
        
        if (stillFailed.length > 0) {
            console.warn(`${stillFailed.length} progress updates still failed after retry`);
        }
        
    } catch (error) {
        console.error('Error retrying failed progress updates:', error);
    }
}

/**
 * Initialize progress tracking recovery system
 */
function initializeProgressRecovery() {
    // Retry failed updates when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(retryFailedProgressUpdates, 1000); // Wait 1 second after page load
        });
    } else {
        setTimeout(retryFailedProgressUpdates, 1000);
    }
    
    // Retry failed updates when ProgressTracker becomes available
    if (typeof ProgressTracker === 'undefined') {
        const checkForProgressTracker = setInterval(() => {
            if (typeof ProgressTracker !== 'undefined') {
                clearInterval(checkForProgressTracker);
                setTimeout(retryFailedProgressUpdates, 500);
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkForProgressTracker);
        }, 10000);
    }
    
    // Retry failed updates when localStorage becomes available
    window.addEventListener('storage', (event) => {
        if (event.key === 'uzbek-textbook-progress') {
            setTimeout(retryFailedProgressUpdates, 500);
        }
    });
    
    // Retry failed updates when page becomes visible (user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(retryFailedProgressUpdates, 1000);
        }
    });
}

// Initialize progress recovery system
initializeProgressRecovery();

/**
 * Enhanced helper functions for improved progress tracking integration
 * Requirements: 1.5, 2.2
 */

/**
 * Attempt to load ProgressTracker if script exists but not loaded
 */
function attemptProgressTrackerLoad() {
    try {
        // Check if progress-tracker.js script exists in the page
        const progressScript = document.querySelector('script[src*="progress-tracker"]');
        if (progressScript && typeof ProgressTracker === 'undefined') {
            console.log('ProgressTracker script found but not loaded, attempting dynamic load');
            
            // Try to reload the script
            const newScript = document.createElement('script');
            newScript.src = progressScript.src;
            newScript.onload = () => {
                console.log('ProgressTracker loaded successfully');
            };
            newScript.onerror = () => {
                console.warn('Failed to load ProgressTracker script');
            };
            document.head.appendChild(newScript);
            
            // Give it a moment to load
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(typeof ProgressTracker !== 'undefined');
                }, 100);
            });
        }
        
        return false;
    } catch (error) {
        console.warn('Error attempting to load ProgressTracker:', error);
        return false;
    }
}

/**
 * Enhanced chapter number fallback with more detection methods
 */
function getEnhancedChapterNumberFallback() {
    try {
        // Try multiple methods to determine chapter number
        
        // Method 1: Check URL pathname
        const pathname = window.location.pathname;
        
        // Handle special case for Chapter 0 (English_for_Uzbek_Seasonal_Workers.html)
        if (pathname.includes('English_for_Uzbek_Seasonal_Workers.html')) {
            return 0;
        }
        
        // Method 2: Extract from Chapter_X_ pattern
        const chapterMatch = pathname.match(/Chapter_(\d+)_/);
        if (chapterMatch) {
            const num = parseInt(chapterMatch[1]);
            if (num >= 0 && num <= 24) {
                return num;
            }
        }
        
        // Method 3: Try to match any number in the filename
        const numberMatch = pathname.match(/(\d+)/);
        if (numberMatch) {
            const num = parseInt(numberMatch[1]);
            if (num >= 0 && num <= 24) {
                return num;
            }
        }
        
        // Method 4: Check meta tags
        const chapterMeta = document.querySelector('meta[name="chapter"]');
        if (chapterMeta && chapterMeta.content) {
            const metaNum = parseInt(chapterMeta.content);
            if (!isNaN(metaNum) && metaNum >= 0 && metaNum <= 24) {
                return metaNum;
            }
        }
        
        // Method 5: Check page title
        const title = document.title;
        const titleMatch = title.match(/Chapter\s*(\d+)/i);
        if (titleMatch) {
            const num = parseInt(titleMatch[1]);
            if (num >= 0 && num <= 24) {
                return num;
            }
        }
        
        // Method 6: Check for chapter-specific elements
        const chapterElement = document.querySelector('[data-chapter]');
        if (chapterElement && chapterElement.dataset.chapter) {
            const elemNum = parseInt(chapterElement.dataset.chapter);
            if (!isNaN(elemNum) && elemNum >= 0 && elemNum <= 24) {
                return elemNum;
            }
        }
        
        // Method 7: Check body class for chapter indicator
        const bodyClasses = document.body.className;
        const classMatch = bodyClasses.match(/chapter-(\d+)/);
        if (classMatch) {
            const num = parseInt(classMatch[1]);
            if (num >= 0 && num <= 24) {
                return num;
            }
        }
        
        // Last resort - return 1 as default
        console.warn('Could not determine chapter number using enhanced methods, defaulting to 1');
        return 1;
        
    } catch (error) {
        console.error('Error in enhanced chapter number fallback:', error);
        return 1;
    }
}

/**
 * Verify progress structure compatibility with current format
 */
function verifyProgressStructureCompatibility() {
    try {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        
        const stored = localStorage.getItem('uzbek-textbook-progress');
        if (!stored) {
            return true; // No existing data, so compatible
        }
        
        const progress = JSON.parse(stored);
        
        // Check required structure
        if (!progress.chapters || typeof progress.chapters !== 'object') {
            return false;
        }
        
        // Check if all chapters 0-24 exist with proper structure
        for (let i = 0; i <= 24; i++) {
            const chapter = progress.chapters[i];
            if (!chapter || 
                typeof chapter.completed !== 'number' ||
                typeof chapter.total !== 'number' ||
                !Array.isArray(chapter.exercises) ||
                chapter.exercises.length !== 10) {
                return false;
            }
        }
        
        return true;
        
    } catch (error) {
        console.warn('Error verifying progress structure compatibility:', error);
        return false;
    }
}

/**
 * Migrate progress structure to current format
 */
function migrateProgressStructure() {
    try {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        
        const stored = localStorage.getItem('uzbek-textbook-progress');
        if (!stored) {
            // No existing data, create new structure
            const defaultProgress = {
                chapters: {},
                overallProgress: 0,
                completionDate: null,
                studentName: "",
                certificateGenerated: false,
                lastAccessed: new Date().toISOString()
            };
            
            // Initialize all chapters
            for (let i = 0; i <= 24; i++) {
                defaultProgress.chapters[i] = {
                    completed: 0,
                    total: 10,
                    exercises: new Array(10).fill(false),
                    lastAccessed: null
                };
            }
            
            localStorage.setItem('uzbek-textbook-progress', JSON.stringify(defaultProgress));
            return true;
        }
        
        const progress = JSON.parse(stored);
        let migrated = false;
        
        // Ensure chapters object exists
        if (!progress.chapters || typeof progress.chapters !== 'object') {
            progress.chapters = {};
            migrated = true;
        }
        
        // Ensure all chapters 0-24 exist
        for (let i = 0; i <= 24; i++) {
            if (!progress.chapters[i]) {
                progress.chapters[i] = {
                    completed: 0,
                    total: 10,
                    exercises: new Array(10).fill(false),
                    lastAccessed: null
                };
                migrated = true;
            } else {
                // Fix existing chapter structure
                const chapter = progress.chapters[i];
                
                if (typeof chapter.completed !== 'number') {
                    chapter.completed = 0;
                    migrated = true;
                }
                
                if (typeof chapter.total !== 'number') {
                    chapter.total = 10;
                    migrated = true;
                }
                
                if (!Array.isArray(chapter.exercises)) {
                    chapter.exercises = new Array(10).fill(false);
                    migrated = true;
                } else if (chapter.exercises.length !== 10) {
                    // Resize array to 10 elements
                    const newExercises = new Array(10).fill(false);
                    for (let j = 0; j < Math.min(chapter.exercises.length, 10); j++) {
                        newExercises[j] = Boolean(chapter.exercises[j]);
                    }
                    chapter.exercises = newExercises;
                    migrated = true;
                }
                
                // Recalculate completed count
                const actualCompleted = chapter.exercises.filter(Boolean).length;
                if (chapter.completed !== actualCompleted) {
                    chapter.completed = actualCompleted;
                    migrated = true;
                }
            }
        }
        
        // Ensure other required fields exist
        if (typeof progress.overallProgress !== 'number') {
            progress.overallProgress = 0;
            migrated = true;
        }
        
        if (!progress.lastAccessed) {
            progress.lastAccessed = new Date().toISOString();
            migrated = true;
        }
        
        // Recalculate overall progress
        let totalCompleted = 0;
        Object.values(progress.chapters).forEach(chapter => {
            totalCompleted += chapter.completed || 0;
        });
        const newOverallProgress = Math.round((totalCompleted / 250) * 100);
        
        if (progress.overallProgress !== newOverallProgress) {
            progress.overallProgress = newOverallProgress;
            migrated = true;
        }
        
        if (migrated) {
            localStorage.setItem('uzbek-textbook-progress', JSON.stringify(progress));
            console.log('Progress structure migrated successfully');
        }
        
        return true;
        
    } catch (error) {
        console.error('Error migrating progress structure:', error);
        return false;
    }
}

/**
 * Enhanced event dispatching with additional event types
 */
function dispatchEnhancedProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted) {
    try {
        // Dispatch the standard progress update event
        dispatchProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted);
        
        // Dispatch additional enhanced events
        const enhancedEvent = new CustomEvent('enhancedProgressUpdate', {
            detail: {
                chapterNumber: chapterNum,
                exerciseIndex: exerciseIndex,
                isCompleted: isCompleted,
                timestamp: new Date().toISOString(),
                source: 'enhanced-checkAnswer'
            },
            bubbles: true
        });
        
        document.dispatchEvent(enhancedEvent);
        
        // Dispatch chapter-specific event
        const chapterEvent = new CustomEvent(`chapter${chapterNum}ProgressUpdate`, {
            detail: {
                exerciseIndex: exerciseIndex,
                isCompleted: isCompleted,
                timestamp: new Date().toISOString()
            },
            bubbles: true
        });
        
        document.dispatchEvent(chapterEvent);
        
    } catch (error) {
        console.warn('Error dispatching enhanced progress update events:', error);
    }
}

/**
 * Validate progress consistency after update
 */
function validateProgressConsistency(chapterNum, exerciseIndex) {
    try {
        if (typeof ProgressTracker === 'undefined' || typeof ProgressTracker.getChapterProgress !== 'function') {
            return true; // Can't validate without ProgressTracker
        }
        
        const chapterProgress = ProgressTracker.getChapterProgress(chapterNum);
        if (!chapterProgress) {
            console.warn(`Chapter ${chapterNum} progress not found during validation`);
            return false;
        }
        
        // Validate exercise array length
        if (!Array.isArray(chapterProgress.exercises) || chapterProgress.exercises.length !== 10) {
            console.warn(`Chapter ${chapterNum} has invalid exercises array length: ${chapterProgress.exercises?.length}`);
            return false;
        }
        
        // Validate completed count matches actual completed exercises
        const actualCompleted = chapterProgress.exercises.filter(Boolean).length;
        if (chapterProgress.completed !== actualCompleted) {
            console.warn(`Chapter ${chapterNum} completed count mismatch: stored=${chapterProgress.completed}, actual=${actualCompleted}`);
            
            // Auto-fix the mismatch
            if (typeof ProgressTracker.updateExercise === 'function') {
                // Force recalculation by updating the same exercise
                ProgressTracker.updateExercise(chapterNum, exerciseIndex, chapterProgress.exercises[exerciseIndex]);
            }
            
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.warn('Error validating progress consistency:', error);
        return false;
    }
}

/**
 * Enhanced failure handling with multiple recovery strategies
 */
function handleProgressTrackingFailureWithRecovery(chapterNum, exerciseIndex, isCompleted, error) {
    try {
        console.warn('Attempting progress tracking recovery strategies');
        
        // Strategy 1: Try direct localStorage save
        if (attemptDirectProgressSave(chapterNum, exerciseIndex, isCompleted)) {
            console.log('Recovery successful using direct localStorage save');
            return true;
        }
        
        // Strategy 2: Try to reinitialize ProgressTracker
        if (typeof ProgressTracker !== 'undefined') {
            try {
                // Force cache invalidation if method exists
                if (typeof ProgressTracker.invalidateCache === 'function') {
                    ProgressTracker.invalidateCache();
                }
                
                // Retry the update
                if (typeof ProgressTracker.updateExercise === 'function') {
                    const retrySuccess = ProgressTracker.updateExercise(chapterNum, exerciseIndex, isCompleted);
                    if (retrySuccess) {
                        console.log('Recovery successful after cache invalidation');
                        return true;
                    }
                }
            } catch (retryError) {
                console.warn('Retry after cache invalidation failed:', retryError);
            }
        }
        
        // Strategy 3: Store for later retry
        storeFailedProgressUpdate(chapterNum, exerciseIndex, isCompleted);
        
        // Strategy 4: Use session storage as temporary backup
        try {
            const sessionKey = `temp-progress-${chapterNum}-${exerciseIndex}`;
            const tempData = {
                chapter: chapterNum,
                exercise: exerciseIndex,
                completed: isCompleted,
                timestamp: new Date().toISOString()
            };
            sessionStorage.setItem(sessionKey, JSON.stringify(tempData));
            console.log('Stored progress update in session storage for recovery');
        } catch (sessionError) {
            console.warn('Session storage backup also failed:', sessionError);
        }
        
        // Show user-friendly warning
        showProgressWarning();
        
        return false;
        
    } catch (recoveryError) {
        console.error('All recovery strategies failed:', recoveryError);
        return false;
    }
}

/**
 * Handle critical progress tracking failures while ensuring exercise functionality continues
 */
function handleCriticalProgressTrackingFailure(exerciseIndex, isCompleted, error) {
    try {
        console.error('Critical progress tracking failure, ensuring exercise functionality continues:', error);
        
        // Log the failure for debugging
        const failureLog = {
            exerciseIndex: exerciseIndex,
            isCompleted: isCompleted,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Store failure log in session storage for debugging
        try {
            const existingLogs = JSON.parse(sessionStorage.getItem('progressFailureLogs') || '[]');
            existingLogs.push(failureLog);
            
            // Keep only last 10 failure logs
            if (existingLogs.length > 10) {
                existingLogs.splice(0, existingLogs.length - 10);
            }
            
            sessionStorage.setItem('progressFailureLogs', JSON.stringify(existingLogs));
        } catch (logError) {
            console.warn('Could not store failure log:', logError);
        }
        
        // Show user notification that exercise functionality continues
        try {
            const notification = document.createElement('div');
            notification.className = 'critical-progress-failure-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">ℹ️</span>
                    <span class="notification-text">Exercise checking continues to work. Progress saving temporarily unavailable.</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--md-sys-color-info-container, #e3f2fd);
                color: var(--md-sys-color-on-info-container, #0d47a1);
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
                z-index: 999;
                max-width: 300px;
                font-size: 14px;
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);
            
        } catch (notificationError) {
            console.warn('Could not show critical failure notification:', notificationError);
        }
        
        // Return false to indicate progress tracking failed, but don't break exercise functionality
        return false;
        
    } catch (criticalError) {
        console.error('Critical error in critical progress tracking failure handler:', criticalError);
        return false;
    }
}

/**
 * Enhanced localStorage availability check with quota detection
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__localStorage_test__';
        const testValue = 'test';
        
        // Test basic availability
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrieved !== testValue) {
            return false;
        }
        
        // Test quota by trying to store a larger item
        const largeTestKey = '__localStorage_quota_test__';
        const largeTestValue = 'x'.repeat(1024); // 1KB test
        
        try {
            localStorage.setItem(largeTestKey, largeTestValue);
            localStorage.removeItem(largeTestKey);
            return true;
        } catch (quotaError) {
            console.warn('localStorage quota exceeded:', quotaError);
            return false;
        }
        
    } catch (error) {
        console.warn('localStorage not available:', error);
        return false;
    }
}

/**
 * Enhanced direct progress save with better error handling
 */
function attemptDirectProgressSave(chapterNum, exerciseIndex, isCompleted) {
    try {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        
        // If chapterNum is null, try to determine it
        if (chapterNum === null || chapterNum === undefined) {
            chapterNum = getEnhancedChapterNumberFallback();
        }
        
        const storageKey = 'uzbek-textbook-progress';
        let progress;
        
        // Get existing progress or create new
        const existingData = localStorage.getItem(storageKey);
        if (existingData) {
            try {
                progress = JSON.parse(existingData);
            } catch (parseError) {
                console.warn('Corrupted progress data, creating new:', parseError);
                progress = null;
            }
        }
        
        // Create default structure if needed
        if (!progress || !progress.chapters) {
            progress = {
                chapters: {},
                overallProgress: 0,
                completionDate: null,
                studentName: "",
                certificateGenerated: false,
                lastAccessed: new Date().toISOString()
            };
            
            // Initialize all chapters
            for (let i = 0; i <= 24; i++) {
                progress.chapters[i] = {
                    completed: 0,
                    total: 10,
                    exercises: new Array(10).fill(false),
                    lastAccessed: null
                };
            }
        }
        
        // Ensure chapter exists
        if (!progress.chapters[chapterNum]) {
            progress.chapters[chapterNum] = {
                completed: 0,
                total: 10,
                exercises: new Array(10).fill(false),
                lastAccessed: null
            };
        }
        
        // Update exercise
        const chapter = progress.chapters[chapterNum];
        if (exerciseIndex >= 0 && exerciseIndex < 10) {
            chapter.exercises[exerciseIndex] = isCompleted;
            chapter.completed = chapter.exercises.filter(Boolean).length;
            chapter.lastAccessed = new Date().toISOString();
            
            // Recalculate overall progress
            let totalCompleted = 0;
            Object.values(progress.chapters).forEach(ch => {
                totalCompleted += ch.completed || 0;
            });
            progress.overallProgress = Math.round((totalCompleted / 250) * 100);
            progress.lastAccessed = new Date().toISOString();
            
            // Check for course completion
            if (progress.overallProgress === 100 && !progress.completionDate) {
                progress.completionDate = new Date().toISOString();
            }
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Direct progress save successful:', {
                chapter: chapterNum,
                exercise: exerciseIndex,
                completed: isCompleted
            });
            
            // Dispatch events
            dispatchEnhancedProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.warn('Direct progress save failed:', error);
        return false;
    }
}
/**

 * Verify localStorage format compatibility with existing progress structure
 * Requirements: 1.5
 */
function verifyLocalStorageFormatCompatibility(chapterNum, exerciseIndex) {
    try {
        if (typeof ProgressTracker === 'undefined') {
            console.warn('ProgressTracker not available for format verification');
            return true; // Assume compatible if ProgressTracker not available
        }
        
        // Get the current progress data
        const progress = ProgressTracker.getProgress();
        
        if (!progress || !progress.chapters) {
            console.warn('Progress data structure is invalid');
            return false;
        }
        
        // Verify the specific chapter and exercise data
        const chapter = progress.chapters[chapterNum];
        if (!chapter) {
            console.warn(`Chapter ${chapterNum} not found in progress data`);
            return false;
        }
        
        // Verify exercise array structure
        if (!Array.isArray(chapter.exercises) || chapter.exercises.length !== 10) {
            console.warn(`Chapter ${chapterNum} exercises array is invalid: length ${chapter.exercises?.length}`);
            return false;
        }
        
        // Verify exercise index is within bounds
        if (exerciseIndex < 0 || exerciseIndex >= 10) {
            console.warn(`Exercise index ${exerciseIndex} is out of bounds for chapter ${chapterNum}`);
            return false;
        }
        
        // Verify overall progress calculation
        let totalCompleted = 0;
        Object.values(progress.chapters).forEach(ch => {
            totalCompleted += ch.completed || 0;
        });
        
        const expectedOverallProgress = Math.round((totalCompleted / 250) * 100);
        if (Math.abs(progress.overallProgress - expectedOverallProgress) > 1) {
            console.warn(`Overall progress calculation mismatch: stored=${progress.overallProgress}, calculated=${expectedOverallProgress}`);
            // Auto-correct the overall progress
            progress.overallProgress = expectedOverallProgress;
            if (typeof ProgressTracker.saveProgress === 'function') {
                ProgressTracker.saveProgress(progress);
            }
        }
        
        console.log(`Progress format compatibility verified for Chapter ${chapterNum}, Exercise ${exerciseIndex}`);
        return true;
        
    } catch (error) {
        console.error('Error verifying localStorage format compatibility:', error);
        return false;
    }
}

/**
 * Enhanced event dispatching for progress updates with backward compatibility
 * Requirements: 1.5
 */
function dispatchEnhancedProgressUpdateEvent(chapterNum, exerciseIndex, isCompleted) {
    try {
        // Dispatch the new enhanced event
        const enhancedEvent = new CustomEvent('exerciseProgressUpdate', {
            detail: {
                chapterNumber: chapterNum,
                exerciseIndex: exerciseIndex,
                isCompleted: isCompleted,
                timestamp: new Date().toISOString(),
                source: 'enhanced-checkAnswer'
            },
            bubbles: true,
            cancelable: false
        });
        
        document.dispatchEvent(enhancedEvent);
        
        // Dispatch legacy events for backward compatibility
        const legacyEvent = new CustomEvent('exerciseCompleted', {
            detail: {
                exerciseIndex: exerciseIndex,
                isCorrect: isCompleted,
                chapterNumber: chapterNum
            },
            bubbles: true,
            cancelable: false
        });
        
        document.dispatchEvent(legacyEvent);
        
        // Dispatch progress update event for UI components
        const progressEvent = new CustomEvent('progressUpdate', {
            detail: {
                chapterId: chapterNum,
                exerciseIndex: exerciseIndex,
                isCompleted: isCompleted,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            cancelable: false
        });
        
        document.dispatchEvent(progressEvent);
        
        console.log(`Enhanced progress events dispatched for Chapter ${chapterNum}, Exercise ${exerciseIndex}`);
        
    } catch (error) {
        console.warn('Error dispatching enhanced progress update events:', error);
        
        // Fallback to basic event dispatching
        try {
            const basicEvent = new CustomEvent('exerciseCompleted', {
                detail: { exerciseIndex, isCorrect: isCompleted }
            });
            document.dispatchEvent(basicEvent);
        } catch (fallbackError) {
            console.error('Even basic event dispatching failed:', fallbackError);
        }
    }
}

/**
 * Enhanced chapter number fallback with better detection
 * Requirements: 1.5, 2.2
 */
function getEnhancedChapterNumberFallback() {
    try {
        // Strategy 1: Try URL pathname analysis
        const pathname = window.location.pathname;
        
        // Handle special case for Chapter 0 (English_for_Uzbek_Seasonal_Workers.html)
        if (pathname.includes('English_for_Uzbek_Seasonal_Workers.html')) {
            console.log('Detected Chapter 0 from filename');
            return 0;
        }
        
        // Try to match Chapter_X pattern
        const chapterMatch = pathname.match(/Chapter_(\d+)/i);
        if (chapterMatch) {
            const num = parseInt(chapterMatch[1]);
            if (num >= 0 && num <= 24) {
                console.log(`Detected Chapter ${num} from URL pattern`);
                return num;
            }
        }
        
        // Strategy 2: Try document title analysis
        const title = document.title;
        const titleMatch = title.match(/Chapter\s*(\d+)/i);
        if (titleMatch) {
            const num = parseInt(titleMatch[1]);
            if (num >= 0 && num <= 24) {
                console.log(`Detected Chapter ${num} from document title`);
                return num;
            }
        }
        
        // Strategy 3: Try main heading analysis
        const headings = document.querySelectorAll('h1, h2, .chapter-title');
        for (const heading of headings) {
            const headingMatch = heading.textContent.match(/Chapter\s*(\d+)/i);
            if (headingMatch) {
                const num = parseInt(headingMatch[1]);
                if (num >= 0 && num <= 24) {
                    console.log(`Detected Chapter ${num} from heading`);
                    return num;
                }
            }
        }
        
        // Strategy 4: Try meta tag analysis
        const chapterMeta = document.querySelector('meta[name="chapter"], meta[property="chapter"]');
        if (chapterMeta && chapterMeta.content) {
            const metaNum = parseInt(chapterMeta.content);
            if (!isNaN(metaNum) && metaNum >= 0 && metaNum <= 24) {
                console.log(`Detected Chapter ${metaNum} from meta tag`);
                return metaNum;
            }
        }
        
        // Strategy 5: Try data attribute analysis
        const chapterElement = document.querySelector('[data-chapter], [data-chapter-id]');
        if (chapterElement) {
            const dataChapter = chapterElement.dataset.chapter || chapterElement.dataset.chapterId;
            if (dataChapter) {
                const dataNum = parseInt(dataChapter);
                if (!isNaN(dataNum) && dataNum >= 0 && dataNum <= 24) {
                    console.log(`Detected Chapter ${dataNum} from data attribute`);
                    return dataNum;
                }
            }
        }
        
        // Strategy 6: Try body class analysis
        const bodyClasses = document.body.className;
        const classMatch = bodyClasses.match(/chapter-(\d+)/i);
        if (classMatch) {
            const num = parseInt(classMatch[1]);
            if (num >= 0 && num <= 24) {
                console.log(`Detected Chapter ${num} from body class`);
                return num;
            }
        }
        
        // Final fallback - return 1 as safe default
        console.warn('Could not determine chapter number using enhanced fallback, defaulting to Chapter 1');
        return 1;
        
    } catch (error) {
        console.error('Error in enhanced chapter number fallback:', error);
        return 1;
    }
}

/**
 * Attempt to load ProgressTracker if not available
 * Requirements: 2.2
 */
function attemptProgressTrackerLoad() {
    try {
        // Check if ProgressTracker script is already loaded but not initialized
        if (typeof ProgressTracker !== 'undefined') {
            return true;
        }
        
        // Check if progress-tracker.js script exists in the page
        const existingScript = document.querySelector('script[src*="progress-tracker"]');
        if (existingScript) {
            console.log('ProgressTracker script found but not loaded, waiting for initialization');
            
            // Wait a short time for script to initialize
            return new Promise((resolve) => {
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof ProgressTracker !== 'undefined') {
                        clearInterval(checkInterval);
                        console.log('ProgressTracker loaded successfully');
                        resolve(true);
                    } else if (attempts >= 10) { // Wait max 1 second
                        clearInterval(checkInterval);
                        console.warn('ProgressTracker failed to load after waiting');
                        resolve(false);
                    }
                }, 100);
            });
        }
        
        // Try to dynamically load the script if not present
        const scriptPath = 'progress-tracker.js';
        const script = document.createElement('script');
        script.src = scriptPath;
        script.async = true;
        
        return new Promise((resolve) => {
            script.onload = () => {
                console.log('ProgressTracker script loaded dynamically');
                // Wait for initialization
                setTimeout(() => {
                    resolve(typeof ProgressTracker !== 'undefined');
                }, 100);
            };
            
            script.onerror = () => {
                console.warn('Failed to load ProgressTracker script dynamically');
                resolve(false);
            };
            
            document.head.appendChild(script);
            
            // Timeout after 3 seconds
            setTimeout(() => {
                console.warn('ProgressTracker loading timeout');
                resolve(false);
            }, 3000);
        });
        
    } catch (error) {
        console.error('Error attempting to load ProgressTracker:', error);
        return false;
    }
}

/**
 * Store failed progress updates for later retry
 * Requirements: 2.2
 */
function storeFailedProgressUpdate(chapterNum, exerciseIndex, isCompleted) {
    try {
        const failedUpdates = JSON.parse(sessionStorage.getItem('failed-progress-updates') || '[]');
        
        const update = {
            chapterNum,
            exerciseIndex,
            isCompleted,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };
        
        failedUpdates.push(update);
        
        // Keep only the last 50 failed updates to prevent storage bloat
        if (failedUpdates.length > 50) {
            failedUpdates.splice(0, failedUpdates.length - 50);
        }
        
        sessionStorage.setItem('failed-progress-updates', JSON.stringify(failedUpdates));
        
        console.log(`Stored failed progress update: Chapter ${chapterNum}, Exercise ${exerciseIndex}`);
        
        // Schedule retry attempt
        scheduleProgressRetry();
        
        return true;
        
    } catch (error) {
        console.error('Error storing failed progress update:', error);
        return false;
    }
}

/**
 * Schedule retry of failed progress updates
 * Requirements: 2.2
 */
function scheduleProgressRetry() {
    // Only schedule if not already scheduled
    if (window.progressRetryScheduled) {
        return;
    }
    
    window.progressRetryScheduled = true;
    
    // Retry after 5 seconds
    setTimeout(() => {
        retryFailedProgressUpdates();
        window.progressRetryScheduled = false;
    }, 5000);
}

/**
 * Retry failed progress updates
 * Requirements: 2.2
 */
function retryFailedProgressUpdates() {
    try {
        if (typeof ProgressTracker === 'undefined') {
            console.log('ProgressTracker still not available, will retry later');
            return;
        }
        
        const failedUpdates = JSON.parse(sessionStorage.getItem('failed-progress-updates') || '[]');
        
        if (failedUpdates.length === 0) {
            return;
        }
        
        console.log(`Retrying ${failedUpdates.length} failed progress updates`);
        
        const successfulUpdates = [];
        const stillFailedUpdates = [];
        
        failedUpdates.forEach((update, index) => {
            try {
                const success = ProgressTracker.updateExercise(
                    update.chapterNum, 
                    update.exerciseIndex, 
                    update.isCompleted
                );
                
                if (success) {
                    successfulUpdates.push(update);
                    console.log(`Successfully retried: Chapter ${update.chapterNum}, Exercise ${update.exerciseIndex}`);
                } else {
                    update.retryCount = (update.retryCount || 0) + 1;
                    if (update.retryCount < 3) {
                        stillFailedUpdates.push(update);
                    } else {
                        console.warn(`Giving up on failed update after 3 retries: Chapter ${update.chapterNum}, Exercise ${update.exerciseIndex}`);
                    }
                }
            } catch (retryError) {
                console.warn(`Retry failed for Chapter ${update.chapterNum}, Exercise ${update.exerciseIndex}:`, retryError);
                update.retryCount = (update.retryCount || 0) + 1;
                if (update.retryCount < 3) {
                    stillFailedUpdates.push(update);
                }
            }
        });
        
        // Update the failed updates list
        sessionStorage.setItem('failed-progress-updates', JSON.stringify(stillFailedUpdates));
        
        if (successfulUpdates.length > 0) {
            console.log(`Successfully retried ${successfulUpdates.length} progress updates`);
            
            // Dispatch events for successful retries
            successfulUpdates.forEach(update => {
                dispatchEnhancedProgressUpdateEvent(update.chapterNum, update.exerciseIndex, update.isCompleted);
            });
        }
        
        // Schedule another retry if there are still failed updates
        if (stillFailedUpdates.length > 0) {
            scheduleProgressRetry();
        }
        
    } catch (error) {
        console.error('Error retrying failed progress updates:', error);
    }
}

/**
 * Retry failed progress updates
 * Requirements: 2.2
 */
function retryFailedProgressUpdates() {
    try {
        const failedUpdates = JSON.parse(sessionStorage.getItem('failed-progress-updates') || '[]');
        
        if (failedUpdates.length === 0) {
            return;
        }
        
        console.log(`Retrying ${failedUpdates.length} failed progress updates`);
        
        const remainingUpdates = [];
        
        for (const update of failedUpdates) {
            update.retryCount = (update.retryCount || 0) + 1;
            
            // Skip updates that have been retried too many times
            if (update.retryCount > 3) {
                console.warn('Abandoning progress update after 3 retry attempts:', update);
                continue;
            }
            
            // Try to update progress
            if (typeof ProgressTracker !== 'undefined' && typeof ProgressTracker.updateExercise === 'function') {
                try {
                    const success = ProgressTracker.updateExercise(update.chapterNum, update.exerciseIndex, update.isCompleted);
                    if (success) {
                        console.log('Successfully retried progress update:', update);
                        continue; // Don't add to remaining updates
                    }
                } catch (retryError) {
                    console.warn('Retry attempt failed:', retryError);
                }
            }
            
            // Add to remaining updates if retry failed
            remainingUpdates.push(update);
        }
        
        // Update session storage with remaining failed updates
        sessionStorage.setItem('failed-progress-updates', JSON.stringify(remainingUpdates));
        
        // Schedule another retry if there are still failed updates
        if (remainingUpdates.length > 0) {
            setTimeout(() => {
                retryFailedProgressUpdates();
            }, 10000); // Retry again after 10 seconds
        }
        
    } catch (error) {
        console.error('Error retrying failed progress updates:', error);
    }
}

/**
 * Show user-friendly progress warning
 * Requirements: 2.2
 */
function showProgressWarning() {
    try {
        // Check if warning is already shown
        if (document.querySelector('.progress-warning-notification')) {
            return;
        }
        
        const warning = document.createElement('div');
        warning.className = 'progress-warning-notification';
        warning.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    <strong>Progress Tracking Issue</strong><br>
                    Your exercise answers are working, but progress may not be saved. 
                    We'll try to recover automatically.
                </div>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--md-sys-color-warning-container, #fff3cd);
            color: var(--md-sys-color-on-warning-container, #856404);
            border: 1px solid var(--md-sys-color-warning, #ffc107);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 400px;
            font-size: 14px;
            animation: slideDown 0.3s ease-out;
        `;
        
        // Add animation styles
        if (!document.getElementById('progress-warning-styles')) {
            const style = document.createElement('style');
            style.id = 'progress-warning-styles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
                
                .warning-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .warning-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .warning-text {
                    flex: 1;
                    line-height: 1.4;
                }
                
                .warning-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                
                .warning-close:hover {
                    background: rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.style.animation = 'slideDown 0.3s ease-out reverse';
                setTimeout(() => {
                    if (warning.parentNode) {
                        warning.parentNode.removeChild(warning);
                    }
                }, 300);
            }
        }, 10000);
        
    } catch (error) {
        console.warn('Error showing progress warning:', error);
    }
}
/**
 
* Error reporting system for validation failures
 * Provides structured error data collection and debugging helpers for development
 * Requirements: 5.4, 5.5
 */
const ValidationErrorReporter = {
    // Error collection storage
    errors: [],
    
    // Maximum number of errors to keep in memory
    maxErrors: 50,
    
    // Error categories for classification
    errorCategories: {
        INPUT_VALIDATION: 'input_validation',
        SENTENCE_COMPLETENESS: 'sentence_completeness', 
        SPELLING_ACCURACY: 'spelling_accuracy',
        PASSIVE_VOICE_STRUCTURE: 'passive_voice_structure',
        CONTENT_MATCHING: 'content_matching',
        EXERCISE_TYPE_DETECTION: 'exercise_type_detection',
        SYSTEM_ERROR: 'system_error'
    },
    
    /**
     * Report a validation failure with structured data
     */
    reportValidationFailure(errorData) {
        const errorReport = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            category: errorData.category || this.errorCategories.SYSTEM_ERROR,
            step: errorData.step || 'unknown',
            userInput: errorData.userInput || '',
            expectedAnswer: errorData.expectedAnswer || '',
            exerciseType: errorData.exerciseType || 'unknown',
            errorType: errorData.errorType || 'unknown',
            reason: errorData.reason || 'No reason provided',
            details: errorData.details || {},
            stackTrace: new Error().stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            chapterId: this.getCurrentChapterId()
        };
        
        // Add to errors collection
        this.errors.push(errorReport);
        
        // Keep only the most recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Enhanced console logging for validation failures
        console.group(`[VALIDATION-ERROR] ${errorReport.category.toUpperCase()}`);
        console.error('Reason:', errorReport.reason);
        console.error('Step:', errorReport.step);
        console.error('Error Type:', errorReport.errorType);
        console.error('User Input:', `"${errorReport.userInput}"`);
        console.error('Expected Answer:', `"${errorReport.expectedAnswer}"`);
        console.error('Exercise Type:', errorReport.exerciseType);
        console.error('Chapter ID:', errorReport.chapterId);
        console.error('Error ID:', errorReport.id);
        
        // Log specific details based on error category
        if (errorReport.details && Object.keys(errorReport.details).length > 0) {
            console.error('Additional Details:', errorReport.details);
        }
        
        // Add helpful debugging suggestions
        this.logDebuggingSuggestions(errorReport);
        
        console.groupEnd();
        
        // Store in localStorage for persistence across sessions
        this.persistError(errorReport);
        
        return errorReport.id;
    },

    /**
     * Log debugging suggestions based on error type
     */
    logDebuggingSuggestions(errorReport) {
        const suggestions = [];
        
        switch (errorReport.category) {
            case this.errorCategories.SENTENCE_COMPLETENESS:
                suggestions.push('Check if answer has at least 3 words');
                suggestions.push('Verify answer starts with capital letter');
                suggestions.push('Ensure answer contains a verb');
                break;
                
            case this.errorCategories.SPELLING_ACCURACY:
                suggestions.push('Compare user input word-by-word with expected answer');
                suggestions.push('Check for common typos (e.g., "aare" instead of "are")');
                suggestions.push('Verify contractions are handled correctly');
                break;
                
            case this.errorCategories.PASSIVE_VOICE_STRUCTURE:
                suggestions.push('Check for "to be" verb (am/is/are/was/were/been)');
                suggestions.push('Verify past participle is present');
                suggestions.push('Look for Subject + "to be" + Past Participle pattern');
                break;
                
            case this.errorCategories.CONTENT_MATCHING:
                suggestions.push('Check for extra words in user input');
                suggestions.push('Verify normalized comparison is working correctly');
                suggestions.push('Look for punctuation or whitespace issues');
                break;
                
            case this.errorCategories.EXERCISE_TYPE_DETECTION:
                suggestions.push('Check exercise context for passive voice indicators');
                suggestions.push('Verify HTML structure contains proper context markers');
                suggestions.push('Look for "Vaziyat: Talk about an official process, Passive voice"');
                break;
        }
        
        if (suggestions.length > 0) {
            console.error('Debugging Suggestions:');
            suggestions.forEach((suggestion, index) => {
                console.error(`  ${index + 1}. ${suggestion}`);
            });
        }
    },
    
    /**
     * Report a system error during validation
     */
    reportSystemError(error, context = {}) {
        const errorReport = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            category: this.errorCategories.SYSTEM_ERROR,
            step: context.step || 'unknown',
            errorMessage: error.message || 'Unknown error',
            errorName: error.name || 'Error',
            stackTrace: error.stack || new Error().stack,
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            chapterId: this.getCurrentChapterId()
        };
        
        this.errors.push(errorReport);
        
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error('[VALIDATION-SYSTEM-ERROR]', error.message, errorReport);
        this.persistError(errorReport);
        
        return errorReport.id;
    },
    
    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Get current chapter ID from URL or page context
     */
    getCurrentChapterId() {
        // Try to extract chapter ID from URL
        const urlMatch = window.location.pathname.match(/Chapter_(\d+)/);
        if (urlMatch) {
            return `chapter_${urlMatch[1]}`;
        }
        
        // Try to extract from page title
        const titleMatch = document.title.match(/Chapter (\d+)/);
        if (titleMatch) {
            return `chapter_${titleMatch[1]}`;
        }
        
        // Fallback to checking for specific chapter indicators
        if (window.location.pathname.includes('English_for_Uzbek_Seasonal_Workers')) {
            return 'chapter_1';
        }
        
        return 'unknown_chapter';
    },

    /**
     * Collect additional context data for error reporting
     */
    collectContextData(exerciseElement = null) {
        const context = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            chapterId: this.getCurrentChapterId(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            memory: navigator.deviceMemory || null,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };

        // Add exercise-specific context if available
        if (exerciseElement) {
            context.exercise = {
                type: exerciseElement.dataset.type || 'unknown',
                index: exerciseElement.dataset.exercise || 'unknown',
                answer: exerciseElement.dataset.answer || 'unknown',
                hint: exerciseElement.dataset.hint || 'none',
                innerHTML: exerciseElement.innerHTML.substring(0, 500) + '...',
                classList: Array.from(exerciseElement.classList),
                parentElement: exerciseElement.parentElement ? {
                    tagName: exerciseElement.parentElement.tagName,
                    classList: Array.from(exerciseElement.parentElement.classList)
                } : null
            };
        }

        // Add performance data
        if (performance && performance.memory) {
            context.performance = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }

        return context;
    },
    
    /**
     * Persist error to localStorage for analysis
     */
    persistError(errorReport) {
        try {
            const existingErrors = JSON.parse(localStorage.getItem('validation_errors') || '[]');
            existingErrors.push(errorReport);
            
            // Keep only the most recent 100 errors in localStorage
            if (existingErrors.length > 100) {
                existingErrors.splice(0, existingErrors.length - 100);
            }
            
            localStorage.setItem('validation_errors', JSON.stringify(existingErrors));
        } catch (error) {
            console.warn('Failed to persist validation error:', error);
        }
    },
    
    /**
     * Get recent errors for debugging
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    },
    
    /**
     * Get errors by category
     */
    getErrorsByCategory(category) {
        return this.errors.filter(error => error.category === category);
    },
    
    /**
     * Get error statistics
     */
    getErrorStatistics() {
        const stats = {
            total: this.errors.length,
            byCategory: {},
            byStep: {},
            byExerciseType: {},
            recentCount: 0
        };
        
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        this.errors.forEach(error => {
            // Count by category
            stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
            
            // Count by step
            stats.byStep[error.step] = (stats.byStep[error.step] || 0) + 1;
            
            // Count by exercise type
            stats.byExerciseType[error.exerciseType] = (stats.byExerciseType[error.exerciseType] || 0) + 1;
            
            // Count recent errors (last hour)
            if (new Date(error.timestamp) > oneHourAgo) {
                stats.recentCount++;
            }
        });
        
        return stats;
    },
    
    /**
     * Export all errors as JSON for analysis
     */
    exportErrors() {
        return JSON.stringify({
            errors: this.errors,
            statistics: this.getErrorStatistics(),
            exportTimestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        }, null, 2);
    },
    
    /**
     * Clear all error data
     */
    clearErrors() {
        this.errors = [];
        try {
            localStorage.removeItem('validation_errors');
        } catch (error) {
            console.warn('Failed to clear persisted errors:', error);
        }
        console.log('[VALIDATION-ERROR-REPORTER] All errors cleared');
    },
    
    /**
     * Load persisted errors from localStorage
     */
    loadPersistedErrors() {
        try {
            const persistedErrors = JSON.parse(localStorage.getItem('validation_errors') || '[]');
            console.log(`[VALIDATION-ERROR-REPORTER] Loaded ${persistedErrors.length} persisted errors`);
            return persistedErrors;
        } catch (error) {
            console.warn('Failed to load persisted errors:', error);
            return [];
        }
    }
};

/**
 * Debugging helpers for development
 * Provides utility functions for debugging validation issues
 * Requirements: 5.4, 5.5
 */
const ValidationDebugHelpers = {
    /**
     * Enable comprehensive debugging mode
     */
    enableDebugMode() {
        ValidationLogger.enableDebug();
        console.log('[DEBUG] Validation debugging enabled');
        console.log('[DEBUG] Available debug commands:');
        console.log('  - ValidationDebugHelpers.testValidation(userInput, correctAnswer)');
        console.log('  - ValidationDebugHelpers.analyzeExercise(exerciseElement)');
        console.log('  - ValidationDebugHelpers.getValidationReport()');
        console.log('  - ValidationErrorReporter.getErrorStatistics()');
        console.log('  - ValidationLogger.getRecentLogs()');
    },
    
    /**
     * Test validation with detailed output
     */
    testValidation(userInput, correctAnswer, exerciseElement = null) {
        console.group(`[DEBUG] Testing validation: "${userInput}" vs "${correctAnswer}"`);
        
        try {
            ValidationLogger.enableDebug();
            const result = validateAnswer(userInput, correctAnswer, exerciseElement);
            
            console.log('Result:', result);
            console.log('Recent logs:', ValidationLogger.getRecentLogs(5));
            
            if (exerciseElement && exerciseElement.dataset.lastValidationResult) {
                const detailedResult = JSON.parse(exerciseElement.dataset.lastValidationResult);
                console.log('Detailed result:', detailedResult);
            }
            
        } catch (error) {
            console.error('Validation test failed:', error);
            ValidationErrorReporter.reportSystemError(error, {
                step: 'debug_test_validation',
                userInput,
                correctAnswer
            });
        }
        
        console.groupEnd();
        return result;
    },
    
    /**
     * Analyze an exercise element for debugging
     */
    analyzeExercise(exerciseElement) {
        if (!exerciseElement) {
            console.error('[DEBUG] No exercise element provided');
            return null;
        }
        
        console.group('[DEBUG] Exercise Analysis');
        
        try {
            const analysis = {
                type: exerciseElement.dataset.type || 'unknown',
                answer: exerciseElement.dataset.answer || 'unknown',
                hint: exerciseElement.dataset.hint || 'none',
                exerciseIndex: exerciseElement.dataset.exercise || 'unknown',
                context: extractExerciseContext(exerciseElement),
                detectedType: detectExerciseType(extractExerciseContext(exerciseElement)),
                element: exerciseElement
            };
            
            console.log('Exercise data:', analysis);
            console.log('Context preview:', analysis.context.substring(0, 200) + '...');
            console.log('Detected type:', analysis.detectedType);
            
            return analysis;
            
        } catch (error) {
            console.error('Exercise analysis failed:', error);
            ValidationErrorReporter.reportSystemError(error, {
                step: 'debug_analyze_exercise'
            });
            return null;
        } finally {
            console.groupEnd();
        }
    },
    
    /**
     * Get comprehensive validation report
     */
    getValidationReport() {
        console.group('[DEBUG] Validation System Report');
        
        try {
            const report = {
                loggerStatus: {
                    enabled: ValidationLogger.enabled,
                    totalLogs: ValidationLogger.logs.length,
                    recentLogs: ValidationLogger.getRecentLogs(5)
                },
                errorReporter: {
                    totalErrors: ValidationErrorReporter.errors.length,
                    statistics: ValidationErrorReporter.getErrorStatistics(),
                    recentErrors: ValidationErrorReporter.getRecentErrors(3)
                },
                systemInfo: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    chapterId: ValidationErrorReporter.getCurrentChapterId()
                }
            };
            
            console.log('Validation System Report:', report);
            return report;
            
        } catch (error) {
            console.error('Failed to generate validation report:', error);
            return null;
        } finally {
            console.groupEnd();
        }
    },
    
    /**
     * Test passive voice validation specifically
     */
    testPassiveVoiceValidation(userInput, correctAnswer) {
        console.group(`[DEBUG] Testing passive voice validation: "${userInput}"`);
        
        try {
            ValidationLogger.enableDebug();
            
            console.log('Step 1: Sentence completeness');
            const isComplete = isCompleteSentence(userInput);
            console.log('  Result:', isComplete);
            
            console.log('Step 2: Spelling accuracy');
            const hasCorrectSpelling = hasCorrectSpelling(userInput, correctAnswer);
            console.log('  Result:', hasCorrectSpelling);
            
            console.log('Step 3: Passive voice structure');
            const hasPassiveStructure = hasPassiveVoiceStructure(userInput);
            console.log('  Result:', hasPassiveStructure);
            
            console.log('Step 4: Content matching');
            const matchesContent = matchesExpectedAnswer(userInput, correctAnswer);
            console.log('  Result:', matchesContent);
            
            console.log('Final validation:');
            const finalResult = validatePassiveVoiceAnswer(userInput, correctAnswer);
            console.log('  Result:', finalResult);
            
            return finalResult;
            
        } catch (error) {
            console.error('Passive voice validation test failed:', error);
            ValidationErrorReporter.reportSystemError(error, {
                step: 'debug_test_passive_voice',
                userInput,
                correctAnswer
            });
        } finally {
            console.groupEnd();
        }
    },

    /**
     * Generate detailed error report for a specific validation failure
     */
    generateErrorReport(errorId) {
        const error = ValidationErrorReporter.errors.find(e => e.id === errorId);
        if (!error) {
            console.error(`[DEBUG] Error with ID ${errorId} not found`);
            return null;
        }

        console.group(`[DEBUG] Error Report: ${errorId}`);
        console.log('Error Details:', error);
        console.log('Timestamp:', new Date(error.timestamp).toLocaleString());
        console.log('Category:', error.category);
        console.log('Step:', error.step);
        console.log('User Input:', error.userInput);
        console.log('Expected Answer:', error.expectedAnswer);
        console.log('Error Type:', error.errorType);
        console.log('Reason:', error.reason);
        console.log('Details:', error.details);
        console.groupEnd();

        return error;
    },

    /**
     * Monitor validation performance and report slow validations
     */
    monitorValidationPerformance() {
        const performanceThreshold = 100; // 100ms as per requirement 5.5
        const recentLogs = ValidationLogger.getRecentLogs(50);
        const timingLogs = recentLogs.filter(log => log.level === 'TIMING');
        
        console.group('[DEBUG] Validation Performance Monitor');
        
        const slowValidations = timingLogs.filter(log => 
            log.details.duration > performanceThreshold
        );

        if (slowValidations.length > 0) {
            console.warn(`Found ${slowValidations.length} slow validations (>${performanceThreshold}ms):`);
            slowValidations.forEach(log => {
                console.warn(`  - ${log.details.step}: ${log.details.duration.toFixed(2)}ms`);
            });
        } else {
            console.log('All recent validations are within performance threshold');
        }

        // Calculate average validation time
        const totalValidationLogs = timingLogs.filter(log => 
            log.details.step === 'total_validation'
        );
        
        if (totalValidationLogs.length > 0) {
            const avgTime = totalValidationLogs.reduce((sum, log) => 
                sum + log.details.duration, 0) / totalValidationLogs.length;
            console.log(`Average validation time: ${avgTime.toFixed(2)}ms`);
        }

        console.groupEnd();
        return { slowValidations, totalValidationLogs };
    },

    /**
     * Analyze error patterns and provide insights
     */
    analyzeErrorPatterns() {
        const errors = ValidationErrorReporter.errors;
        if (errors.length === 0) {
            console.log('[DEBUG] No errors to analyze');
            return null;
        }

        console.group('[DEBUG] Error Pattern Analysis');

        // Group errors by category
        const errorsByCategory = {};
        const errorsByStep = {};
        const errorsByType = {};

        errors.forEach(error => {
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
            errorsByStep[error.step] = (errorsByStep[error.step] || 0) + 1;
            if (error.errorType) {
                errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
            }
        });

        console.log('Errors by Category:', errorsByCategory);
        console.log('Errors by Step:', errorsByStep);
        console.log('Errors by Type:', errorsByType);

        // Find most common error patterns
        const mostCommonCategory = Object.keys(errorsByCategory).reduce((a, b) => 
            errorsByCategory[a] > errorsByCategory[b] ? a : b
        );
        const mostCommonStep = Object.keys(errorsByStep).reduce((a, b) => 
            errorsByStep[a] > errorsByStep[b] ? a : b
        );

        console.log(`Most common error category: ${mostCommonCategory} (${errorsByCategory[mostCommonCategory]} occurrences)`);
        console.log(`Most common error step: ${mostCommonStep} (${errorsByStep[mostCommonStep]} occurrences)`);

        // Recent error trend
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentErrors = errors.filter(error => new Date(error.timestamp) > oneHourAgo);
        console.log(`Recent errors (last hour): ${recentErrors.length}`);

        console.groupEnd();

        return {
            errorsByCategory,
            errorsByStep,
            errorsByType,
            mostCommonCategory,
            mostCommonStep,
            recentErrors: recentErrors.length
        };
    },

    /**
     * Export comprehensive debugging data
     */
    exportDebugData() {
        const debugData = {
            timestamp: new Date().toISOString(),
            validationLogs: ValidationLogger.logs,
            errorReports: ValidationErrorReporter.errors,
            errorStatistics: ValidationErrorReporter.getErrorStatistics(),
            performanceData: this.monitorValidationPerformance(),
            errorPatterns: this.analyzeErrorPatterns(),
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                chapterId: ValidationErrorReporter.getCurrentChapterId(),
                debugEnabled: ValidationLogger.enabled
            }
        };

        console.log('[DEBUG] Exporting comprehensive debug data');
        return JSON.stringify(debugData, null, 2);
    }
};

// Initialize error reporter with persisted errors on page load
document.addEventListener('DOMContentLoaded', function() {
    const persistedErrors = ValidationErrorReporter.loadPersistedErrors();
    if (persistedErrors.length > 0) {
        console.log(`[VALIDATION-ERROR-REPORTER] Loaded ${persistedErrors.length} persisted errors from previous sessions`);
    }
});

/**
 * Additional debugging utilities for development
 * Provides quick access to common debugging tasks
 */
const ValidationDebugUtils = {
    /**
     * Quick test for common validation scenarios
     */
    quickTest() {
        console.log('[DEBUG] Running quick validation tests...');
        
        const testCases = [
            // Passive voice tests
            { input: 'The forms are required', expected: 'The forms are required', type: 'PASSIVE_VOICE' },
            { input: 'is', expected: 'The forms are required', type: 'PASSIVE_VOICE' },
            { input: 'aare required', expected: 'are required', type: 'PASSIVE_VOICE' },
            { input: 'was have worked can speak', expected: 'The work was completed', type: 'PASSIVE_VOICE' },
            
            // Standard tests
            { input: 'hello', expected: 'hello', type: 'STANDARD' },
            { input: 'Hello World', expected: 'hello world', type: 'STANDARD' }
        ];
        
        testCases.forEach((testCase, index) => {
            console.group(`Test ${index + 1}: "${testCase.input}"`);
            
            if (testCase.type === 'PASSIVE_VOICE') {
                const result = validatePassiveVoiceAnswer(testCase.input, testCase.expected);
                console.log('Result:', result.isCorrect ? 'PASS' : 'FAIL');
                if (!result.isCorrect) {
                    console.log('Error Type:', result.errorType);
                    console.log('Feedback:', result.feedback);
                }
            } else {
                const result = validateStandardAnswer(testCase.input, testCase.expected);
                console.log('Result:', result ? 'PASS' : 'FAIL');
            }
            
            console.groupEnd();
        });
    },

    /**
     * Monitor validation in real-time
     */
    startMonitoring() {
        console.log('[DEBUG] Starting real-time validation monitoring...');
        ValidationLogger.enableDebug();
        
        // Override console methods to capture validation logs
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.error = function(...args) {
            if (args[0] && args[0].includes('[VALIDATION')) {
                console.log('🔴 VALIDATION ERROR DETECTED:', ...args);
            }
            originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
            if (args[0] && args[0].includes('[VALIDATION')) {
                console.log('🟡 VALIDATION WARNING DETECTED:', ...args);
            }
            originalWarn.apply(console, args);
        };
        
        console.log('✅ Monitoring started. Validation errors and warnings will be highlighted.');
        
        return {
            stop: () => {
                console.error = originalError;
                console.warn = originalWarn;
                console.log('⏹️ Monitoring stopped.');
            }
        };
    },

    /**
     * Generate validation health report
     */
    healthCheck() {
        console.group('[DEBUG] Validation System Health Check');
        
        const health = {
            loggerStatus: ValidationLogger.enabled ? '✅ Enabled' : '❌ Disabled',
            errorCount: ValidationErrorReporter.errors.length,
            recentErrors: ValidationErrorReporter.getRecentErrors(5).length,
            performanceIssues: 0,
            systemStatus: '✅ Healthy'
        };
        
        // Check for performance issues
        const recentLogs = ValidationLogger.getRecentLogs(20);
        const slowValidations = recentLogs.filter(log => 
            log.level === 'TIMING' && 
            log.details.duration > 100
        );
        
        health.performanceIssues = slowValidations.length;
        
        if (health.errorCount > 10) {
            health.systemStatus = '⚠️ High Error Count';
        } else if (health.performanceIssues > 0) {
            health.systemStatus = '⚠️ Performance Issues';
        } else if (!ValidationLogger.enabled) {
            health.systemStatus = '⚠️ Logging Disabled';
        }
        
        console.log('Health Status:', health);
        
        if (health.performanceIssues > 0) {
            console.warn(`Found ${health.performanceIssues} slow validations:`);
            slowValidations.forEach(log => {
                console.warn(`  - ${log.details.step}: ${log.details.duration.toFixed(2)}ms`);
            });
        }
        
        console.groupEnd();
        return health;
    },

    /**
     * Clear all debugging data
     */
    clearAll() {
        ValidationLogger.clearLogs();
        ValidationErrorReporter.clearErrors();
        console.log('[DEBUG] All validation debugging data cleared');
    },

    /**
     * Create a comprehensive error reporting dashboard
     */
    createErrorDashboard() {
        const errors = ValidationErrorReporter.errors;
        const logs = ValidationLogger.logs;
        
        console.group('📊 VALIDATION ERROR DASHBOARD');
        
        // Summary statistics
        console.log('📈 SUMMARY STATISTICS');
        console.log(`Total Errors: ${errors.length}`);
        console.log(`Total Logs: ${logs.length}`);
        console.log(`Debug Mode: ${ValidationLogger.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        
        // Error breakdown by category
        const errorsByCategory = {};
        errors.forEach(error => {
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
        });
        
        console.log('\n🏷️ ERRORS BY CATEGORY');
        Object.entries(errorsByCategory).forEach(([category, count]) => {
            console.log(`  ${category}: ${count}`);
        });
        
        // Recent error trend
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentErrors = errors.filter(error => new Date(error.timestamp) > oneHourAgo);
        
        console.log('\n⏰ RECENT ACTIVITY (Last Hour)');
        console.log(`Recent Errors: ${recentErrors.length}`);
        
        // Performance analysis
        const timingLogs = logs.filter(log => log.level === 'TIMING');
        const slowValidations = timingLogs.filter(log => log.details.duration > 100);
        
        console.log('\n⚡ PERFORMANCE ANALYSIS');
        console.log(`Total Validations: ${timingLogs.length}`);
        console.log(`Slow Validations (>100ms): ${slowValidations.length}`);
        
        if (timingLogs.length > 0) {
            const avgTime = timingLogs.reduce((sum, log) => sum + log.details.duration, 0) / timingLogs.length;
            console.log(`Average Validation Time: ${avgTime.toFixed(2)}ms`);
        }
        
        // Top error patterns
        if (errors.length > 0) {
            console.log('\n🔍 TOP ERROR PATTERNS');
            const errorPatterns = {};
            errors.forEach(error => {
                const pattern = `${error.category}:${error.errorType}`;
                errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
            });
            
            const sortedPatterns = Object.entries(errorPatterns)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
                
            sortedPatterns.forEach(([pattern, count], index) => {
                console.log(`  ${index + 1}. ${pattern}: ${count} occurrences`);
            });
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        if (!ValidationLogger.enabled) {
            console.log('  • Enable debug mode for detailed logging: vlogger.enableDebug()');
        }
        if (slowValidations.length > 0) {
            console.log('  • Investigate slow validations for performance optimization');
        }
        if (recentErrors.length > 5) {
            console.log('  • High error rate detected - check for systematic issues');
        }
        if (errors.length === 0) {
            console.log('  • ✅ No errors detected - system is functioning well');
        }
        
        console.groupEnd();
        
        return {
            summary: {
                totalErrors: errors.length,
                totalLogs: logs.length,
                debugEnabled: ValidationLogger.enabled
            },
            errorsByCategory,
            recentErrors: recentErrors.length,
            performance: {
                totalValidations: timingLogs.length,
                slowValidations: slowValidations.length,
                averageTime: timingLogs.length > 0 ? 
                    timingLogs.reduce((sum, log) => sum + log.details.duration, 0) / timingLogs.length : 0
            }
        };
    }
};

// Expose debugging helpers to global scope for development
if (typeof window !== 'undefined') {
    window.ValidationDebugHelpers = ValidationDebugHelpers;
    window.ValidationLogger = ValidationLogger;
    window.ValidationErrorReporter = ValidationErrorReporter;
    window.ValidationDebugUtils = ValidationDebugUtils;
    
    // Add convenient global shortcuts for debugging
    window.vdebug = ValidationDebugHelpers;
    window.vlogger = ValidationLogger;
    window.verror = ValidationErrorReporter;
    window.vutils = ValidationDebugUtils;
    
    console.log('[DEBUG] Validation debugging tools loaded. Available commands:');
    console.log('  - vdebug.enableDebugMode() - Enable comprehensive debugging');
    console.log('  - vutils.quickTest() - Run quick validation tests');
    console.log('  - vutils.healthCheck() - Check system health');
    console.log('  - vutils.createErrorDashboard() - Show comprehensive error dashboard');
    console.log('  - vutils.startMonitoring() - Start real-time monitoring');
    console.log('  - verror.getErrorStatistics() - Get error statistics');
    console.log('  - vlogger.getRecentLogs() - Get recent logs');
    console.log('  - vutils.clearAll() - Clear all debugging data');
}