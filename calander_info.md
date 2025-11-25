# Google Apps Script Calendar Service API Reference

[cite_start]**Description:** This service allows a script to access and modify the user's Google Calendar, including additional calendars that the user is subscribed to[cite: 5].

---

## 1. Class: CalendarApp
[cite_start]**Description:** The main entry point to read and update the user's Google Calendar[cite: 7].

### Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `createAllDayEvent(title, date)` | `CalendarEvent` | [cite_start]Creates a new all-day event[cite: 13]. |
| `createAllDayEvent(title, startDate, endDate)` | `CalendarEvent` | [cite_start]Creates a new all-day event spanning multiple days[cite: 13]. |
| `createAllDayEvent(title, date, options)` | `CalendarEvent` | [cite_start]Creates a new all-day event with advanced options[cite: 13]. |
| `createAllDayEventSeries(title, startDate, recurrence)` | `CalendarEventSeries` | [cite_start]Creates a new recurring all-day event series[cite: 13, 48]. |
| `createCalendar(name)` | `Calendar` | [cite_start]Creates a new calendar owned by the user[cite: 48]. |
| `createEvent(title, startTime, endTime)` | `CalendarEvent` | [cite_start]Creates a new event[cite: 48]. |
| `createEvent(title, startTime, endTime, options)` | `CalendarEvent` | [cite_start]Creates a new event with advanced options[cite: 48]. |
| `createEventFromDescription(description)` | `CalendarEvent` | [cite_start]Creates an event based on a free-text description string[cite: 48]. |
| `createEventSeries(title, startTime, endTime, recurrence)` | `CalendarEventSeries` | [cite_start]Creates a new recurring event series[cite: 48]. |
| `getAllCalendars()` | `Calendar[]` | [cite_start]Gets all calendars the user owns or is subscribed to[cite: 53]. |
| `getAllOwnedCalendars()` | `Calendar[]` | [cite_start]Gets all calendars the user owns[cite: 53]. |
| `getCalendarById(id)` | `Calendar` | [cite_start]Gets the calendar with the given ID[cite: 53]. |
| `getCalendarsByName(name)` | `Calendar[]` | [cite_start]Gets all calendars with the given name[cite: 53]. |
| `getColor()` | `String` | [cite_start]Gets the color of the calendar[cite: 53]. |
| `getDefaultCalendar()` | `Calendar` | [cite_start]Gets the user's default calendar[cite: 53]. |
| `getEventById(iCalId)` | `CalendarEvent` | [cite_start]Gets the event with the given ID[cite: 53]. |
| `getEventSeriesById(iCalId)` | `CalendarEventSeries` | [cite_start]Gets the event series with the given ID[cite: 57]. |
| `getEvents(startTime, endTime)` | `CalendarEvent[]` | [cite_start]Gets all events occurring within a given time range[cite: 57]. |
| `getEventsForDay(date)` | `CalendarEvent[]` | [cite_start]Gets all events for a specific day[cite: 57]. |
| `getOwnedCalendarById(id)` | `Calendar` | [cite_start]Gets a calendar owned by the user by ID[cite: 63]. |
| `getTimeZone()` | `String` | [cite_start]Gets the time zone of the calendar[cite: 63]. |
| `isHidden()` | `Boolean` | [cite_start]Determines if the calendar is hidden[cite: 63]. |
| `newRecurrence()` | `EventRecurrence` | [cite_start]Creates a new recurrence object for creating recurring events[cite: 68]. |
| `setColor(color)` | `Calendar` | [cite_start]Sets the color of the calendar[cite: 68]. |
| `subscribeToCalendar(id)` | `Calendar` | [cite_start]Subscribes the user to the calendar with the given ID[cite: 73]. |

---

## 2. Class: Calendar
[cite_start]**Description:** Represents a specific calendar that the user owns or is subscribed to[cite: 7].

### Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `createEvent(title, startTime, endTime)` | `CalendarEvent` | [cite_start]Creates an event on this specific calendar[cite: 18]. |
| `createAllDayEvent(title, date)` | `CalendarEvent` | [cite_start]Creates an all-day event on this calendar[cite: 13]. |
| `deleteCalendar()` | `void` | [cite_start]Deletes the calendar[cite: 18]. |
| `getEvents(startTime, endTime)` | `CalendarEvent[]` | [cite_start]Gets events within a range for this calendar[cite: 23]. |
| `getEventsForDay(date)` | `CalendarEvent[]` | [cite_start]Gets events for a specific day on this calendar[cite: 23]. |
| `getId()` | `String` | [cite_start]Gets the ID of the calendar[cite: 23]. |
| `getName()` | `String` | [cite_start]Gets the name of the calendar[cite: 23]. |
| `getTimeZone()` | `String` | [cite_start]Gets the time zone[cite: 28]. |
| `isHidden()` | `Boolean` | [cite_start]Checks if hidden[cite: 28]. |
| `isMyPrimaryCalendar()` | `Boolean` | [cite_start]Checks if this is the primary calendar[cite: 28]. |
| `isOwnedByMe()` | `Boolean` | [cite_start]Checks if owned by the user[cite: 28]. |
| `isSelected()` | `Boolean` | [cite_start]Checks if selected in the UI[cite: 28]. |
| `setColor(color)` | `Calendar` | [cite_start]Sets the calendar color[cite: 28]. |
| `setDescription(description)` | `Calendar` | [cite_start]Sets the description[cite: 28]. |
| `setName(name)` | `Calendar` | [cite_start]Sets the name[cite: 33]. |
| `setTimeZone(timeZone)` | `Calendar` | [cite_start]Sets the time zone[cite: 33]. |
| `unsubscribeFromCalendar()` | `void` | [cite_start]Unsubscribes the user from this calendar[cite: 33]. |

---

## 3. Class: CalendarEvent
[cite_start]**Description:** Represents a single calendar event[cite: 7].

### Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `addEmailReminder(minutesBefore)` | `CalendarEvent` | [cite_start]Adds an email reminder[cite: 77]. |
| `addGuest(email)` | `CalendarEvent` | [cite_start]Adds a guest to the event[cite: 82]. |
| `addPopupReminder(minutesBefore)` | `CalendarEvent` | [cite_start]Adds a popup reminder[cite: 82]. |
| `deleteEvent()` | `void` | [cite_start]Deletes the event[cite: 82]. |
| `getAllDayStartDate()` | `Date` | [cite_start]Gets start date for all-day events[cite: 82]. |
| `getCreators()` | `String[]` | [cite_start]Gets the creators of the event[cite: 87]. |
| `getDescription()` | `String` | [cite_start]Gets the description[cite: 87]. |
| `getEndTime()` | `Date` | [cite_start]Gets the end time[cite: 87]. |
| `getEventSeries()` | `CalendarEventSeries` | [cite_start]Gets the series this event belongs to[cite: 87]. |
| `getGuestList()` | `EventGuest[]` | [cite_start]Gets the list of guests[cite: 87]. |
| `getId()` | `String` | [cite_start]Gets the unique iCalUID[cite: 91]. |
| `getLocation()` | `String` | [cite_start]Gets the location[cite: 91]. |
| `getStartTime()` | `Date` | [cite_start]Gets the start time[cite: 91]. |
| `getTitle()` | `String` | [cite_start]Gets the title[cite: 91]. |
| `isAllDayEvent()` | `Boolean` | [cite_start]Checks if it is an all-day event[cite: 97]. |
| `isRecurringEvent()` | `Boolean` | [cite_start]Checks if it is part of a series[cite: 97]. |
| `removeAllReminders()` | `CalendarEvent` | [cite_start]Removes all reminders[cite: 97]. |
| `setAllDayDate(date)` | `CalendarEvent` | [cite_start]Sets the date for an all-day event[cite: 102]. |
| `setColor(color)` | `CalendarEvent` | [cite_start]Sets the event color[cite: 102]. |
| `setDescription(description)` | `CalendarEvent` | [cite_start]Sets the description[cite: 102]. |
| `setLocation(location)` | `CalendarEvent` | [cite_start]Sets the location[cite: 102]. |
| `setTime(startTime, endTime)` | `CalendarEvent` | [cite_start]Sets the start and end times[cite: 107]. |
| `setTitle(title)` | `CalendarEvent` | [cite_start]Sets the title[cite: 107]. |

