# Product Requirements Document (PRD)

# CrowdLense - Anonymous Image Upload & Image Display System

## 1. Executive Summary

### Product Vision

CrowdLense is a web application that enables anonymous image submissions with admin moderation and authenticated viewing through an automated carousel display system.

### Key Value Proposition

- **For anonymous users**: Simple, frictionless image submission
- **For administrators**: Efficient content moderation workflow
- **For authenticated viewers**: Curated, fullscreen image experience with integrated promotional content

## 2. Product Overview

### 2.1 Problem Statement

Organizations need a secure way to collect user-generated images while maintaining content quality through moderation, and displaying approved content in an engaging format that incorporates promotional materials. The solution must be mobile-only to ensure optimal user experience on the primary target devices.

### 2.2 Solution

A three-tier system comprising:

1. Public submission interface
2. Admin moderation dashboard
3. Authenticated viewing carousel with automated promotional content insertion

### 2.3 Success Metrics

- Upload conversion rate
- Admin review efficiency (images/hour)
- Viewer engagement time
- System uptime (99.9% target)

## 3. User Personas

### 3.1 Anonymous Submitter

- **Goal**: Quick, easy image upload without registration

### 3.2 Admin Moderator

- **Goal**: Efficiently review and moderate submissions

### 3.3 Authenticated Viewer

- **Goal**: View curated content in immersive experience

## 4. Functional Requirements

### 4.0 Mobile-Only Requirements

**Priority: P0**

#### Requirements

- FR-001: All interfaces must be touch-optimized for mobile devices

### 4.1 Image Upload System

**Priority: P0**

#### Requirements

- FR-002: Support mobile file upload through camera or gallery
- FR-003: Accept multiple image formats (JPEG, PNG, GIF, WebP)
- FR-004: Validate file size (max 30MB per image)
- FR-005: Display upload progress indicator
- FR-006: Support batch uploads (up to 10 files)
- FR-007: Provide success/error feedback

#### Acceptance Criteria

- Files upload without page refresh
- Clear error messages for invalid files
- Mobile-optimized interface

### 4.2 Admin Review Queue

**Priority: P0**

#### Requirements

- FR-008: Display pending images sequentially
- FR-009: Provide approve/reject actions
- FR-010: Auto-advance after decision
- FR-011: Show submission metadata (timestamp, file size)
- FR-012: Batch review capabilities
- FR-013: Review history/audit trail

#### Acceptance Criteria

- Single-click approval/rejection
- No lag between image loads

### 4.3 Image Carousel Display

**Priority: P0**

#### Requirements

- FR-014: Fullscreen image presentation
- FR-015: Chronological display order
- FR-016: Insert promotional image every 5th position
- FR-017: Bottom-right preview (next 5 images)
- FR-018: Bottom-left QR code for upload URL (crowd-lense.pkerschbaum.dev)
- FR-019: Smooth image transitions

#### Acceptance Criteria

- Images load without visible delay
- Seamless static image integration
- QR code remains scannable at display size

### 4.4 Authentication System

**Priority: P0**

#### Requirements

- FR-020: Admin login with username/password
- FR-021: Basic authentication (HTTP Basic Auth)
- FR-022: Protected route enforcement
- FR-023: Session timeout (configurable)
- FR-024: Password reset capability

#### Acceptance Criteria

- Secure credential handling
- Automatic redirect on unauthorized access
- Clear login/logout flow

## 5. Non-Functional Requirements

### 5.1 Security

- NFR-001: HTTPS encryption required
- NFR-002: File type validation (server-side)
- NFR-003: Rate limiting (10 uploads/minute/IP)
- NFR-004: CSRF protection on all forms
- NFR-005: SQL injection prevention
- NFR-006: XSS protection

### 5.2 Usability

- NFR-007: Mobile-optimized design (desktop isn't relevant)
- NFR-008: WCAG compliance for mobile interfaces
- NFR-009: Mobile browser support (Chrome, Firefox, Safari mobile versions)
- NFR-010: Intuitive UI requiring no training
- NFR-011: Touch-optimized interface for all interactions

### 5.3 Reliability

- NFR-012: 99.9% uptime SLA
- NFR-013: Graceful error handling

## 6. Technical Architecture

### 6.1 Frontend Stack

- **Framework**: React with Next.js 13+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn
- **State Management**: React Query (Tanstack Query), Zustand
- **HTTP Client**: Fetch API

### 6.2 Backend Stack

- **Runtime**: Node.js 22+
- **Framework**: Next.js API Routes
- **Database**: Prisma Postgres
- **File Storage**: Vercel Blob
- **Image Processing**: Vercel Image Optimization
- **Authentication**: HTTP Basic Auth with bcrypt

### 6.3 Infrastructure

- **Hosting**: Vercel (crowd-lense.pkerschbaum.dev)
- **CDN**: Vercel
- **Monitoring**: Sentry with all features

## 7. Data Model

### 7.1 Core Entities

#### Images

- id (UUID, PK)
- filename (string)
- original_filename (string)
- upload_timestamp (timestamp)
- status (enum: pending/approved/rejected)
- mime_type (string)
- review_timestamp (timestamp, nullable)

## 8. API Specification

TODO

## 9. User Interface Design

### 9.1 Upload Page (Mobile optimized)

- Full-width upload zone optimized for touch
- Tap to select from gallery or camera
- File preview thumbnails
- Progress bars during upload
- Success/error notifications with haptic feedback

### 9.2 Admin Dashboard

- Full-width image preview
- Prominent approve/reject buttons
- Pending count indicator
- Keyboard shortcut legend

### 9.3 Carousel View

- Edge-to-edge image display
- Translucent preview overlay
- Persistent QR code display

## 10. Appendices

### A. Glossary

- **CSRF**: Cross-Site Request Forgery
- **XSS**: Cross-Site Scripting
- **CDN**: Content Delivery Network
- **SLA**: Service Level Agreement
