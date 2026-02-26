@echo off
echo =============================
echo Cleaning Android build...
echo =============================

cd android
call gradlew clean

echo =============================
echo Building Release APK...
echo =============================

call gradlew assembleRelease

cd ..

echo =============================
echo Done!
echo APK location:
echo android\app\build\outputs\apk\release\
echo =============================

pause