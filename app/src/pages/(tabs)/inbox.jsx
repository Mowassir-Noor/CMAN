import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import axiosInstance from '../../api/axiosInstance';

const Inbox = () => {
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef(null);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        body {
          display: flex;
          flex-direction: column;
          font-family: -apple-system;
          position: fixed;
          width: 100%;
          -webkit-user-select: none;
        }
        #toolbar {
          flex: none;
          padding: 8px;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }
        #editor {
          flex: 1;
          padding: 16px;
          font-size: 16px;
          min-height: 200px;
          overflow-y: auto;
          -webkit-user-select: text;
        }
        button {
          padding: 8px;
          margin: 0 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div id="toolbar">
        <button onclick="format('bold')">B</button>
        <button onclick="format('italic')">I</button>
        <button onclick="format('underline')">U</button>
        <button onclick="format('justifyLeft')">←</button>
        <button onclick="format('justifyCenter')">≡</button>
        <button onclick="format('justifyRight')">→</button>
      </div>
      <div id="editor" contenteditable="true"></div>
      <script>
        const editor = document.getElementById('editor');
        editor.innerHTML = '${about?.replace(/'/g, "\\'")}';
        
        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        });

        // Prevent zoom gestures
        document.addEventListener('gesturestart', (e) => {
          e.preventDefault();
        });
        
        editor.addEventListener('input', () => {
          window.ReactNativeWebView.postMessage(editor.innerHTML);
        });
        
        editor.addEventListener('blur', () => {
          setTimeout(() => editor.focus(), 0);
        });
        
        function format(cmd) {
          document.execCommand(cmd, false, null);
          editor.focus();
        }
        
        setTimeout(() => editor.focus(), 100);
      </script>
    </body>
    </html>
  `;

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/about-us');
      if (response.data && response.data.data) {
        setAbout(response.data.data.content || '');
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const cleanHtml = (html) => {
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const countWords = (str) => {
    const text = cleanHtml(str);
    const words = text.split(' ').filter(word => word.length > 0);
    return words.length;
  };

  
  const handleSave = async () => {
    try {
      const wordCount = countWords(about);
      if (wordCount < 50) {
        alert(`Please add more content. Current word count: ${wordCount}. Minimum required: 50 words.`);
        return;
      }

      setSaving(true);
      const response = await axiosInstance.patch('/about-us', about, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (response.data && response.data.success) {
        alert('Content saved successfully!');
      } else {
        throw new Error(response.data?.message || 'Save operation failed');
      }
    } catch (error) {
      console.error('Save error:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };


  const onMessage = (event) => {
    setAbout(event.nativeEvent.data);
  };


  useEffect(() => {
    fetchAbout();
  }, []);

  useEffect(() => {
    if (!loading && about) {
      setWebViewKey(k => k + 1);
    }
  }, [about, loading]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-4 py-2">
          <View>
            <Text className="text-2xl font-bold text-white">About Us Editor</Text>
            <Text className="text-gray-400 text-sm">
              Words: {countWords(about)} (minimum: 50)
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${saving ? 'bg-gray-600' : 'bg-purple-600'}`}
          >
            <Text className="text-white">{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" />
        ) : error ? (
          <Text className="text-red-500 px-4">{error}</Text>
        ) : (
          <WebView
            key={webViewKey}
            source={{ html }}
            onMessage={onMessage}
            className="flex-1 bg-white"
            scrollEnabled={false}
            keyboardDisplayRequiresUserAction={false}
            automaticallyAdjustContentInsets={false}
            hideKeyboardAccessoryView={true}
            startInLoadingState={true}
            bounces={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Inbox;