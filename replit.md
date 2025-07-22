# Telnyx Softphone Application

## Overview

This is a full-stack Telnyx WebRTC softphone application built with React, Express, and PostgreSQL. The application provides a professional softphone interface with calling capabilities, call history management, contact management, and comprehensive settings configuration. It integrates with Telnyx's WebRTC services to enable voice calling functionality through a web browser.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom softphone-specific color variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **WebRTC Integration**: Telnyx WebRTC SDK for voice calling capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with proper error handling and validation

## Key Components

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Tables**:
  - `users` - User authentication and management
  - `call_logs` - Call history tracking with metadata
  - `settings` - User preferences and Telnyx configuration
  - `contacts` - Contact management
- **Validation**: Zod schemas for type-safe data validation

### API Layer
- **Call Logs API**: CRUD operations for call history management
- **Settings API**: Configuration management for Telnyx credentials and audio devices
- **Contacts API**: Contact management operations
- **Validation**: Request/response validation using Zod schemas

### Frontend Components
- **Softphone Interface**: Main calling interface with dialpad and call controls
- **Call Management**: Active call overlay, incoming call modals, and conference capabilities
- **Settings Modal**: Telnyx credentials and audio device configuration
- **Call History**: Historical call logs with redial functionality
- **Contact Management**: Contact storage and dialing integration

### WebRTC Integration
- **Telnyx Client**: Custom wrapper around Telnyx WebRTC SDK
- **Audio Device Management**: Microphone and speaker selection
- **Call State Management**: Comprehensive call state tracking and event handling
- **Real-time Communication**: WebRTC-based voice calling with call control features

## Data Flow

1. **User Authentication**: Users authenticate through the Express backend
2. **Settings Configuration**: Users configure Telnyx credentials and audio preferences
3. **WebRTC Initialization**: Frontend initializes Telnyx WebRTC client with stored credentials
4. **Call Management**: 
   - Outbound calls initiated through dialpad or contact redial
   - Inbound calls handled through WebRTC event listeners
   - Call state synchronized between WebRTC client and UI components
5. **Data Persistence**: Call logs, settings, and contacts stored in PostgreSQL via Drizzle ORM
6. **Real-time Updates**: TanStack Query manages cache invalidation and real-time data updates

## External Dependencies

### Core Dependencies
- **@telnyx/webrtc**: Telnyx WebRTC SDK for voice calling functionality
- **@neondatabase/serverless**: Serverless PostgreSQL client for database connectivity
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM for database operations
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation and formatting

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: PostgreSQL with Drizzle migrations
- **Environment**: Development-specific error handling and debugging

### Production Build
- **Frontend**: Vite production build with optimization and bundling
- **Backend**: esbuild for server bundle creation with external packages
- **Static Assets**: Frontend built to `dist/public` for static serving
- **Process Management**: Single Node.js process serving both API and static files

### Database Management
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Environment variable-based database URL configuration
- **Schema**: Shared TypeScript schema definitions between frontend and backend

The application is designed to be deployed as a single Node.js application that serves both the API endpoints and static frontend assets, making it suitable for various hosting platforms including traditional servers, containerized environments, and serverless platforms.