import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCallLogSchema, insertSettingsSchema, insertContactSchema, insertConferenceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Call logs endpoints
  app.get("/api/call-logs", async (_req, res) => {
    try {
      const callLogs = await storage.getCallLogs();
      res.json(callLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch call logs" });
    }
  });

  app.post("/api/call-logs", async (req, res) => {
    try {
      const callLogData = insertCallLogSchema.parse(req.body);
      const callLog = await storage.createCallLog(callLogData);
      res.json(callLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid call log data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create call log" });
      }
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (_req, res) => {
    try {
      let settings = await storage.getSettings();
      
      // If no settings exist but we have an API key in environment, create default settings
      if (!settings && process.env.TELNYX_API_KEY) {
        const defaultSettings = {
          telnyxApiKey: process.env.TELNYX_API_KEY,
          sipUsername: '',
          sipPassword: '',
          connectionServer: 'rtc.telnyx.com',
          selectedMicrophone: '',
          selectedSpeaker: '',
        };
        settings = await storage.updateSettings(defaultSettings);
      }
      
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Contacts endpoints
  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Conference endpoints
  app.get("/api/conferences", async (_req, res) => {
    try {
      const conferences = await storage.getConferences();
      res.json(conferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conferences" });
    }
  });

  app.post("/api/conferences", async (req, res) => {
    try {
      const conferenceData = insertConferenceSchema.parse(req.body);
      const conference = await storage.createConference(conferenceData);
      res.json(conference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conference data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create conference" });
      }
    }
  });

  app.put("/api/conferences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const conference = await storage.updateConference(id, updates);
      if (!conference) {
        res.status(404).json({ message: "Conference not found" });
        return;
      }
      res.json(conference);
    } catch (error) {
      res.status(500).json({ message: "Failed to update conference" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
