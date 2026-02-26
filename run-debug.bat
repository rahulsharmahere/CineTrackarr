@echo off
echo =============================
echo Cleaning Android build...
echo =============================

cd android
call gradlew clean
cd ..

echo =============================
echo Running React Native Android
echo =============================

npx react-native run-android

pause