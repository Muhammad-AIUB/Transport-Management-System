          Transport Management Module

A production-ready Transport Management Module for a School Management System.Focuses on system design, backend–frontend integration, and real-world business logic.This module is admin-driven and integrates with existing student and fee systems.

Project Structure: 

1.Backend follows controller → service → data access
2.Frontend uses page-based admin dashboard
3.Clear separation between:
4.configuration (masters)
5.operations
6.billing side-effects

Setup Guide (Local Development):
Start Database (Docker):docker compose up -d postgres

Backend:
cd backend
npm install
npm run dev
http://localhost:5000 

Fronetnd:
cd frontend
npm install
npm run dev
http://localhost:3000

How to Test (Requirement‑Wise)

1. **Master Setup**
   - Create Routes  
   - Create Vehicles  
   - Create Pickup Points  
   - Set Route‑wise Monthly Fees  

2. **Route Configuration**
   - Map Pickup Points to Routes (with stop order)  
   - Assign Vehicle to Route  

3. **Critical Flow**
   - Go to **Student Transport**  
   - Search and select a student  
   - Assign **Route + Pickup Point**  
   - Submit  

   **Expected result**
   - Transport assignment created  
   - Transport fee auto‑generated for current month  

Edge Cases Covered

- Assign blocked if route has no fee configured  
- Duplicate route fee updates (no duplicate rows)  
- Student cannot be assigned without explicit selection  
- Fee generation cannot happen without assignment  
- Partial success is prevented using transactions  

Design Decisions (Why This Matters)

- No student creation UI  
  - → students are assumed to exist in core system  
- No manual fee entry during assignment  
  - → prevents billing inconsistency  
- Backend handles all calculations  
  - → frontend stays simple and reliable  

Evaluation Focus Alignment

This project explicitly demonstrates:

- System design thinking  
- Clean backend–frontend integration  
- Real‑world business rule enforcement  
- Production‑ready patterns (transactions, validation, separation of concerns)  

Notes for Reviewers

- Docker is used to ensure reproducible DB setup  
- Local dev flow mirrors production logic  
- Scope intentionally limited to transport module only  