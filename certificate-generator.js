/**
 * Certificate Generator for English for Uzbek Seasonal Workers
 * Generates PDF certificates using browser print functionality
 */

class CertificateGenerator {
    static COURSE_NAME = "English for Uzbek Seasonal Workers – CEFR A0–A1";
    static ORGANIZATION = "Zoir UK - English Learning Platform";

    /**
     * Check if user is eligible for certificate
     */
    static isEligible() {
        if (typeof ProgressTracker === 'undefined') {
            console.error('ProgressTracker not available');
            return false;
        }

        return ProgressTracker.isCourseCompleted();
    }

    /**
     * Generate certificate with student name
     */
    static generateCertificate(studentName) {
        if (!this.isEligible()) {
            alert('Sertifikat olish uchun barcha 250 mashqni bajarishingiz kerak.');
            return false;
        }

        if (!this.validateStudentName(studentName)) {
            alert('Iltimos, to\'g\'ri ism kiriting (faqat harflar va bo\'shliqlar).');
            return false;
        }

        // Create certificate content
        const certificateHtml = this.createCertificateHTML(studentName);

        // Open print dialog
        this.printCertificate(certificateHtml);

        // Mark certificate as generated
        if (typeof ProgressTracker !== 'undefined') {
            ProgressTracker.markCertificateGenerated(studentName);
        }

        return true;
    }

    /**
     * Validate student name
     */
    static validateStudentName(name) {
        if (!name || typeof name !== 'string') return false;

        const trimmedName = name.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) return false;

