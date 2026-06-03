"# BookingEngine" 
# 🗺️ Travel Booking Engine - Project Status Ledger

## 🕒 Current Epoch
- **System Date Anchor:** May 2026
- **Architecture Standard:** Enterprise-Grade Modular MERN / Layered SoC (Separation of Concerns)

---

## 🛠️ Module 1: Authentication & Identity Control (100% COMPLETE)
Production-gated authentication engine featuring zero-leak validation loops.

### 📁 Deployed Architecture Files
*   `src/models/userModel.js` - Database schema blueprints with 12-round Bcrypt automated password hashing hooks.
*   `src/services/authService.js` - Pure logical business engine issuing 90-day JWT authentication tokens.
*   `src/controllers/authController.js` - Network traffic controller processing payload boundaries.
*   `src/routes/authRoutes.js` - Route tree grouping endpoint maps safely behind system firewalls.
*   `src/middleware/rateLimiter.js` - Brute-force shield restricting connection floods (Max 10 calls per 15 mins).
*   `src/middleware/validators/authValidator.js` - Joi-driven perimeter validation layer catching malformed requests.
*   `src/middleware/errorMiddleware.js` - Central pipeline catching Mongoose exceptions, stripping stack traces in production environment states, and outputting structured JSON.
*   `src/config/logger.js` - Dual Winston streaming infrastructure rendering console feeds locally while writing structural log data paths (`logs/error.log` / `logs/combined.log`).

---

## 📋 Decoupled Live Documentation Spec (100% COMPLETE)
Highly maintainable OpenAPI dashboard architecture completely isolated from core controller prose.

### 📁 Deployed Blueprint Files
*   `src/docs/swagger.js` - Runtime compiler binding distributed yaml modules dynamically into Express layout layers.
*   `src/docs/schemas/user.yaml` - Shared data contract mapping user property schemas.
*   `src/docs/schemas/error.yaml` - Reusable error reply template definition block.
*   `src/docs/paths/auth.yaml` - Comprehensive endpoint spec mapping structural contracts for `/register`, `/login`, and `/forgot-password`.

---

## 🚀 Module 2: Universal CSV Upload Engine (IN PROGRESS)
Memory-efficient stream processing module designed to bulk-import massive travel metadata sheets dynamically into any MongoDB model layout.
### ☁️ Cloud Parsing Enhancements (Firebase Storage Integrated)
- Shifted server configuration profiles from memory disk streams over to stateless `memoryStorage` allocation blocks.
- Added dynamic stream bridging pipelines. Incoming multipart stream binaries pass down straight to Firebase buckets before downloading rows instantly via `fast-csv` stream chunks.
- Preserved transactional self-healing cleanup loops: If database ingestion cycles throw runtime exceptions, the remote file assets get automatically scrubbed from Firebase immediately.
### 📝 Architectural Decision Record (ADR #02)
- **Context:** Proposed direct frontend-to-Firebase uploads with backend URL parsing.
- **Decision:** Rejected direct URL parsing. Implemented mandatory Backend-Gated Multer Memory Buffer Streaming.
- **Rationale:** 1. Guarantees absolute data privacy by keeping Firebase storage buckets 100% private.
  2. Eliminates unnecessary network round-trips (downloading files via URLs).
  3. Ensures atomic cleanup loops to prevent unlinked orphan files from bloating cloud storage.
  ### 📝 Architectural Decision Record (ADR #04)
- **Context:** Evaluated Signed URLs vs. Backend Pass-Through Streaming for bulk updates.
- **Decision:** Retained Backend-Gated Streaming for parsing operations; reserved Signed URLs for future static file hosting (e.g., Driver Licenses, Invoices).
- **Rationale:** Signed URLs introduce an inefficient double-download loop for files that require active data extraction, while increasing cloud cleanup complexity.

## 🛠️ Module 3: Dynamic Travel Pricing Calculation Matrix Engine (100% COMPLETE)
Highly predictive financial calculations module isolating algorithmic business rules away from presentation routing protocols.

### 📁 Deployed Analytical Files
* `src/services/pricingService.js` - Central algorithmic matrix runner processing system surge pricing rules.
* `src/controllers/pricingController.js` - Captures runtime parameters and routes them to our mathematical calculation engine.
* `src/routes/pricingRoutes.js` - Endpoint array exposing estimate request paths to client integrations.
* `src/docs/paths/rates.yaml` - Complete template contract specifying multi-part CSV uploads.

## 🛠️ Module 4: Enterprise Gated Booking Engine (100% REFACTORED)
Robust step-by-step transaction manager keeping operational driver systems decoupled from requests until complete invoice settlement occurs.

### 📁 Deployed State-Machine Components
* `src/models/bookingModel.js` - Expanded schema with dedicated fields tracking invoice attachments, transaction identifiers, and financial timestamp records.
* `src/controllers/bookingController.js` - Four-tiered execution pipeline enforcing strict status transitions: `Request` ➔ `Invoice` ➔ `Payment` ➔ `Fleet Dispatch`.
* `src/docs/paths/bookings.yaml` - Complete architectural API blueprint reflecting secure gated endpoints.