# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:





# Default project rules

# ✅ Required for Reanimated 3+
# -keep class com.facebook.** { *; }
# -keepclassmembers class * {
#    @com.facebook.proguard.annotations.DoNotStrip *;
# }
# -keepclassmembers class * {
#   native <methods>;
# }







# -------------------------------------------
#  React Native – core & 3rd-party libraries
# -------------------------------------------

# ✅  Reanimated 3 (and Facebook core)
-keep class com.facebook.** { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers class * {
    native <methods>;
}

# ✅  Hermes / JSI
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ✅  react-native-share
-keep class com.facebook.internal.NativeProtocol { *; }

# ✅  react-native-html-to-pdf (uses iText)
-keep class com.itextpdf.** { *; }
-dontwarn com.itextpdf.**

# ✅  kotlin-stdlib (transitive dependency)
-keep class kotlin.** { *; }

# ✅  OkHttp & Okio
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# ✅  Misc — avoid stripping generic type info
-keepattributes *Annotation*, Signature

