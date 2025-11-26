import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OnboardingModal } from './components/OnboardingModal';
import { EventCard } from './components/EventCard';
import { ChatBar } from './components/ChatBar';
import { ChatHistory } from './components/ChatHistory';

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [calendarId, setCalendarId] = useState('');
  const [timezone, setTimezone] = useState('');
  const [eventDeck, setEventDeck] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);

  useEffect(() => {
    // Check localStorage for existing configuration
    const savedCalendarId = localStorage.getItem('calendarId');
    const savedTimezone = localStorage.getItem('timezone');
    
    if (savedCalendarId && savedTimezone) {
      setCalendarId(savedCalendarId);
      setTimezone(savedTimezone);
      setIsOnboarded(true);
      
      // Add welcome message
      setChatMessages([{
        id: '1',
        type: 'system',
        content: `Welcome back! Connected to calendar: ${savedCalendarId}`,
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleOnboardingComplete = (calId, tz) => {
    localStorage.setItem('calendarId', calId);
    localStorage.setItem('timezone', tz);
    setCalendarId(calId);
    setTimezone(tz);
    setIsOnboarded(true);
    
    setChatMessages([{
      id: Date.now().toString(),
      type: 'system',
      content: `✨ Agent initialized! Connected to calendar: ${calId}`,
      timestamp: new Date()
    }]);
  };

  // Helper to convert file to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // Map Google Calendar color names to our color IDs
  const mapColorToId = (colorName) => {
    const colorMap = {
      'YELLOW': '5',
      'GREEN': '10',
      'RED': '11',
      'BLUE': '9',
      'ORANGE': '6',
      'PURPLE': '3',
      'PALE_BLUE': '9',
      'PALE_GREEN': '10',
      'PALE_RED': '11',
      'MAUVE': '3',
      'CYAN': '9',
      'GRAY': '5'
    };
    return colorMap[colorName] || '5';
  };

  const getColorHex = (colorId) => {
    const colorMap = {
      '5': '#FEF3C7',
      '10': '#D1FAE5',
      '11': '#FEE2E2',
      '9': '#DBEAFE',
      '6': '#FED7AA',
      '3': '#E9D5FF'
    };
    return colorMap[colorId] || '#FEF3C7';
  };

  // Parse recurrence from backend format
  const parseRecurrence = (recurrence, startTime) => {
    if (!recurrence || !recurrence.type) return 'Does not repeat';
    if (recurrence.type === 'daily') {
      if (recurrence.until) {
        return `Daily until ${new Date(recurrence.until).toLocaleDateString()}`;
      }
      if (recurrence.times) {
        return `Daily for ${recurrence.times} times`;
      }
      return 'Daily';
    }
    if (recurrence.type === 'weekly') {
      if (recurrence.days && recurrence.days.length > 0) {
        const dayName = recurrence.days[0];
        const dayNames = {
          'MONDAY': 'Monday',
          'TUESDAY': 'Tuesday',
          'WEDNESDAY': 'Wednesday',
          'THURSDAY': 'Thursday',
          'FRIDAY': 'Friday',
          'SATURDAY': 'Saturday',
          'SUNDAY': 'Sunday'
        };
        const day = dayNames[dayName] || 'Monday';
        if (recurrence.until) {
          return `Weekly on ${day} until ${new Date(recurrence.until).toLocaleDateString()}`;
        }
        return `Weekly on ${day}`;
      }
      // Fallback: use startTime to determine day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[new Date(startTime || Date.now()).getDay()];
      return `Weekly on ${day}`;
    }
    if (recurrence.type === 'monthly') return 'Monthly';
    return 'Does not repeat';
  };

  // Convert backend action to EventProposal
  const actionToEventProposal = (action, index) => {
    const params = action.params || {};
    const startTime = params.startTime ? new Date(params.startTime) : new Date();
    const endTime = params.endTime ? new Date(params.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    const colorId = params.color ? mapColorToId(params.color) : '5';
    
    return {
      id: `${Date.now()}-${index}`,
      title: params.title || 'Untitled Event',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      color: getColorHex(colorId),
      colorId: colorId,
      recurrence: parseRecurrence(params.recurrence, params.startTime),
      description: params.description || '',
      action: action.action,
      originalParams: params
    };
  };

  const handleSendMessage = async (message, image) => {
    if (!calendarId) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: 'Please complete onboarding first.',
        timestamp: new Date()
      }]);
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: image ? `📎 ${image.name}` : message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      if (image) {
        // Handle image upload
        const base64 = await toBase64(image);
        const instructions = message || "Extract these events for my calendar.";
        
        const res = await axios.post('http://localhost:3001/api/upload', {
          imageBase64: base64,
          calendarId: calendarId,
          timezone: timezone,
          instructions: instructions
        });

        if (res.data.success) {
          // Parse AI response to create event proposals
          // The backend already processed the actions, but we need to extract them from results
          // For now, we'll show a success message - in a full implementation, 
          // we'd need the backend to return the parsed actions before execution
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'success',
            content: `✅ Successfully extracted and processed ${res.data.count} event(s) from image.`,
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Failed to process image');
        }
      } else {
        // Handle text message
        const res = await axios.post('http://localhost:3001/api/chat', {
          message: message,
          calendarId: calendarId,
          timezone: timezone
        });

        if (res.data.success) {
          // Parse AI response - we need to get the actions from somewhere
          // The backend executes actions immediately, but for the card-based UI,
          // we want to show proposals first. Let's make a separate call or modify the flow
          
          // For now, let's call AI separately to get proposals without executing
          // Actually, the current backend executes immediately. We'll need to either:
          // 1. Modify backend to have a "propose" endpoint that returns actions without executing
          // 2. Parse from the results (but they're already executed)
          
          // Let's show the results and inform user events were created
          const successCount = res.data.results.filter(r => r.status !== 'error').length;
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'success',
            content: `✅ Successfully processed ${successCount} event(s).`,
            timestamp: new Date()
          }]);

          // If we want to show event cards instead of auto-creating,
          // we would parse res.data here and create EventProposals
          // For now, keeping the original behavior of immediate creation
        } else {
          throw new Error(res.data.error || 'Failed to process request');
        }
      }
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `Error: ${error.response?.data?.error || error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Call backend AI to get proposed actions (without executing)
  const getAIProposals = async (message, timezone) => {
    try {
      // We need to call the AI endpoint - let's use the chat endpoint but parse response
      // For now, we'll create a helper that calls AI directly or use a workaround
      // The backend's callAI function is internal, so we'll need to either:
      // 1. Add a new /api/propose endpoint (future enhancement)
      // 2. Parse the AI response format ourselves
      // For MVP, let's use a simpler approach - call the backend's AI parsing logic
      
      // Since we can't easily access the AI directly, let's use the message parsing approach
      // In production, you'd add an endpoint like POST /api/propose that returns actions without executing
      return null; // Will use parseSimpleMessageToProposal as fallback
    } catch (error) {
      console.error('Error getting AI proposals:', error);
      return null;
    }
  };

  // Parse message to create event proposals (for card-based flow)
  const handleSendMessageWithProposals = async (message, image) => {
    if (!calendarId) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: 'Please complete onboarding first.',
        timestamp: new Date()
      }]);
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: image ? `📎 ${image.name}` : message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: '📝 Processing your request...',
        timestamp: new Date()
      }]);

      let base64 = null;
      let instructions = message;

      if (image) {
        base64 = await toBase64(image);
        instructions = message || "Extract these events for my calendar.";
      }

      // Call backend to get AI proposals
      const res = await axios.post('http://localhost:3001/api/propose', {
        message: message,
        timezone: timezone,
        imageBase64: base64,
        instructions: instructions
      });

      if (res.data.success && res.data.actions && res.data.actions.length > 0) {
        // Convert actions to event proposals
        const proposals = res.data.actions.map((action, index) => 
          actionToEventProposal(action, index)
        );
        
        // Add proposals to event deck
        setEventDeck(prev => [...prev, ...proposals]);
        
        if (proposals.length === 1) {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'system',
            content: `📝 I've drafted "${proposals[0].title}" for you. Please review the card above and accept or reject it.`,
            timestamp: new Date()
          }]);
        } else {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'system',
            content: `📝 I've drafted ${proposals.length} events for you. Please review the cards above.`,
            timestamp: new Date()
          }]);
        }
      } else {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: 'I couldn\'t understand that request. Please try a clearer format like "Meeting tomorrow at 2pm"',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      let errorMessage = error.response?.data?.error || error.message;
      
      // Provide helpful messages for common configuration errors
      if (errorMessage.includes('APPS_SCRIPT_URL') || errorMessage.includes('Invalid URL') || error.response?.status === 500) {
        errorMessage = `⚠️ Server Configuration Error: ${errorMessage}\n\nPlease check:\n1. Create a .env file in Calander_Ai_agent/server/\n2. Set APPS_SCRIPT_URL with your Google Apps Script Web App URL\n3. Set OPENAI_API_KEY with your OpenAI API key\n4. Restart the server after updating .env`;
      }
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple message parser for demo (replace with actual AI integration)
  const parseSimpleMessageToProposal = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Detect color
    let colorId = '5';
    if (lowerMessage.includes('green')) colorId = '10';
    else if (lowerMessage.includes('red')) colorId = '11';
    else if (lowerMessage.includes('blue')) colorId = '9';
    
    // Detect recurrence
    let recurrence = 'Does not repeat';
    if (lowerMessage.includes('weekly') || lowerMessage.includes('every week')) {
      recurrence = 'Weekly on Mondays';
    } else if (lowerMessage.includes('daily')) {
      recurrence = 'Daily';
    }
    
    // Extract title
    let title = 'New Event';
    if (lowerMessage.includes('meeting')) {
      const match = message.match(/(.+?)\s+meeting/i);
      title = match ? `${match[1]} Meeting` : 'Team Meeting';
    }
    
    // Mock times (tomorrow at 2pm)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000);
    
    return {
      id: Date.now().toString(),
      title,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      color: getColorHex(colorId),
      colorId,
      recurrence,
      description: message
    };
  };

  const handleAcceptEvent = (event) => {
    setPendingEvent(event);
    setShowConfirmDialog(true);
  };

  const confirmAcceptEvent = async () => {
    if (!pendingEvent) return;

    const event = pendingEvent;
    setShowConfirmDialog(false);
    
    // Remove from deck immediately for better UX
    setEventDeck(prev => prev.filter(e => e.id !== event.id));
    
    setIsProcessing(true);
    
    try {
      // Convert EventProposal to backend action format
      const action = event.action || 'createEvent';
      const params = {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        color: getColorNameFromId(event.colorId),
        description: event.description || ''
      };

      // Handle recurrence if needed - use originalParams if available
      if (event.originalParams && event.originalParams.recurrence) {
        params.recurrence = event.originalParams.recurrence;
        if (params.recurrence.type) {
          // Action should be createEventSeries for recurring events
          if (action === 'createEvent') {
            params.recurrence = event.originalParams.recurrence;
          }
        }
      } else if (event.recurrence && event.recurrence !== 'Does not repeat') {
        // Parse recurrence from string (fallback)
        if (event.recurrence.includes('Weekly')) {
          const dayMatch = event.recurrence.match(/Weekly on (\w+)/);
          const dayName = dayMatch ? dayMatch[1].toUpperCase() : 'MONDAY';
          const dayMap = {
            'MONDAY': 'MONDAY',
            'TUESDAY': 'TUESDAY',
            'WEDNESDAY': 'WEDNESDAY',
            'THURSDAY': 'THURSDAY',
            'FRIDAY': 'FRIDAY',
            'SATURDAY': 'SATURDAY',
            'SUNDAY': 'SUNDAY'
          };
          
          params.recurrence = {
            type: 'weekly',
            days: [dayMap[dayName] || 'MONDAY'],
            interval: 1
          };
        } else if (event.recurrence === 'Daily') {
          params.recurrence = {
            type: 'daily',
            interval: 1
          };
        }
      }

      // Use the new create-event endpoint
      const finalAction = (params.recurrence && params.recurrence.type) ? 'createEventSeries' : action;
      
      const res = await axios.post('http://localhost:3001/api/create-event', {
        calendarId: calendarId,
        action: finalAction,
        params: params
      });

      if (res.data.success) {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'success',
          content: `✅ Success: "${event.title}" added to ${calendarId}`,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(res.data.error || 'Failed to create event');
      }
    } catch (error) {
      let errorMessage = error.response?.data?.error || error.message;
      
      // Provide helpful messages for common configuration errors
      if (errorMessage.includes('APPS_SCRIPT_URL') || errorMessage.includes('Invalid URL')) {
        errorMessage = `⚠️ Server Configuration Error: ${errorMessage}\n\nPlease check:\n1. Create a .env file in the server directory\n2. Set APPS_SCRIPT_URL with your Google Apps Script Web App URL\n3. See README.md for setup instructions`;
      }
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `Error creating event: ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
      setPendingEvent(null);
    }
  };

  const getColorNameFromId = (colorId) => {
    const colorMap = {
      '5': 'YELLOW',
      '10': 'GREEN',
      '11': 'RED',
      '9': 'BLUE',
      '6': 'ORANGE',
      '3': 'PURPLE'
    };
    return colorMap[colorId] || 'YELLOW';
  };

  const handleRejectEvent = (event) => {
    setEventDeck(prev => prev.filter(e => e.id !== event.id));
    
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content: `🗑️ Discarded "${event.title}"`,
      timestamp: new Date()
    }]);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEventDeck(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex">
      {/* Dot grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Onboarding Modal */}
      {!isOnboarded && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      
      {/* Main Workspace */}
      {isOnboarded && (
        <>
          {/* Main Content Area - Left Side */}
          <div className="flex-1 flex items-center justify-center pb-40 pl-8" style={{ marginRight: '384px' }}>
            {/* Event Deck - Center Stage */}
            {eventDeck.length > 0 ? (
              <div className="relative" style={{ width: '300px', height: '400px' }}>
                {/* Show only the top 3 cards with stacked effect */}
                {eventDeck.slice(0, 3).reverse().map((event, index) => {
                  const stackIndex = eventDeck.length - 1 - index;
                  const isTop = stackIndex === eventDeck.length - 1;
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translateY(${(2 - index) * -8}px) translateX(${(2 - index) * -4}px) rotate(${(2 - index) * -1}deg)`,
                        zIndex: stackIndex,
                        opacity: isTop ? 1 : 0.6
                      }}
                    >
                      <EventCard
                        event={event}
                        onAccept={handleAcceptEvent}
                        onReject={handleRejectEvent}
                        onUpdate={handleUpdateEvent}
                        isActive={isTop}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <p className="text-gray-500">No events to review</p>
                <p className="text-gray-400 text-sm mt-2">
                  Use the chat below to schedule something!
                </p>
              </div>
            )}
          </div>
          
          {/* Activity Log - Right Sidebar */}
          <ChatHistory messages={chatMessages} />
          
          {/* Bottom Chat Bar */}
          <ChatBar 
            onSend={handleSendMessageWithProposals}
            isProcessing={isProcessing}
          />
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-md" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Event Creation</h3>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong> {pendingEvent.title}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Date:</strong> {new Date(pendingEvent.startTime).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-6">
              <strong>Time:</strong> {new Date(pendingEvent.startTime).toLocaleTimeString()} - {new Date(pendingEvent.endTime).toLocaleTimeString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAcceptEvent}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;