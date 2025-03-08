import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import axiosInstance from '../../api/axiosInstance';
import { MaterialIcons } from '@expo/vector-icons';

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
        #editor:focus {
          outline: none;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 8px 0;
        }
        a {
          color: #7c3aed;
        }
      </style>
    </head>
    <body>
      <div id="toolbar">
        <button class="toolbar-button" onclick="format('bold')"><b>B</b></button>
        <button class="toolbar-button" onclick="format('italic')"><i>I</i></button>
        <button class="toolbar-button" onclick="format('underline')"><u>U</u></button>
        <button class="toolbar-button" onclick="format('strikeThrough')"><s>S</s></button>
        <button class="toolbar-button" onclick="format('justifyLeft')">⌧</button>
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
        let isTyping = false;
        let typeTimer;
        
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
        
        editor.addEventListener('input', () => {
          if (isTyping) {
            clearTimeout(typeTimer);
          }
          isTyping = true;
          typeTimer = setTimeout(() => {
            isTyping = false;
            updateContent();
          }, 1000);
        });

        editor.addEventListener('blur', updateContent);
        
        editor.addEventListener('paste', (e) => {
          e.preventDefault();
          const text = (e.originalEvent || e).clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        });
        
        document.execCommand('defaultParagraphSeparator', false, 'p');
        
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
              case 'b': format('bold'); e.preventDefault(); break;
              case 'i': format('italic'); e.preventDefault(); break;
              case 'u': format('underline'); e.preventDefault(); break;
              case 'z': 
                if (e.shiftKey) {
                  document.execCommand('redo');
                } else {
                  document.execCommand('undo');
                }
                e.preventDefault();
                break;
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  const fetchAbout = async () => {
    try {
      setLoading(true);
      // Update endpoint to match your API
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
      .replace(/&nbsp;/g, ' ') // Replace HTML spaces with regular spaces
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const countWords = (str) => {
    const text = cleanHtml(str);
    const words = text.split(' ').filter(word => word.length > 0);
    console.log('Word count:', words.length);
    console.log('Text content:', text);
    return words.length;
  };

  const convertHtmlToText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    // Convert line breaks and paragraphs to newlines
    div.innerHTML = div.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    div.innerHTML = div.innerHTML.replace(/<\/p>/gi, '\n\n');
    // Get text content and normalize spaces
    return div.textContent
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSave = async () => {
    try {
      const wordCount = countWords(about);
      console.log('Attempting to save content with word count:', wordCount);

      if (wordCount < 50) {
        alert(`Please add more content. Current word count: ${wordCount}. Minimum required: 50 words.`);
        return;
      }

      setSaving(true);
      
      // Inject script to get plain text from HTML
      webViewRef.current.injectJavaScript(`
        (function() {
          const div = document.createElement('div');
          div.innerHTML = document.getElementById('editor').innerHTML;
          const text = div.textContent.replace(/\\s+/g, ' ').trim();
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'saveContent', text }));
          true;
        })();
      `);
    } catch (error) {
      console.error('Save error:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Failed to save content');
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const onMessage = async (event) => {
    const data = event.nativeEvent.data;
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'saveContent') {
        // Send the plain text to the API
        const response = await axiosInstance.patch('/about-us', parsedData.text, {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
        
        if (response.data && response.data.success) {
          alert('Content saved successfully!');
        } else {
          throw new Error(response.data?.message || 'Save operation failed');
        }
        setSaving(false);
      } else {
        // Regular content update
        setAbout(data);
      }
    } catch (e) {
      // If JSON.parse fails, it's regular content update
      setAbout(data);
    }
  };

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
            injectedJavaScript={`
              window.onload = function() {
                document.getElementById('editor').focus();
              }
            `}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Inbox;