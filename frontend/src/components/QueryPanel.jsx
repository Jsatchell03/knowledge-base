import { useState, useRef, useEffect } from 'react';
import { queryAI } from '../api/api';

export default function QueryPanel() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleResponse = async (transcript) => {
    setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
    setIsProcessing(true);
    try {
      const response = await queryAI(transcript);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      speak(response);
    } catch {
      const errorMsg = 'Sorry, something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleResponse(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-900">Ask AI</h2>
        <p className="text-xs text-gray-500 mt-0.5">Tap the mic and ask a question</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isRecording && !isProcessing && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Press the microphone to ask a question
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white ml-6'
                : 'bg-white border border-gray-200 mr-6'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {/* Processing spinner */}
        {isProcessing && (
          <div className="flex items-center gap-2 mr-6 text-sm text-gray-500 px-3 py-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Audio Controls */}
      <div className="p-4 border-t border-gray-200 flex flex-col items-center gap-2">
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-blue-500 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
              <span className="w-0.5 bg-blue-500 rounded-full animate-[soundbar_0.6s_ease-in-out_0.15s_infinite]" style={{ height: '70%' }} />
              <span className="w-0.5 bg-blue-500 rounded-full animate-[soundbar_0.6s_ease-in-out_0.3s_infinite]" style={{ height: '100%' }} />
              <span className="w-0.5 bg-blue-500 rounded-full animate-[soundbar_0.6s_ease-in-out_0.15s_infinite]" style={{ height: '70%' }} />
              <span className="w-0.5 bg-blue-500 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
            </div>
            Speaking...
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200'
              : isProcessing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 shadow-md'
          }`}
        >
          {isRecording ? (
            // Stop icon
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Mic icon
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
              <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <span className="text-xs text-gray-400">
          {isRecording ? 'Listening... tap to stop' : isProcessing ? 'Processing...' : 'Tap to speak'}
        </span>
      </div>
    </aside>
  );
}