        // Allow letters, spaces, apostrophes, and hyphens
        const nameRegex = /^[a-zA-ZА-Яа-яЁёO'oʻ\s\-']+$/;
        return nameRegex.test(trimmedName);
    }

    /**
     * Create certificate HTML content
     */
    static createCertificateHTML(studentName) {
        const completionDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificate of Completion - ${studentName}</title>
            <style>
                /* Material Design 3 Color Tokens */
                :root {
                    --md-sys-color-primary: #1976d2;
                    --md-sys-color-on-primary: #ffffff;
                    --md-sys-color-primary-container: #d3e3fd;
                    --md-sys-color-on-primary-container: #001c38;
                    --md-sys-color-secondary: #03dac6;
                    --md-sys-color-on-secondary: #000000;
                    --md-sys-color-secondary-container: #b2dfdb;
                    --md-sys-color-on-secondary-container: #004d40;
                    --md-sys-color-tertiary: #7d5260;
                    --md-sys-color-on-tertiary: #ffffff;
                    --md-sys-color-surface: #fefbff;
                    --md-sys-color-on-surface: #1c1b1f;
                    --md-sys-color-on-surface-variant: #44474f;
                    --md-sys-color-outline: #74777f;
                    
                    /* M3 Shape Tokens */
                    --md-sys-shape-corner-small: 4px;
                    --md-sys-shape-corner-medium: 12px;
                    --md-sys-shape-corner-large: 16px;
                    --md-sys-shape-corner-extra-large: 28px;
                    
                    /* M3 Elevation Tokens */
                    --md-sys-elevation-level1: 0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24);
                    --md-sys-elevation-level2: 0px 2px 6px rgba(0,0,0,0.15), 0px 1px 2px rgba(0,0,0,0.30);
                    --md-sys-elevation-level3: 0px 6px 10px rgba(0,0,0,0.14), 0px 1px 18px rgba(0,0,0,0.12), 0px 3px 5px rgba(0,0,0,0.20);
                    
                    /* M3 Typography Tokens */
                    --md-sys-typescale-display-large-weight: 400;
                    --md-sys-typescale-display-large-line-height: 1.12;
                    --md-sys-typescale-display-large-tracking: -0.25px;
                    --md-sys-typescale-headline-medium-weight: 500;
                    --md-sys-typescale-title-large-weight: 500;
                    --md-sys-typescale-title-large-tracking: 0px;
                    --md-sys-typescale-title-medium-weight: 500;
                    --md-sys-typescale-body-large-weight: 400;
                    --md-sys-typescale-body-large-line-height: 1.5;
                    --md-sys-typescale-body-medium-weight: 400;
                    --md-sys-typescale-body-medium-line-height: 1.43;
                    --md-sys-typescale-body-small-weight: 400;
                }
                
                @page {
                    size: A4;
                    margin: 0;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, var(--md-sys-color-primary, #1976d2) 0%, var(--md-sys-color-secondary, #03dac6) 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .certificate-container {
                    width: 210mm;
                    height: 297mm;
                    background: var(--md-sys-color-surface, #fefbff);
                    padding: 25mm;
                    box-shadow: var(--md-sys-elevation-level3, 0px 6px 10px rgba(0,0,0,0.14), 0px 1px 18px rgba(0,0,0,0.12), 0px 3px 5px rgba(0,0,0,0.20));
                    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
                    position: relative;
                    overflow: hidden;
                }
                
                .certificate-border {
                    position: absolute;
                    top: 15mm;
                    left: 15mm;
                    right: 15mm;
                    bottom: 15mm;
                    border: 3px solid var(--md-sys-color-primary, #1976d2);
                    border-radius: var(--md-sys-shape-corner-large, 16px);
                    background: linear-gradient(45deg, 
                        var(--md-sys-color-primary-container, #d3e3fd) 0%, 
                        transparent 50%, 
                        var(--md-sys-color-secondary-container, #b2dfdb) 100%);
                    opacity: 0.1;
                }
                
                .certificate-header {
                    text-align: center;
                    margin-bottom: 20mm;
                }
                
                .certificate-title {
                    font-size: 28pt;
                    font-weight: var(--md-sys-typescale-display-large-weight, 400);
                    color: var(--md-sys-color-primary, #1976d2);
                    margin-bottom: 6mm;
                    letter-spacing: var(--md-sys-typescale-display-large-tracking, -0.25px);
                    line-height: var(--md-sys-typescale-display-large-line-height, 1.12);
                }
                
                .certificate-subtitle {
                    font-size: 14pt;
                    color: var(--md-sys-color-on-surface-variant, #44474f);
                    font-weight: var(--md-sys-typescale-title-large-weight, 400);
                    letter-spacing: var(--md-sys-typescale-title-large-tracking, 0px);
                }
                
                .certificate-content {
                    text-align: center;
                    line-height: var(--md-sys-typescale-body-large-line-height, 1.4);
                    font-size: 12pt;
                    color: var(--md-sys-color-on-surface, #1c1b1f);
                    margin-bottom: 15mm;
                    font-weight: var(--md-sys-typescale-body-large-weight, 400);
                }
                

                
                .student-name {
                    font-size: 20pt;
                    font-weight: var(--md-sys-typescale-headline-medium-weight, 500);
                    color: var(--md-sys-color-primary, #1976d2);
                    margin: 10mm 0;
                    padding: 4mm 0;
                    border-bottom: 2px solid var(--md-sys-color-primary, #1976d2);
                    display: inline-block;
                    min-width: 60mm;
                    background: linear-gradient(90deg, 
                        var(--md-sys-color-primary-container, #d3e3fd) 0%, 
                        transparent 100%);
                    border-radius: var(--md-sys-shape-corner-small, 4px);
                    padding-left: 6mm;
                    padding-right: 6mm;
                }
                
                .course-name {
                    font-size: 15pt;
                    font-weight: var(--md-sys-typescale-title-large-weight, 500);
                    color: var(--md-sys-color-on-surface, #1c1b1f);
                    margin: 8mm 0;
                    background: var(--md-sys-color-secondary-container, #b2dfdb);
                    padding: 3mm 6mm;
                    border-radius: var(--md-sys-shape-corner-medium, 12px);
                    display: inline-block;
                }
                
                .course-details {
                    font-size: 10pt;
                    color: var(--md-sys-color-on-surface-variant, #44474f);
                    margin: 6mm 0;
                    line-height: var(--md-sys-typescale-body-medium-line-height, 1.3);
                    font-weight: var(--md-sys-typescale-body-medium-weight, 400);
                }
                

                
                .certificate-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 15mm;
                }
                
                .completion-date {
                    font-size: 10pt;
                    color: var(--md-sys-color-on-surface-variant, #44474f);
                    font-weight: var(--md-sys-typescale-body-medium-weight, 400);
                }
                
                /* Uzbek text styling */
                .uzbek-text {
                    display: inline-block;
                    padding: 1mm 3mm;
                    background: linear-gradient(90deg, 
                        rgba(3, 218, 198, 0.03) 0%, 
                        transparent 100%);
                    border-radius: var(--md-sys-shape-corner-small, 4px);
                    border-left: 1px solid rgba(3, 218, 198, 0.2);
                    margin: 1mm 0;
                }
                
                .uzbek-text em {
                    font-size: 10pt;
                    color: var(--md-sys-color-on-surface-variant, #666);
                    font-style: italic;
                    opacity: 0.8;
                }
                
                .uzbek-course-details {
                    display: block;
                    margin-top: 3mm;
                    padding: 2mm 0 2mm 4mm;
                    border-left: 2px solid var(--md-sys-color-secondary, #03dac6);
                    background: linear-gradient(90deg, 
                        rgba(3, 218, 198, 0.05) 0%, 
                        transparent 100%);
                    border-radius: var(--md-sys-shape-corner-small, 4px);
                }
                
                .uzbek-course-details em {
                    font-size: 9pt;
                    color: var(--md-sys-color-on-surface-variant, #666);
                    font-style: italic;
                    opacity: 0.85;
                }
                
                .uzbek-date {
                    display: inline-block;
                    padding: 0.5mm 2mm;
                    background: linear-gradient(90deg, 
                        rgba(3, 218, 198, 0.02) 0%, 
                        transparent 100%);
                    border-radius: var(--md-sys-shape-corner-small, 4px);
                    border-left: 1px solid rgba(3, 218, 198, 0.15);
                    margin-top: 1mm;
                }
                
                .uzbek-date em {
                    font-size: 9pt;
                    color: var(--md-sys-color-on-surface-variant, #777);
                    font-style: italic;
                    opacity: 0.8;
                }
                
                .signature-section {
                    text-align: center;
                }
                
                .signature-line {
                    width: 50mm;
                    height: 1px;
                    background: #333;
                    margin-bottom: 5mm;
                }
                
                .signature-text {
                    font-size: 10pt;
                    color: var(--md-sys-color-on-surface-variant, #44474f);
                    font-weight: var(--md-sys-typescale-body-small-weight, 400);
                }
                
                .organization {
                    font-size: 12pt;
                    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
                    color: var(--md-sys-color-primary, #1976d2);
                }
                
                .achievement-badge {
                    position: absolute;
                    top: 20mm;
                    right: 20mm;
                    width: 20mm;
                    height: 20mm;
                    background: var(--md-sys-color-tertiary, #7d5260);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--md-sys-color-on-tertiary, #ffffff);
                    font-size: 12pt;
                    font-weight: var(--md-sys-typescale-title-medium-weight, 500);
                    box-shadow: var(--md-sys-elevation-level2, 0px 2px 6px rgba(0,0,0,0.15), 0px 1px 2px rgba(0,0,0,0.30));
                }
                
                .decorative-elements {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    opacity: 0.03;
                    background-image: 
                        radial-gradient(circle at 25% 25%, var(--md-sys-color-primary, #1976d2) 2px, transparent 2px),
                        radial-gradient(circle at 75% 75%, var(--md-sys-color-secondary, #03dac6) 2px, transparent 2px),
                        radial-gradient(circle at 50% 50%, var(--md-sys-color-tertiary, #7d5260) 1px, transparent 1px);
                    background-size: 20mm 20mm, 25mm 25mm, 15mm 15mm;
                }
                
                @media print {
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .certificate-container {
                        box-shadow: none !important;
                        margin: 0;
                        width: 100%;
                        height: 100vh;
                        border-radius: 0 !important;
                        background: white !important;
                    }
                    
                    .certificate-border {
                        border-radius: var(--md-sys-shape-corner-large, 16px) !important;
                    }
                    
                    .decorative-elements {
                        opacity: 0.08 !important;
                    }
                    
                    /* Ensure colors print correctly */
                    .student-name,
                    .certificate-title,
                    .organization,
                    .achievement-badge {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="certificate-border"></div>
                <div class="decorative-elements"></div>
                <div class="achievement-badge">A1</div>
                
                <div class="certificate-header">
                    <h1 class="certificate-title">Certificate of Completion</h1>
                    <p class="certificate-subtitle">Yakunlash sertifikati</p>
                </div>
                
                <div class="certificate-content">
                    <p>This certifies that</p>
                    <p><span class="uzbek-text"><em>Bu sertifikat tasdiqlaydi</em></span></p>
                    
                    <div class="student-name">${studentName}</div>
                    
                    <p>has successfully completed the comprehensive course</p>
                    <p><span class="uzbek-text"><em>quyidagi kursni muvaffaqiyatli yakunlagan</em></span></p>
                    
                    <div class="course-name">${this.COURSE_NAME}</div>
                    
                    <div class="course-details">
                        covering all 25 chapters including:<br>
                        <strong>Vocabulary</strong> (750 words) • <strong>Grammar</strong> (A0-A1 level) • 
                        <strong>Everyday English</strong> • <strong>Productive Skills</strong><br><br>
                        
                        <span class="uzbek-course-details"><em>25 ta bobni o'z ichiga olgan holda:<br>
                        <strong>Lug'at</strong> (750 so'z) • <strong>Grammatika</strong> (A0-A1 daraja) • 
                        <strong>Kundalik ingliz tili</strong> • <strong>Amaliy ko'nikmalar</strong></em></span>
                    </div>
                    
                    <p>demonstrating proficiency in English language skills<br>
                    essential for seasonal workers in the United Kingdom</p>
                    
                    <p><span class="uzbek-text"><em>Buyuk Britaniyada mavsumiy ishchilar uchun<br>
                    zarur bo'lgan ingliz tili ko'nikmalarini namoyon etgan holda</em></span></p>
                    
                    <div class="certificate-footer">
                        <div class="completion-date">
                            <strong>Date of Completion:</strong><br>
                            <span class="uzbek-date"><em>Yakunlash sanasi:</em></span><br>
                            ${completionDate}
                        </div>
                        
                        <div class="signature-section">
                            <div class="signature-line"></div>
                            <div class="signature-text">Authorized Signature</div>
                            <div class="organization">${this.ORGANIZATION}</div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Print certificate using browser print functionality
     */
    static printCertificate(certificateHtml) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Pop-up blocker ga qarshi kurashing. Sertifikatni chop etish uchun pop-up ga ruxsat bering.');
            return false;
        }

        // Write certificate HTML to new window
        printWindow.document.write(certificateHtml);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = function () {
            setTimeout(() => {
                printWindow.print();

                // Close window after printing (optional)
                printWindow.onafterprint = function () {
                    printWindow.close();
                };
            }, 500);
        };

        return true;
    }

    /**
     * Show certificate generation form
     */
    static showCertificateForm() {
        if (!this.isEligible()) {
            alert('Sertifikat olish uchun barcha 250 mashqni bajarishingiz kerak.');
            return;
        }

        const studentName = prompt(
            'Sertifikat uchun ismingizni kiriting:\n' +
            'Enter your name for the certificate:'
        );

        if (studentName) {
            this.generateCertificate(studentName);
        }
    }

    /**
     * Create certificate button HTML
     */
    static createCertificateButton() {
        const isEligible = this.isEligible();
        const buttonClass = isEligible ? 'certificate-btn-enabled' : 'certificate-btn-disabled';
        const buttonText = isEligible ? 'Sertifikat olish / Get Certificate' : 'Kursni yakunlang / Complete Course';

        return `
            <button 
                class="certificate-btn ${buttonClass}" 
                onclick="CertificateGenerator.showCertificateForm()"
                ${!isEligible ? 'disabled' : ''}
            >
                ${buttonText}
            </button>
        `;
    }

    /**
     * Initialize certificate system on page
     */
    static init() {
        // Add certificate button to page if eligible
        const certificateContainer = document.querySelector('.certificate-container');
        if (certificateContainer) {
            certificateContainer.innerHTML = this.createCertificateButton();
        }

        // Listen for progress updates to update button state
        document.addEventListener('progressUpdate', () => {
            const certificateContainer = document.querySelector('.certificate-container');
            if (certificateContainer) {
                certificateContainer.innerHTML = this.createCertificateButton();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    if (typeof window !== 'undefined') {
        window.CertificateGenerator = CertificateGenerator;

        // Auto-initialize if certificate container exists
        if (document.querySelector('.certificate-container')) {
            CertificateGenerator.init();
        }
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.CertificateGenerator = CertificateGenerator;
}