@echo off
echo ========================================
echo TrustCampus Database Update
echo ========================================
echo.
echo This will add the student_name column to the attendance table.
echo.
pause

mysql -u root -p trustcampus < migration_add_student_name.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database updated successfully.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR! Database update failed.
    echo Please check your MySQL credentials.
    echo ========================================
)

echo.
pause
