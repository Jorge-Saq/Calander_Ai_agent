/**
 * HANDLER: Receives JSON payload from Node.js backend
 * Maps actions to the Calendar Service methods.
 * 
 * Supported actions:
 * - createEvent: Create a timed event
 * - createAllDayEvent: Create an all-day event
 * - createEventSeries: Create a recurring event
 * - getEventsForDay: Get events for a specific day
 * - updateEvent: Update an existing event
 * - deleteEvent: Delete an event
 * - addGuests: Add guests to an event
 * - setEventColor: Set event color
 * - addReminders: Add reminders to an event
 */
function doPost(e) {
  // If e.postData is undefined, it might be a test run from the editor.
  if (!e || !e.postData) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No post data received' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = JSON.parse(e.postData.contents);
  const calendarId = data.calendarId;
  const action = data.action;
  const params = data.params;

  let result = {};

  try {
    // Get the Calendar Object using getCalendarById
    const calendar = CalendarApp.getCalendarById(calendarId);
    
    if (!calendar) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: 'Calendar not found. Check the ID and permissions.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Switch based on the AI's requested action
    switch (action) {
      case 'createEvent':
        // Create a timed event with optional advanced features
        const options = {};
        if (params.description) options.description = params.description;
        if (params.location) options.location = params.location;
        if (params.guests && params.guests.length > 0) options.guests = params.guests;
        
        const event = calendar.createEvent(
          params.title,
          new Date(params.startTime),
          new Date(params.endTime),
          options
        );
        
        // Apply additional settings
        if (params.color) {
          event.setColor(params.color);
        }
        if (params.reminders) {
          event.removeAllReminders();
          if (params.reminders.email) {
            params.reminders.email.forEach(mins => event.addEmailReminder(mins));
          }
          if (params.reminders.popup) {
            params.reminders.popup.forEach(mins => event.addPopupReminder(mins));
          }
        }
        
        result = { status: 'success', eventId: event.getId(), title: params.title };
        break;

      case 'createAllDayEvent':
        // Create an all-day event
        const allDayOptions = {};
        if (params.description) allDayOptions.description = params.description;
        if (params.location) allDayOptions.location = params.location;
        
        const allDayEvent = params.endDate 
          ? calendar.createAllDayEvent(params.title, new Date(params.date), new Date(params.endDate), allDayOptions)
          : calendar.createAllDayEvent(params.title, new Date(params.date), allDayOptions);
        
        if (params.color) {
          allDayEvent.setColor(params.color);
        }
        
        result = { status: 'success', eventId: allDayEvent.getId(), title: params.title };
        break;

      case 'createEventSeries':
        // Create a recurring event
        const recurrence = CalendarApp.newRecurrence();
        
        // Parse recurrence pattern
        if (params.recurrence.type === 'daily') {
          const rule = recurrence.addDailyRule();
          if (params.recurrence.interval) rule.interval(params.recurrence.interval);
          if (params.recurrence.until) rule.until(new Date(params.recurrence.until));
          if (params.recurrence.times) rule.times(params.recurrence.times);
        } else if (params.recurrence.type === 'weekly') {
          const rule = recurrence.addWeeklyRule();
          if (params.recurrence.interval) rule.interval(params.recurrence.interval);
          if (params.recurrence.days && params.recurrence.days.length > 0) {
            const weekdays = params.recurrence.days.map(day => CalendarApp.Weekday[day.toUpperCase()]);
            rule.onlyOnWeekdays(weekdays);
          }
          if (params.recurrence.until) rule.until(new Date(params.recurrence.until));
          if (params.recurrence.times) rule.times(params.recurrence.times);
        } else if (params.recurrence.type === 'monthly') {
          const rule = recurrence.addMonthlyRule();
          if (params.recurrence.interval) rule.interval(params.recurrence.interval);
          if (params.recurrence.until) rule.until(new Date(params.recurrence.until));
          if (params.recurrence.times) rule.times(params.recurrence.times);
        }
        
        const series = calendar.createEventSeries(
          params.title,
          new Date(params.startTime),
          new Date(params.endTime),
          recurrence
        );
        
        if (params.description) series.setDescription(params.description);
        if (params.location) series.setLocation(params.location);
        
        result = { status: 'success', seriesId: series.getId(), title: params.title, recurrence: params.recurrence.type };
        break;

      case 'getEventsForDay':
        // Get events for a specific day
        const events = calendar.getEventsForDay(new Date(params.date));
        const eventSummaries = events.map(e => ({
          title: e.getTitle(),
          id: e.getId(),
          startTime: e.getStartTime().toISOString(),
          endTime: e.getEndTime().toISOString(),
          location: e.getLocation(),
          description: e.getDescription()
        }));
        result = { status: 'success', data: eventSummaries, count: eventSummaries.length };
        break;

      case 'updateEvent':
        // Update an existing event
        const existingEvent = calendar.getEventById(params.eventId);
        if (!existingEvent) {
          result = { status: 'error', message: 'Event not found' };
        } else {
          if (params.title) existingEvent.setTitle(params.title);
          if (params.startTime && params.endTime) {
            existingEvent.setTime(new Date(params.startTime), new Date(params.endTime));
          }
          if (params.description) existingEvent.setDescription(params.description);
          if (params.location) existingEvent.setLocation(params.location);
          if (params.color) existingEvent.setColor(params.color);
          
          result = { status: 'success', eventId: existingEvent.getId() };
        }
        break;

      case 'deleteEvent':
        // Delete an event
        const eventToDelete = calendar.getEventById(params.eventId);
        if (!eventToDelete) {
          result = { status: 'error', message: 'Event not found' };
        } else {
          eventToDelete.deleteEvent();
          result = { status: 'success', message: 'Event deleted' };
        }
        break;

      default:
        result = { status: 'error', message: 'Unknown action: ' + action };
    }

  } catch (err) {
    result = { status: 'error', message: err.toString(), stack: err.stack };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
