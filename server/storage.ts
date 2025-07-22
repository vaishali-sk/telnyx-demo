import { users, callLogs, settings, contacts, conferences, type User, type InsertUser, type CallLog, type InsertCallLog, type Settings, type InsertSettings, type Contact, type InsertContact, type Conference, type InsertConference } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Call logs
  getCallLogs(): Promise<CallLog[]>;
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // Conferences
  getConferences(): Promise<Conference[]>;
  createConference(conference: InsertConference): Promise<Conference>;
  updateConference(id: number, updates: Partial<Conference>): Promise<Conference | undefined>;
  deleteConference(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private callLogs: Map<number, CallLog>;
  private settings: Settings | undefined;
  private contacts: Map<number, Contact>;
  private conferences: Map<number, Conference>;
  private currentUserId: number;
  private currentCallLogId: number;
  private currentContactId: number;
  private currentConferenceId: number;

  constructor() {
    this.users = new Map();
    this.callLogs = new Map();
    this.contacts = new Map();
    this.conferences = new Map();
    this.currentUserId = 1;
    this.currentCallLogId = 1;
    this.currentContactId = 1;
    this.currentConferenceId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCallLogs(): Promise<CallLog[]> {
    return Array.from(this.callLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createCallLog(insertCallLog: InsertCallLog): Promise<CallLog> {
    const id = this.currentCallLogId++;
    const callLog: CallLog = { 
      phoneNumber: insertCallLog.phoneNumber,
      contactName: insertCallLog.contactName || null,
      direction: insertCallLog.direction,
      status: insertCallLog.status,
      duration: insertCallLog.duration || 0,
      conferenceId: insertCallLog.conferenceId || null,
      isConferenceCall: insertCallLog.isConferenceCall || false,
      id, 
      timestamp: new Date() 
    };
    this.callLogs.set(id, callLog);
    return callLog;
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const settings: Settings = { 
      telnyxApiKey: insertSettings.telnyxApiKey || null,
      sipUsername: insertSettings.sipUsername || null,
      sipPassword: insertSettings.sipPassword || null,
      connectionServer: insertSettings.connectionServer || null,
      selectedMicrophone: insertSettings.selectedMicrophone || null,
      selectedSpeaker: insertSettings.selectedSpeaker || null,
      id: 1 
    };
    this.settings = settings;
    return settings;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  async getConferences(): Promise<Conference[]> {
    return Array.from(this.conferences.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async createConference(insertConference: InsertConference): Promise<Conference> {
    const id = this.currentConferenceId++;
    const conference: Conference = { 
      conferenceId: insertConference.conferenceId,
      hostNumber: insertConference.hostNumber,
      participantNumbers: insertConference.participantNumbers || [],
      status: insertConference.status,
      endTime: insertConference.endTime || null,
      id, 
      startTime: new Date()
    };
    this.conferences.set(id, conference);
    return conference;
  }

  async updateConference(id: number, updates: Partial<Conference>): Promise<Conference | undefined> {
    const existing = this.conferences.get(id);
    if (!existing) return undefined;

    const updated: Conference = { ...existing, ...updates };
    this.conferences.set(id, updated);
    return updated;
  }

  async deleteConference(id: number): Promise<void> {
    this.conferences.delete(id);
  }
}

export const storage = new MemStorage();
