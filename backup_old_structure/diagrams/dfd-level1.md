# Data Flow Diagram - Level 1
## Transport Module - Major Processes

```mermaid
graph TD
    %% External Entities
    A[User/Pilgrim] 
    B[Bus Operators]
    C[Train Services]
    D[Cab Services]
    E[Payment Gateway]
    F[Maps/Navigation]
    G[Government Transport Authority]
    
    %% Major Processes
    P1[1.0 User Management]
    P2[2.0 Inter-City Transport Booking]
    P3[3.0 City Bus Route Planning]
    P4[4.0 Transport Payment Processing]
    P5[5.0 Navigation & Routes]
    P6[6.0 Real-time Transport Updates]
    P7[7.0 Location Services]
    
    %% Data Stores
    D1[(D1: User Data)]
    D2[(D2: Inter-City Transport Database)]
    D3[(D3: City Bus Routes & Schedules)]
    D4[(D4: Transport Booking Records)]
    D5[(D5: Payment Records)]
    D6[(D6: Route Data)]
    D7[(D7: Location Data)]
    D8[(D8: Real-time Updates)]
    
    %% User Interactions
    A -->|User Registration/Login| P1
    P1 -->|User Profile| D1
    D1 -->|User Info| P1
    
    %% Inter-City Transport Flow
    A -->|Transport Search Request| P2
    P2 -->|Transport Data Query| D2
    D2 -->|Available Services| P2
    P2 -->|Booking Request| P4
    P4 -->|Payment Processing| E
    E -->|Payment Confirmation| P4
    P4 -->|Payment Record| D5
    P4 -->|Booking Confirmation| P2
    P2 -->|Booking Details| D4
    P2 -->|Transport Booking| A
    
    %% City Bus Route Planning
    A -->|Route Planning Request| P3
    P3 -->|Route Data Query| D3
    D3 -->|Bus Routes & Schedules| P3
    P3 -->|Route Information| P5
    P5 -->|Maps Integration| F
    F -->|Navigation Data| P5
    P5 -->|Route Guidance| A
    
    %% Real-time Updates
    B -->|Schedule Updates| D8
    C -->|Train Updates| D8
    D -->|Cab Availability| D8
    G -->|Transport Alerts| D8
    D8 -->|Real-time Data| P6
    P6 -->|Update Notifications| A
    
    %% Location Services
    P7 -->|Location Tracking| D7
    D7 -->|Location Data| P3
    D7 -->|Location Data| P5
    A -->|Location Request| P7
```

## Data Flows

### Input Flows
- User registration/login data
- Transport search criteria (origin, destination, date, time)
- City bus route planning requests
- Transport booking requests
- Payment information
- Location/GPS data
- Real-time transport updates

### Output Flows
- Transport booking confirmations
- City bus route recommendations
- Navigation instructions and maps
- Real-time transport updates
- Payment receipts
- Location-based transport suggestions

### Data Stores
- **D1: User Data** - User profiles, preferences, transport booking history
- **D2: Inter-City Transport Database** - Bus/train/cab schedules, routes, pricing, availability
- **D3: City Bus Routes & Schedules** - Nashik city bus routes, timings, stops, frequencies
- **D4: Transport Booking Records** - All transport booking transactions and confirmations
- **D5: Payment Records** - Transport payment transaction history and status
- **D6: Route Data** - Navigation routes, traffic information, GPS coordinates
- **D7: Location Data** - User location, nearby transport stops, GPS coordinates
- **D8: Real-time Updates** - Live transport schedules, delays, cancellations, availability
