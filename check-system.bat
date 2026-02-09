@echo off
echo ========================================
echo TrustCampus System Check
echo ========================================
echo.

echo [1/5] Checking MySQL Connection...
cd backend
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'$hreya$*832006',database:'trustcampus'}).then(conn => {console.log('  [OK] MySQL connected'); conn.end();}).catch(err => console.error('  [FAIL] MySQL error:', err.message));"
echo.

echo [2/5] Checking Backend Dependencies...
if exist "node_modules" (
    echo   [OK] Backend node_modules found
) else (
    echo   [FAIL] Backend node_modules missing - run: npm install
)
echo.

echo [3/5] Checking Frontend Dependencies...
cd ..\frontend
if exist "node_modules" (
    echo   [OK] Frontend node_modules found
) else (
    echo   [FAIL] Frontend node_modules missing - run: npm install
)
echo.

echo [4/5] Checking Smart Contract Artifacts...
if exist "src\attendance_artifact.json" (
    echo   [OK] attendance_artifact.json found
) else (
    echo   [FAIL] attendance_artifact.json missing
)
if exist "src\certificate_artifact.json" (
    echo   [OK] certificate_artifact.json found
) else (
    echo   [FAIL] certificate_artifact.json missing
)
if exist "src\voting_artifact.json" (
    echo   [OK] voting_artifact.json found
) else (
    echo   [FAIL] voting_artifact.json missing
)
echo.

echo [5/5] Checking Configuration Files...
cd ..\backend
if exist ".env" (
    echo   [OK] Backend .env found
) else (
    echo   [FAIL] Backend .env missing
)
cd ..\frontend
if exist "src\config.js" (
    echo   [OK] Frontend config.js found
) else (
    echo   [FAIL] Frontend config.js missing
)
echo.

echo ========================================
echo System Check Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Fix any [FAIL] items above
echo 2. Configure Lute wallet extension to TestNet
echo 3. Start backend: cd backend ^&^& npm start
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo 5. Open test-lute.html to test wallet connection
echo.
pause
