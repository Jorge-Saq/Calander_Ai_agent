import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export function EventCard({ event, onAccept, onReject, onUpdate, isActive }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  // Update editedEvent when event prop changes
  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  const colorOptions = [
    { id: '5', name: 'Yellow', color: '#FEF3C7', border: '#FDE68A' },
    { id: '10', name: 'Green', color: '#D1FAE5', border: '#A7F3D0' },
    { id: '11', name: 'Red', color: '#FEE2E2', border: '#FECACA' },
    { id: '9', name: 'Blue', color: '#DBEAFE', border: '#BFDBFE' },
    { id: '6', name: 'Orange', color: '#FED7AA', border: '#FDBA74' },
    { id: '3', name: 'Purple', color: '#E9D5FF', border: '#D8B4FE' }
  ];

  const recurrenceOptions = [
    'Does not repeat',
    'Daily',
    'Weekly on Mondays',
    'Weekly on Tuesdays',
    'Weekly on Wednesdays',
    'Weekly on Thursdays',
    'Weekly on Fridays',
    'Bi-weekly',
    'Monthly',
    'Weekly until Dec 30',
    'Custom'
  ];

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleUpdate = (field, value) => {
    const updated = { ...editedEvent, [field]: value };
    
    // If color changes, update both color and colorId
    if (field === 'colorId') {
      const selectedColor = colorOptions.find(c => c.id === value);
      if (selectedColor) {
        updated.color = selectedColor.color;
      }
    }
    
    setEditedEvent(updated);
    onUpdate(updated);
  };

  const selectedColor = colorOptions.find(c => c.id === editedEvent.colorId) || colorOptions[0];

  return (
    <div className="relative">
      {/* Sticky Note Card */}
      <div 
        className="w-[300px] min-h-[360px] rounded-3xl shadow-2xl transform transition-all duration-300"
        style={{
          backgroundColor: selectedColor.color,
          border: `2px solid ${selectedColor.border}`,
          transform: isActive ? 'rotate(0deg)' : 'rotate(-2deg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
        }}
      >
        {/* Card Header - Sticky Note Tear Effect */}
        <div className="absolute top-0 left-0 right-0 h-12 opacity-20"
          style={{
            background: `linear-gradient(to bottom, ${selectedColor.border}, transparent)`
          }}
        />
        
        {/* Card Content */}
        <div className="p-5 pt-7">
          {/* Title */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
              Event Title
            </label>
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              className="w-full bg-transparent border-b-2 border-gray-400/30 focus:border-gray-600 outline-none pb-1.5 text-gray-900 transition-colors text-sm"
            />
          </div>
          
          {/* Date */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
              Date
            </label>
            <div className="text-gray-800 text-sm">
              {formatDate(editedEvent.startTime)}
            </div>
          </div>
          
          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
                Start Time
              </label>
              <input
                type="time"
                value={new Date(editedEvent.startTime).toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(editedEvent.startTime);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  handleUpdate('startTime', newDate.toISOString());
                }}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white/60 border border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
                End Time
              </label>
              <input
                type="time"
                value={new Date(editedEvent.endTime).toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(editedEvent.endTime);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  handleUpdate('endTime', newDate.toISOString());
                }}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white/60 border border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 text-gray-800"
              />
            </div>
          </div>
          
          {/* Color Selector */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.id}
                  onClick={() => handleUpdate('colorId', colorOption.id)}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: colorOption.color,
                    borderColor: editedEvent.colorId === colorOption.id ? '#1f2937' : colorOption.border,
                    borderWidth: editedEvent.colorId === colorOption.id ? '3px' : '2px',
                    boxShadow: editedEvent.colorId === colorOption.id ? '0 0 0 2px white, 0 0 0 4px #1f2937' : 'none'
                  }}
                  title={colorOption.name}
                  type="button"
                />
              ))}
            </div>
          </div>
          
          {/* Recurrence */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wide">
              Recurrence
            </label>
            <select
              value={editedEvent.recurrence}
              onChange={(e) => handleUpdate('recurrence', e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-xl bg-white/60 border border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 text-gray-800 cursor-pointer"
            >
              {recurrenceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          {/* Action Buttons - Inline */}
          {isActive && (
            <div className="flex justify-center gap-3 mt-4 pt-3 border-t border-gray-400/20">
              {/* Reject Button */}
              <button
                onClick={() => onReject(editedEvent)}
                className="w-11 h-11 rounded-full bg-red-500 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                title="Reject"
                type="button"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
              
              {/* Accept Button */}
              <button
                onClick={() => onAccept(editedEvent)}
                className="w-11 h-11 rounded-full bg-green-500 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                title="Accept"
                type="button"
              >
                <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
