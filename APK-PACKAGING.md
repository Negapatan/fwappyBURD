# Packaging Fwappy Burd as an APK

This guide explains how to package your Fwappy Burd web game as an Android APK.

## Method 1: Using Cordova (Recommended)

### Prerequisites
- Node.js and npm installed
- Android Studio installed
- Android SDK configured

### Steps

1. **Install Cordova**
   ```
   npm install -g cordova
   ```

2. **Create a Cordova project**
   ```
   cordova create fwappy-burd-app com.yourdomain.fwappyburd "Fwappy Burd"
   cd fwappy-burd-app
   cordova platform add android
   ```

3. **Generate app icons**
   First, install the required packages:
   ```
   npm install canvas fs
   ```
   
   Then run the icon generator script:
   ```
   node generate-icons.js
   ```
   
   Copy the generated icons to the Cordova project's icon folders:
   ```
   cp app-icon-36.png platforms/android/app/src/main/res/mipmap-ldpi/ic_launcher.png
   cp app-icon-48.png platforms/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   cp app-icon-72.png platforms/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
   cp app-icon-96.png platforms/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
   cp app-icon-144.png platforms/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
   cp app-icon-192.png platforms/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
   ```

4. **Copy your game files**
   Copy all your game files (HTML, CSS, JS, sprites, audio) to the `www` folder in the Cordova project, replacing the default files.

5. **Configure the app**
   Edit the `config.xml` file in the root of your Cordova project:
   ```xml
   <?xml version='1.0' encoding='utf-8'?>
   <widget id="com.yourdomain.fwappyburd" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
       <name>Fwappy Burd</name>
       <description>A fun flappy bird style game with multiple difficulty levels</description>
       <author email="your@email.com" href="http://yourdomain.com">Your Name</author>
       <content src="index.html" />
       <access origin="*" />
       <allow-intent href="http://*/*" />
       <allow-intent href="https://*/*" />
       <allow-intent href="tel:*" />
       <allow-intent href="sms:*" />
       <allow-intent href="mailto:*" />
       <allow-intent href="geo:*" />
       <platform name="android">
           <allow-intent href="market:*" />
           <preference name="Fullscreen" value="true" />
           <preference name="Orientation" value="portrait" />
       </platform>
   </widget>
   ```

6. **Build the APK**
   ```
   cordova build android
   ```

7. **Find your APK**
   The APK file will be generated in:
   ```
   platforms/android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Method 2: Using Capacitor (Alternative)

Capacitor is a more modern alternative to Cordova:

1. **Initialize a new project**
   ```
   npm init
   npm install @capacitor/core @capacitor/cli
   npx cap init fwappy-burd com.yourdomain.fwappyburd
   ```

2. **Add Android platform**
   ```
   npm install @capacitor/android
   npx cap add android
   ```

3. **Copy your web files to the www directory**

4. **Generate and copy icons** (as in Method 1)

5. **Build and run**
   ```
   npx cap copy android
   npx cap open android
   ```

6. **Build the APK in Android Studio**
   - Open the project in Android Studio
   - Select Build > Build Bundle(s) / APK(s) > Build APK(s)

## Method 3: Using Online Services

If you prefer not to set up the development environment, you can use online services:

1. **GoNative.io**: https://gonative.io/
2. **AppMaker**: https://appmaker.xyz/
3. **WebViewGold**: https://webviewgold.com/

These services allow you to upload your web files or provide a URL, and they generate an APK for you.

## Testing Your APK

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in your device settings
3. Install and test the app

## Publishing to Google Play Store

1. Sign your APK using Android Studio
2. Create a developer account on Google Play Console
3. Follow the submission process to publish your game

Good luck with your Fwappy Burd APK! 