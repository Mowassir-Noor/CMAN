import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import axiosInstance from '../../api/axiosInstance';

const Inbox = () => {
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const webViewRef = useRef(null);

  const editorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto;
        }
        #toolbar {
          padding: 8px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .toolbar-button {
          padding: 6px 12px;
          margin: 0 2px;
          background: white;
          border: 1px solid #ced4da;
          border-radius: 4px;
          color: #495057;
          font-size: 14px;
          cursor: pointer;
          min-width: 35px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .toolbar-button:active {
          background: #e9ecef;
        }
        #editor {
          min-height: 300px;
          padding: 16px;
          line-height: 1.6;
          color: #212529;
        }
      </style>
    </head>
    <body>
      <div id="toolbar">
        <button class="toolbar-button" onclick="format('bold')"><b>B</b></button>
        <button class="toolbar-button" onclick="format('italic')"><i>I</i></button>
        <button class="toolbar-button" onclick="format('underline')"><u>U</u></button>
        <button class="toolbar-button" onclick="format('strikeThrough')"><s>S</s></button>
        <button class="toolbar-button" onclick="format('justifyLeft')">←</button>
        <button class="toolbar-button" onclick="format('justifyCenter')">≡</button>
        <button class="toolbar-button" onclick="format('justifyRight')">⌦</button>
        <button class="toolbar-button" onclick="format('insertUnorderedList')">•</button>
        <button class="toolbar-button" onclick="format('insertOrderedList')">1.</button>
        <button class="toolbar-button" onclick="addLink()">🔗</button>
        <button class="toolbar-button" onclick="addImage()">📷</button>
        <button class="toolbar-button" onclick="document.execCommand('undo')">↩</button>
        <button class="toolbar-button" onclick="document.execCommand('redo')">↪</button>
      </div>
      <div id="editor" contenteditable="true"></div>
      <script>
        const editor = document.getElementById('editor');
        editor.innerHTML = \`${about}\`;
        
        let lastHtml = editor.innerHTML;
        
        function format(command, value = null) {
          document.execCommand(command, false, value);
          editor.focus();
          updateContent();
        }
        
        function addLink() {
          const selection = document.getSelection();
          const url = prompt('Enter URL:', 'https://');
          if (url) {
            if (selection.toString().length === 0) {
              const linkText = prompt('Enter link text:', '');
              if (linkText) {
                document.execCommand('insertHTML', false, 
                  '<a href="' + url + '" target="_blank">' + linkText + '</a>');
              }
            } else {
              format('createLink', url);
            }
          }
        }
        
        function addImage() {
          const url = prompt('Enter image URL:', 'https://');
          if (url) {
            format('insertImage', url);
          }
        }
        
        function updateContent() {
          const content = editor.innerHTML;
          if (content !== lastHtml) {
            lastHtml = content;
            window.ReactNativeWebView.postMessage(content);
          }
        }
        
        editor.addEventListener('input', updateContent);
        editor.addEventListener('blur', updateContent);
        
        document.execCommand('defaultParagraphSeparator', false, 'p');
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
            ref={webViewRef}
            source={{ html: editorHTML }}
            onMessage={onMessage}
            className="flex-1 bg-white"
            scrollEnabled={true}
            androidLayerType={Platform.OS === 'android' ? 'software' : undefined}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Inbox;