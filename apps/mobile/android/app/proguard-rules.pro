# Proguard rules for FreelancerX
-keepattributes *Annotation*
-keepclassmembers class * {
    @org.webkit.regexp.DoNotStripAny <fields>;
}
