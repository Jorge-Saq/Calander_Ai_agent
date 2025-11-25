import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Upload, Calendar, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

function App() {
    const [calendarId, setCalendarId] = useState('');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [input, setInput] = useState('');
    const [imageInstructions, setImageInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [logs]);

    // Helper to convert file to Base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const addLog = (type, message, details = null) => {
        setLogs(prev => [...prev, { type, message, details, timestamp: new Date() }]);
    };

    const handleChat = async () => {
        if (!input.trim()) return;
        if (!calendarId) {
            addLog('error', "Please enter your Google Calendar ID first.");
            return;
        }

        setLoading(true);
        const userMessage = input;
        setInput('');
        addLog('user', userMessage);

        try {
            const res = await axios.post('http://localhost:3001/api/chat', {
                message: userMessage,
                calendarId: calendarId,
                timezone: timezone
            });

            if (res.data.success) {
                const count = res.data.results.length;
                addLog('success', `Processed ${count} action${count !== 1 ? 's' : ''}.`, res.data.results);
            } else {
                addLog('error', "Failed to process request.", res.data);
            }
        } catch (e) {
            addLog('error', `Error: ${e.response?.data?.error || e.message}`);
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!calendarId) {
            addLog('error', "Please enter your Google Calendar ID first.");
            return;
        }

        setLoading(true);
        const uploadMessage = imageInstructions
            ? `Uploading image: ${file.name} with instructions: "${imageInstructions}"`
            : `Uploading image: ${file.name}`;
        addLog('user', uploadMessage);

        try {
            const base64 = await toBase64(file);
            const res = await axios.post('http://localhost:3001/api/upload', {
                imageBase64: base64,
                calendarId: calendarId,
                timezone: timezone,
                instructions: imageInstructions || "Extract these events for my calendar."
            });

            if (res.data.success) {
                addLog('success', `Successfully extracted and created ${res.data.count} events.`, res.data.results);
                setImageInstructions(''); // Clear instructions after successful upload
            } else {
                addLog('error', "Failed to process image.", res.data);
            }
        } catch (e) {
            addLog('error', `Error: ${e.response?.data?.error || e.message}`);
        }
        setLoading(false);
        // Reset file input
        e.target.value = null;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Header */}
                <header className="flex items-center space-x-4 py-6 border-b border-slate-800 animate-fade-in">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Calendar className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            AI Calendar Agent
                        </h1>
                        <p className="text-slate-400">Your intelligent scheduling assistant</p>
                    </div>
                </header>

                {/* Configuration */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Google Calendar ID
                            </label>
                            <input
                                type="text"
                                value={calendarId}
                                onChange={(e) => setCalendarId(e.target.value)}
                                placeholder="e.g., your.email@gmail.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Timezone
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            >
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="America/Anchorage">Alaska Time (AKT)</option>
                                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                                <option value="Europe/London">London (GMT/BST)</option>
                                <option value="Europe/Paris">Paris (CET/CEST)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Asia/Shanghai">Shanghai (CST)</option>
                                <option value="Asia/Dubai">Dubai (GST)</option>
                                <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                            </select>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                        Ensure your Google Apps Script is deployed and has permission to access this calendar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chat Interface */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-slide-up flex flex-col h-[400px]" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                            <Send className="w-5 h-5 mr-2 text-indigo-400" />
                            Chat to Schedule
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {logs.length === 0 && (
                                <div className="text-center text-slate-600 mt-10">
                                    <p>No activity yet.</p>
                                    <p className="text-sm">Try "Schedule a meeting with Sam tomorrow at 2pm"</p>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${log.type === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : log.type === 'error'
                                            ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-bl-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                        }`}>
                                        <div className="flex items-start">
                                            {log.type === 'success' && <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 shrink-0" />}
                                            {log.type === 'error' && <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-red-400 shrink-0" />}
                                            <div>
                                                <p>{log.message}</p>
                                                {log.details && (
                                                    <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto max-w-full">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[10px] opacity-50 mt-1 text-right">
                                            {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleChat();
                                    }
                                }}
                                placeholder="Type your request..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-14 custom-scrollbar"
                            />
                            <button
                                onClick={handleChat}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Upload Interface */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2 text-purple-400" />
                            Upload Schedule
                        </h3>

                        {/* Instructions Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Additional Instructions (Optional)
                            </label>
                            <input
                                type="text"
                                value={imageInstructions}
                                onChange={(e) => setImageInstructions(e.target.value)}
                                placeholder="e.g., 'Make these recurring every week' or 'Make Math class blue'"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                disabled={loading}
                            />
                            <p className="mt-1.5 text-xs text-slate-500">
                                Add custom instructions for how to process the schedule (recurring events, colors, specific days, etc.)
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group cursor-pointer relative">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={loading}
                            />
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-slate-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                            {loading && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                                        <span className="text-sm text-indigo-300">Analyzing image...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">How it works</h4>
                            <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
                                <li>Take a photo of a flyer, schedule, or syllabus.</li>
                                <li>Upload it here.</li>
                                <li>AI extracts dates and times automatically.</li>
                                <li>Events are added to your Google Calendar.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;
