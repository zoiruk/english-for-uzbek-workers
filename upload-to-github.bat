@echo off
echo ========================================
echo   Загрузка курса на GitHub Pages
echo ========================================
echo.

REM Инициализация Git репозитория
echo [1/6] Инициализация Git...
git init

REM Добавление основных файлов
echo [2/6] Добавление основных страниц...
git add index.html
git add glossary.html
git add course-completion.html
git add course-info.html
git add faq.html
git add user-guide.html
git add 404.html

REM Добавление всех глав
echo [3/6] Добавление глав курса...
git add Chapter_*.html
git add English_for_Uzbek_Seasonal_Workers.html

REM Добавление JavaScript файлов
echo [4/6] Добавление интерактивных функций...
git add interactive-exercises.js
git add progress-tracker.js
git add certificate-generator.js
git add telegram-web-app.js
git add sw.js

REM Добавление конфигурационных файлов
echo [5/6] Добавление конфигурации...
git add _config.yml
git add manifest.json
git add robots.txt
git add .htaccess
git add Gemfile
git add .gitignore

REM Добавление иконок (если существуют)
if exist icon-192.png git add icon-192.png
if exist icon-512.png git add icon-512.png

REM Добавление GitHub Actions
git add .github/workflows/deploy.yml

REM Добавление документации
git add README.md
git add GITHUB_PAGES_SETUP.md
git add QUICK_DEPLOY.md
git add DEPLOYMENT_CHECKLIST.md
git add FILES_TO_UPLOAD.md

REM Коммит
echo [6/6] Создание коммита...
git commit -m "English learning course with Telegram Mini App support"

echo.
echo ========================================
echo   Файлы готовы к загрузке!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Создайте репозиторий на GitHub
echo 2. Выполните команды:
echo.
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 3. Настройте GitHub Pages в Settings репозитория
echo.
pause