---

## 4. Class: CalendarEventSeries
[cite_start]**Description:** Represents a series of events (a recurring event)[cite: 7].

### Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `addGuest(email)` | `CalendarEventSeries` | [cite_start]Adds a guest to the series[cite: 115]. |
| `deleteEventSeries()` | `void` | [cite_start]Deletes the entire series[cite: 115]. |
| `setDescription(description)` | `CalendarEventSeries` | [cite_start]Sets the description for the series[cite: 130]. |
| `setLocation(location)` | `CalendarEventSeries` | [cite_start]Sets the location[cite: 135]. |
| `setRecurrence(recurrence, startDate)`| `CalendarEventSeries` | [cite_start]Sets the recurrence rule[cite: 135]. |
| `setTitle(title)` | `CalendarEventSeries` | [cite_start]Sets the title[cite: 135]. |

---

## 5. Recurrence Classes

### Class: EventRecurrence
[cite_start]**Description:** Represents the recurrence settings for an event series[cite: 7, 158].
*Use `CalendarApp.newRecurrence()` to create this object.*

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `addDailyRule()` | `RecurrenceRule` | [cite_start]Adds a rule for daily recurrence[cite: 160]. |
| `addWeeklyRule()` | `RecurrenceRule` | [cite_start]Adds a rule for weekly recurrence[cite: 165]. |
| `addMonthlyRule()` | `RecurrenceRule` | [cite_start]Adds a rule for monthly recurrence[cite: 165]. |
| `addYearlyRule()` | `RecurrenceRule` | [cite_start]Adds a rule for yearly recurrence[cite: 165]. |
| `addDate(date)` | [cite_start]`EventRecurrence` | recur on a specific date[cite: 160]. |
| `addDateExclusion(date)` | `EventRecurrence` | [cite_start]Exclude a specific date[cite: 160]. |

### Class: RecurrenceRule
[cite_start]**Description:** Represents a specific rule within a recurrence[cite: 12, 193].

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `interval(interval)` | `RecurrenceRule` | [cite_start]Applies only at this interval (e.g., every 2 weeks)[cite: 200]. |
| `onlyOnWeekday(day)` | `RecurrenceRule` | [cite_start]Applies only to specific days (e.g., `CalendarApp.Weekday.MONDAY`)[cite: 205]. |
| `onlyOnWeekdays(days)` | `RecurrenceRule` | [cite_start]Applies to multiple specific days[cite: 205]. |
| `times(times)` | `RecurrenceRule` | [cite_start]Ends after a specific number of occurrences[cite: 205]. |
| `until(endDate)` | `RecurrenceRule` | [cite_start]Ends on a specific date[cite: 205]. |

---

## 6. Enums

### Color
[cite_start]**Description:** Calendar colors[cite: 142].
* `BLUE`, `BROWN`, `CHARCOAL`, `CHESTNUT`, `GRAY`, `GREEN`, `INDIGO`, `LIME`, `MUSTARD`, `OLIVE`, `ORANGE`, `PINK`, `PLUM`, `PURPLE`, `RED`, `TEAL`, `YELLOW`, etc.

### EventColor
[cite_start]**Description:** Specific colors for events[cite: 149].
* `PALE_BLUE` ("Peacock"), `PALE_GREEN` ("Sage"), `MAUVE` ("Grape"), `PALE_RED` ("Flamingo"), `YELLOW` ("Banana"), `ORANGE` ("Tangerine"), `CYAN` ("Lavender"), `GRAY` ("Graphite"), `BLUE` ("Blueberry"), `GREEN` ("Basil"), `RED` ("Tomato").

### GuestStatus
[cite_start]**Description:** Status of a guest[cite: 178].
* `INVITED`, `MAYBE`, `NO`, `OWNER`, `YES`.

### Visibility
[cite_start]**Description:** Visibility of an event[cite: 212].
* `CONFIDENTIAL` (Private), `DEFAULT`, `PRIVATE`, `PUBLIC`.

### Weekday
[cite_start]**Description:** Days of the week[cite: 41].
* (Standard Google Apps Script Enum: `MONDAY`, `TUESDAY`, `WEDNESDAY`, etc.)