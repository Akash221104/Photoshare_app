// services/event.service.ts
// Service layer for Event operations. Handles validation, authorization guards, and repo mapping.

import { EventRepository } from '@/database/repositories/event.repository';
import { MemberRepository } from '@/database/repositories/member.repository';
import { createEventSchema, joinEventSchema } from '@/schemas/event.schema';
import { EventResponse } from '@/types/event';

const eventRepo = new EventRepository();
const memberRepo = new MemberRepository();

export class EventService {
  /**
   * Helper to generate a unique 6-character uppercase alphanumeric join code.
   */
  private generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Creates a new event and registers the creator as the 'host' member.
   */
  async createEvent(
    name: string,
    description: string | null = null,
    hostId: string,
    uploadMode: 'ALL' | 'HOST_ONLY' = 'ALL'
  ): Promise<EventResponse> {
    try {
      const validation = createEventSchema.safeParse({ name, description, upload_mode: uploadMode });
      if (!validation.success) {
        return { success: false, error: validation.error.issues.map((i) => i.message).join(', ') };
      }

      // Generate unique join code and ensure it is unique in database
      let joinCode = this.generateJoinCode();
      let existingEvent = await eventRepo.getEventByJoinCode(joinCode);
      let retries = 0;
      while (existingEvent && retries < 5) {
        joinCode = this.generateJoinCode();
        existingEvent = await eventRepo.getEventByJoinCode(joinCode);
        retries++;
      }

      const event = await eventRepo.createEvent(name, description, joinCode, hostId, validation.data.upload_mode);
      return { success: true, data: event };
    } catch (error) {
      console.error('Failed to create event in service:', error);
      return { success: false, error: 'Database error occurred during event creation' };
    }
  }

  /**
   * Retrieves an event by its ID. Public event metadata is accessible to visitors.
   */
  async getEvent(eventId: string, userId?: string): Promise<EventResponse> {
    try {
      const event = await eventRepo.getEventById(eventId);
      if (!event) {
        return { success: false, error: 'Event not found' };
      }

      return { success: true, data: event };
    } catch (error) {
      console.error('Failed to retrieve event in service:', error);
      return { success: false, error: 'Database error occurred during retrieval' };
    }
  }

  /**
   * Updates an event's name and description. Only host can edit.
   */
  async updateEvent(
    eventId: string,
    name: string,
    description: string | null = null,
    uploadMode: 'ALL' | 'HOST_ONLY' = 'ALL',
    userId: string
  ): Promise<EventResponse> {
    try {
      const validation = createEventSchema.safeParse({ name, description, upload_mode: uploadMode });
      if (!validation.success) {
        return { success: false, error: validation.error.issues.map((i) => i.message).join(', ') };
      }

      const role = await memberRepo.getMemberRole(eventId, userId);
      if (role !== 'host') {
        return { success: false, error: 'Unauthorized: Only the host can edit event settings' };
      }

      const updated = await eventRepo.updateEvent(eventId, name, description, validation.data.upload_mode);
      if (!updated) {
        return { success: false, error: 'Event not found' };
      }

      return { success: true, data: updated };
    } catch (error) {
      console.error('Failed to update event in service:', error);
      return { success: false, error: 'Database error occurred during update' };
    }
  }

  /**
   * Deletes an event. Only host can delete.
   */
  async deleteEvent(eventId: string, userId: string): Promise<EventResponse> {
    try {
      const role = await memberRepo.getMemberRole(eventId, userId);
      if (role !== 'host') {
        return { success: false, error: 'Unauthorized: Only the host can delete this event' };
      }

      const deleted = await eventRepo.deleteEvent(eventId);
      return { success: true, data: deleted };
    } catch (error) {
      console.error('Failed to delete event in service:', error);
      return { success: false, error: 'Database error occurred during deletion' };
    }
  }

  /**
   * Lists all events hosted or joined by a user.
   */
  async getAllEvents(userId: string): Promise<EventResponse> {
    try {
      const events = await eventRepo.getAllEventsForUser(userId);
      return { success: true, data: events };
    } catch (error) {
      console.error('Failed to list events in service:', error);
      return { success: false, error: 'Database error occurred while fetching events' };
    }
  }

  /**
   * Joins an event using a unique join code.
   */
  async joinEvent(joinCode: string, userId: string): Promise<EventResponse> {
    try {
      const validation = joinEventSchema.safeParse({ joinCode });
      if (!validation.success) {
        return { success: false, error: 'Invalid join code format' };
      }

      const event = await eventRepo.getEventByJoinCode(joinCode.toUpperCase());
      if (!event) {
        return { success: false, error: 'Event not found: Please check the join code' };
      }

      const isMember = await memberRepo.isMember(event.id, userId);
      if (isMember) {
        return { success: true, data: event }; // Already joined
      }

      await memberRepo.joinEvent(event.id, userId, 'guest');
      return { success: true, data: event };
    } catch (error) {
      console.error('Failed to join event in service:', error);
      return { success: false, error: 'Database error occurred during joining' };
    }
  }

  /**
   * Leaves an event. Hosts are blocked from leaving.
   */
  async leaveEvent(eventId: string, userId: string): Promise<EventResponse> {
    try {
      const role = await memberRepo.getMemberRole(eventId, userId);
      if (!role) {
        return { success: false, error: 'You are not a member of this event' };
      }
      if (role === 'host') {
        return { success: false, error: 'Hosts cannot leave their own event. Delete it instead' };
      }

      const left = await memberRepo.leaveEvent(eventId, userId);
      return { success: true, data: left };
    } catch (error) {
      console.error('Failed to leave event in service:', error);
      return { success: false, error: 'Database error occurred while leaving' };
    }
  }

  /**
   * Fetches event members list. Must be a member to view.
   */
  async getMembers(eventId: string, userId: string): Promise<EventResponse> {
    try {
      const isMember = await memberRepo.isMember(eventId, userId);
      if (!isMember) {
        return { success: false, error: 'Unauthorized: You are not a member of this event' };
      }

      const members = await memberRepo.getMembers(eventId);
      return { success: true, data: members };
    } catch (error) {
      console.error('Failed to fetch members in service:', error);
      return { success: false, error: 'Database error occurred while fetching members' };
    }
  }

  /**
   * Moderates and removes a member from an event. Only host can remove members.
   */
  async removeMember(
    eventId: string,
    memberIdToRemove: string,
    userId: string
  ): Promise<EventResponse> {
    try {
      const hostRole = await memberRepo.getMemberRole(eventId, userId);
      if (hostRole !== 'host') {
        return { success: false, error: 'Unauthorized: Only the host can remove members' };
      }

      const targetRole = await memberRepo.getMemberRole(eventId, memberIdToRemove);
      if (targetRole === 'host') {
        return { success: false, error: 'Cannot remove the host of the event' };
      }

      const removed = await memberRepo.removeMember(eventId, memberIdToRemove);
      return { success: true, data: removed };
    } catch (error) {
      console.error('Failed to remove member in service:', error);
      return { success: false, error: 'Database error occurred while removing member' };
    }
  }
}
