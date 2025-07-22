import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  contactName: text("contact_name"),
  direction: text("direction").notNull(), // 'inbound' | 'outbound'
  status: text("status").notNull(), // 'completed' | 'missed' | 'failed'
  duration: integer("duration").notNull().default(0), // seconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  telnyxApiKey: text("telnyx_api_key"),
  sipUsername: text("sip_username"),
  sipPassword: text("sip_password"),
  connectionServer: text("connection_server").default("rtc.telnyx.com"),
  selectedMicrophone: text("selected_microphone"),
  selectedSpeaker: text("selected_speaker"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCallLogSchema = createInsertSchema(callLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
