import { v4 as uuid } from 'uuid';
import { Booking, CalendarEvent } from '../models/booking.model';

export interface CalendarEventPayload {
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  description: string;
}

/**
 * Mock calendar service.
 * Replace each method body with real OAuth API calls when credentials are available.
 *
 * Google Calendar: https://developers.google.com/calendar/api
 * Microsoft Graph: https://learn.microsoft.com/graph/api/user-post-events
 */
export class CalendarService {

  // ── Google Calendar ──────────────────────────────────────────────────────────

  async createGoogleEvent(
    _studentId: string,
    payload: CalendarEventPayload
  ): Promise<CalendarEvent> {
    if (process.env.GOOGLE_CLIENT_ID) {
      // TODO: implement real OAuth2 + googleapis call
      // const auth = await this.getGoogleOAuthClient(studentId);
      // const calendar = google.calendar({ version: 'v3', auth });
      // const res = await calendar.events.insert({ calendarId: 'primary', resource: ... });
      // return { eventId: res.data.id!, calendarId: 'primary' };
    }

    // Mock: generate fake IDs
    console.log(`[CalendarService] Mock: creating Google event "${payload.title}" on ${payload.date}`);
    return { eventId: `google-evt-${uuid()}`, calendarId: 'primary' };
  }

  async deleteGoogleEvent(
    _studentId: string,
    eventId: string
  ): Promise<void> {
    if (process.env.GOOGLE_CLIENT_ID) {
      // TODO: await calendar.events.delete({ calendarId: 'primary', eventId });
    }
    console.log(`[CalendarService] Mock: deleting Google event ${eventId}`);
  }

  // ── Microsoft Outlook ────────────────────────────────────────────────────────

  async createOutlookEvent(
    _studentId: string,
    payload: CalendarEventPayload
  ): Promise<CalendarEvent> {
    if (process.env.MICROSOFT_CLIENT_ID) {
      // TODO: implement MSAL + Microsoft Graph call
      // const client = this.getMsalClient(studentId);
      // const res = await client.api('/me/events').post({ subject: payload.title, ... });
      // return { eventId: res.id };
    }

    console.log(`[CalendarService] Mock: creating Outlook event "${payload.title}" on ${payload.date}`);
    return { eventId: `outlook-evt-${uuid()}` };
  }

  async deleteOutlookEvent(
    _studentId: string,
    eventId: string
  ): Promise<void> {
    if (process.env.MICROSOFT_CLIENT_ID) {
      // TODO: await client.api(`/me/events/${eventId}`).delete();
    }
    console.log(`[CalendarService] Mock: deleting Outlook event ${eventId}`);
  }

  // ── Helper ───────────────────────────────────────────────────────────────────

  buildPayload(booking: Booking, slot: any, teacherName: string): CalendarEventPayload {
    return {
      title: `Aula — Studio Fitness`,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: [
        `Professor: ${teacherName}`,
        `Tipo: ${slot.type === 'individual' ? 'Individual' : 'Grupo'}`,
        slot.description ? `Descrição: ${slot.description}` : '',
      ].filter(Boolean).join('\n'),
    };
  }
}
