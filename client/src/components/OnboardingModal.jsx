import { useState } from 'react';

export function OnboardingModal({ onComplete }) {
  const [calendarId, setCalendarId] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York');

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (calendarId.trim()) {
      onComplete(calendarId, timezone);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-md" />
      
      {/* Glassmorphism Modal */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-gray-900 mb-2">AI Calendar Agent</h2>
          <p className="text-gray-600 text-sm">
            Initialize your calendar assistant to get started
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calendar ID Input */}
          <div>
            <label htmlFor="calendarId" className="block text-gray-700 mb-2 text-sm">
              Google Calendar ID
            </label>
            <input
              id="calendarId"
              type="text"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually your Gmail address or a custom calendar ID
            </p>
          </div>
          
          {/* Timezone Dropdown */}
          <div>
            <label htmlFor="timezone" className="block text-gray-700 mb-2 text-sm">
              Time Zone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Initialize Agent
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          🔒 Your calendar credentials are stored locally
        </div>
      </div>
    </div>
  );
}
