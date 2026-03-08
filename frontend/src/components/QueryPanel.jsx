import { useState } from 'react';

const SAMPLE_RESPONSES = [
  'Based on your notes, the project uses Google Cloud Platform for hosting and Node.js for the backend. The team agreed on this during the March 7 sync meeting.',
  'Your knowledge base contains 3 notes and 3 files. The notes cover getting started, project ideas, and meeting notes.',
  'According to your meeting notes, the action items include finalizing the API design and setting up the CI/CD pipeline. Creating the project repo is already complete.',
];

export default function QueryPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const response = SAMPLE_RESPONSES[messages.filter((m) => m.role === 'assistant').length % SAMPLE_RESPONSES.length];
    const assistantMessage = { role: 'assistant', content: response };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-900">Ask AI</h2>
        <p className="text-xs text-gray-500 mt-0.5">Ask questions about your notes & files</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            Ask a question to get started
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
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}
