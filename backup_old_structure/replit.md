# Overview

KumbhSahyogi is a comprehensive service finder application designed for the Maha Kumbh 2026 festival. The application provides essential services to pilgrims and visitors, including hotel booking, medical services, transport assistance, and emergency SOS functionality. It features bilingual support (English/Hindi) and is built as a modern web application with a React frontend and Express backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system for Kumbh-specific branding
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom language context for English/Hindi bilingual support

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Setup**: TSX for TypeScript execution in development
- **Build Process**: ESBuild for production bundling
- **API Structure**: RESTful API with `/api` prefix for all endpoints
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for rapid development
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **User Management**: Basic user schema with username/password authentication
- **Security**: Environment-based configuration for database credentials

## External Dependencies
- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **UI Framework**: Radix UI components for accessible design primitives
- **Styling**: Google Fonts (Noto Sans family) for multilingual text support
- **Development Tools**: Replit-specific plugins for enhanced development experience
- **Validation**: Zod for schema validation integrated with Drizzle
- **Date Handling**: date-fns for date manipulation and formatting

The application follows a monorepo structure with shared TypeScript types and schemas between frontend and backend, enabling type safety across the full stack. The architecture supports both development and production environments with appropriate tooling for each context.