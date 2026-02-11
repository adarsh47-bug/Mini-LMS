/**
 * CourseWebViewScreen
 *
 * WebView screen that displays course content via an HTML template.
 * Implements bidirectional communication between native and WebView.
 * Handles WebView errors gracefully.
 */

import { ThemedButton } from '@/src/components';
import { useTheme } from '@/src/context';
import { useCourseStore } from '@/src/stores';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const CourseWebViewScreen = () => {
  const { colors } = useTheme();
  const { courseId, courseTitle } = useLocalSearchParams<{
    courseId: string;
    courseTitle: string;
  }>();

  const courseDetail = useCourseStore((s) => s.courseDetail);
  const loadCourseDetail = useCourseStore((s) => s.loadCourseDetail);

  const webViewRef = useRef<WebView>(null);
  const [webViewError, setWebViewError] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);

  // Load course detail if not already loaded
  useEffect(() => {
    if (!courseDetail && courseId) {
      loadCourseDetail(Number(courseId));
    }
  }, [courseId, courseDetail, loadCourseDetail]);

  const handleBack = useCallback(() => router.back(), []);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'BACK') {
        router.back();
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleWebViewError = useCallback(() => {
    setWebViewError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setWebViewError(false);
    setIsWebViewLoading(true);
    webViewRef.current?.reload();
  }, []);

  /** Sanitize strings for safe HTML injection — prevent XSS */
  const escapeHtml = useCallback((str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  // Generate HTML content for the WebView
  const htmlContent = useMemo(() => {
    const course = courseDetail;
    if (!course) return '';

    const bg = colors.background;
    const text = colors.text;
    const textSec = colors.textSecondary;
    const surface = colors.surface;
    const border = colors.border;
    const primary = colors.primary;

    // Sanitize all user-facing data from API
    const safeTitle = escapeHtml(course.title);
    const safeCategory = escapeHtml(course.category.replace(/-/g, ' '));
    const safeDescription = escapeHtml(course.description);
    const safeInstructorName = escapeHtml(course.instructor.name);
    const safeInstructorEmail = escapeHtml(course.instructor.email);
    const safeInstructorLocation = escapeHtml(course.instructor.location);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${course.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bg};
      color: ${text};
      padding: 20px;
      line-height: 1.6;
    }
    .header { margin-bottom: 24px; }
    .category {
      display: inline-block;
      background: ${primary}20;
      color: ${primary};
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .meta { color: ${textSec}; font-size: 14px; }
    .card {
      background: ${surface};
      border: 1px solid ${border};
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .card h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .card p { color: ${textSec}; font-size: 14px; line-height: 1.7; }
    .instructor {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .instructor img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }
    .instructor-name { font-weight: 600; font-size: 15px; }
    .instructor-location { color: ${textSec}; font-size: 13px; }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .stat-item {
      background: ${surface};
      border: 1px solid ${border};
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .stat-value { font-size: 20px; font-weight: 700; color: ${primary}; }
    .stat-label { font-size: 12px; color: ${textSec}; margin-top: 4px; }
    .img-gallery {
      display: flex;
      overflow-x: auto;
      gap: 10px;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }
    .img-gallery img {
      width: 200px;
      height: 130px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .curriculum {
      list-style: none;
      padding: 0;
    }
    .curriculum li {
      padding: 12px 0;
      border-bottom: 1px solid ${border};
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .curriculum li:last-child { border-bottom: none; }
    .lesson-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${primary}20;
      color: ${primary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="category">${safeCategory}</span>
    <h1>${safeTitle}</h1>
    <p class="meta">by ${safeInstructorName} · ⭐ ${course.rating.toFixed(1)} · ${course.stock} students</p>
  </div>

  <div class="card">
    <h3>About This Course</h3>
    <p>${safeDescription}</p>
  </div>

  <div class="card">
    <h3>Instructor</h3>
    <div class="instructor">
      <img src="${encodeURI(course.instructor.avatar)}" alt="${safeInstructorName}" />
      <div>
        <div class="instructor-name">${safeInstructorName}</div>
        <div class="instructor-location">${safeInstructorLocation}</div>
        <div class="instructor-location">${safeInstructorEmail}</div>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-item">
      <div class="stat-value">⭐ ${course.rating.toFixed(1)}</div>
      <div class="stat-label">Rating</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${course.stock}</div>
      <div class="stat-label">Students</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">$${(course.price * (1 - course.discountPercentage / 100)).toFixed(0)}</div>
      <div class="stat-label">Price</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${course.images.length}</div>
      <div class="stat-label">Resources</div>
    </div>
  </div>

  ${course.images.length > 0 ? `
  <div class="card" style="margin-top: 16px;">
    <h3>Course Preview</h3>
    <div class="img-gallery">
      ${course.images.map((img) => `<img src="${img}" alt="preview" onerror="this.style.display='none'" />`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="card" style="margin-top: 16px;">
    <h3>Course Curriculum</h3>
    <ul class="curriculum">
      <li><span class="lesson-num">1</span> Introduction to ${safeTitle}</li>
      <li><span class="lesson-num">2</span> Getting Started with ${safeCategory}</li>
      <li><span class="lesson-num">3</span> Core Concepts & Fundamentals</li>
      <li><span class="lesson-num">4</span> Hands-On Practice</li>
      <li><span class="lesson-num">5</span> Advanced Techniques by ${safeInstructorName}</li>
      <li><span class="lesson-num">6</span> Final Project & Assessment</li>
    </ul>
  </div>

  <script>
    // Bidirectional communication: WebView → Native
    function sendToNative(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    // Listen for messages from native
    document.addEventListener('message', function(e) {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'THEME_CHANGE') {
          document.body.style.background = data.bg;
          document.body.style.color = data.text;
        }
      } catch {}
    });
  </script>
</body>
</html>`;
  }, [courseDetail, colors, escapeHtml]);

  // WebView error state
  if (webViewError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Ionicons name="globe-outline" size={56} color={colors.textTertiary} />
        <Text className="text-base font-semibold mt-4 text-center" style={{ color: colors.text }}>
          Failed to Load Content
        </Text>
        <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
          There was an issue displaying the course content.
        </Text>
        <View className="flex-row gap-3 mt-4">
          <ThemedButton title="Go Back" onPress={handleBack} variant="outline" />
          <ThemedButton title="Retry" onPress={handleRetry} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 gap-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Pressable onPress={handleBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text
          className="flex-1 text-base font-semibold"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {courseTitle || 'Course Content'}
        </Text>
      </View>

      {/* WebView */}
      {!courseDetail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View className="flex-1">
          {isWebViewLoading && (
            <View className="absolute inset-0 items-center justify-center z-10" style={{ backgroundColor: colors.background }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
                Loading content...
              </Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{
              html: htmlContent,
              headers: {
                'X-App-Theme': colors.background === '#FFFFFF' ? 'light' : 'dark',
                'X-App-Platform': Platform.OS,
                'X-Course-Id': courseId || '',
              },
            }}
            style={{ flex: 1, backgroundColor: colors.background }}
            onMessage={handleMessage}
            onError={handleWebViewError}
            onHttpError={handleWebViewError}
            onLoadEnd={() => setIsWebViewLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit={false}
            originWhitelist={['*']}
            injectedJavaScript={`
              // Send ready signal to native with course metadata
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'READY',
                  courseId: '${courseId || ''}',
                }));
              }
              true;
            `}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default CourseWebViewScreen;
