# Data Flow Diagram - Level 2
## Transport Module - Detailed Process Breakdown

## Inter-City Transport Booking System (Process 2.0)

```mermaid
graph TD
    %% External Entities
    A[User/Pilgrim]
    B[Bus Operators]
    C[Train Services]
    D[Cab Services]
    E[Payment Gateway]
    
    %% Level 2 Processes for Inter-City Transport
    P2_1[2.1 Transport Search]
    P2_2[2.2 Filter & Sort Results]
    P2_3[2.3 View Transport Details]
    P2_4[2.4 Check Availability]
    P2_5[2.5 Passenger Details Entry]
    P2_6[2.6 Payment Processing]
    P2_7[2.7 Booking Confirmation]
    P2_8[2.8 Booking Management]
    
    %% Data Stores
    D2[(D2: Inter-City Transport Database)]
    D1[(D1: User Data)]
    D4[(D4: Transport Booking Records)]
    D7[(D7: Location Data)]
    D5[(D5: Payment Records)]
    
    %% Search Flow
    A -->|Search Criteria| P2_1
    P2_1 -->|Location Query| D7
    D7 -->|Location Data| P2_1
    P2_1 -->|Transport Query| D2
    D2 -->|Transport List| P2_1
    P2_1 -->|Search Results| P2_2
    
    %% Filter & Sort
    A -->|Filter Preferences| P2_2
    P2_2 -->|Filtered Results| A
    
    %% Transport Details
    A -->|Transport Selection| P2_3
    P2_3 -->|Transport Details Query| D2
    D2 -->|Transport Information| P2_3
    P2_3 -->|Transport Details| A
    
    %% Availability Check
    A -->|Booking Request| P2_4
    P2_4 -->|Availability Query| D2
    D2 -->|Seat/Availability| P2_4
    P2_4 -->|Available Options| P2_5
    
    %% Passenger Details
    P2_5 -->|Passenger Information| A
    A -->|Passenger Details| P2_5
    P2_5 -->|Booking Data| P2_6
    
    %% Payment Processing
    P2_6 -->|Payment Request| E
    E -->|Payment Confirmation| P2_6
    P2_6 -->|Payment Record| D5
    P2_6 -->|Booking Confirmation| P2_7
    
    %% Booking Confirmation
    P2_7 -->|Booking Record| D4
    P2_7 -->|User Booking Update| D1
    P2_7 -->|Booking Details| A
    
    %% Booking Management
    A -->|Booking Management| P2_8
    P2_8 -->|Booking Query| D4
    D4 -->|Booking Information| P2_8
    P2_8 -->|Booking Status| A
    
    %% Transport Provider Updates
    B -->|Bus Updates| D2
    C -->|Train Updates| D2
    D -->|Cab Updates| D2
    D2 -->|Availability Updates| B
    D2 -->|Availability Updates| C
    D2 -->|Availability Updates| D
```

## City Bus Route Planning System (Process 3.0) - Level 2

```mermaid
graph TD
    %% External Entities
    A[User/Pilgrim]
    B[MSRTC/Nashik Transport]
    F[Maps/Navigation]
    G[Government Transport Authority]
    
    %% Level 2 Processes for City Bus Planning
    P3_1[3.1 Station Selection]
    P3_2[3.2 Route Search]
    P3_3[3.3 Schedule Display]
    P3_4[3.4 Route Booking]
    P3_5[3.5 Navigation Integration]
    P3_6[3.6 Real-time Updates]
    P3_7[3.7 Popular Routes]
    
    %% Data Stores
    D3[(D3: City Bus Routes & Schedules)]
    D6[(D6: Route Data)]
    D4[(D4: Transport Booking Records)]
    D7[(D7: Location Data)]
    D8[(D8: Real-time Updates)]
    
    %% Station Selection
    A -->|From/To Station Selection| P3_1
    P3_1 -->|Station Query| D3
    D3 -->|Available Stations| P3_1
    P3_1 -->|Selected Stations| P3_2
    
    %% Route Search
    P3_2 -->|Route Query| D3
    D3 -->|Bus Routes| P3_2
    P3_2 -->|Matching Routes| P3_3
    
    %% Schedule Display
    P3_3 -->|Schedule Data| A
    A -->|Route Selection| P3_4
    
    %% Route Booking
    P3_4 -->|Booking Request| P3_5
    P3_5 -->|Route Data| D6
    P3_5 -->|Navigation Setup| F
    F -->|Navigation Data| P3_5
    P3_5 -->|Booking Record| D4
    P3_5 -->|Navigation Route| A
    
    %% Popular Routes
    A -->|Popular Route Request| P3_7
    P3_7 -->|Popular Routes Query| D3
    D3 -->|Popular Routes Data| P3_7
    P3_7 -->|Popular Routes List| A
    
    %% Real-time Updates
    B -->|Schedule Updates| D8
    G -->|Transport Alerts| D8
    D8 -->|Live Updates| P3_6
    P3_6 -->|Update Notifications| A
    
    %% Location Integration
    P3_1 -->|Location Query| D7
    D7 -->|Location Data| P3_1
```

## Navigation & Routes System (Process 5.0) - Level 2

```mermaid
graph TD
    %% External Entities
    A[User/Pilgrim]
    F[Maps/Navigation Services]
    
    %% Level 2 Processes for Navigation
    P5_1[5.1 Route Planning]
    P5_2[5.2 GPS Navigation]
    P5_3[5.3 Turn-by-Turn Directions]
    P5_4[5.4 Traffic Updates]
    P5_5[5.5 Alternative Routes]
    P5_6[5.6 Walking Routes]
    
    %% Data Stores
    D6[(D6: Route Data)]
    D7[(D7: Location Data)]
    D8[(D8: Real-time Updates)]
    
    %% Route Planning
    A -->|Route Request| P5_1
    P5_1 -->|Route Query| D6
    D6 -->|Route Information| P5_1
    P5_1 -->|Planned Route| P5_2
    
    %% GPS Navigation
    P5_2 -->|GPS Coordinates| D7
    D7 -->|Current Location| P5_2
    P5_2 -->|Navigation Setup| F
    F -->|Navigation Data| P5_2
    P5_2 -->|Navigation Active| P5_3
    
    %% Turn-by-Turn Directions
    P5_3 -->|Direction Updates| A
    P5_3 -->|Traffic Check| P5_4
    P5_4 -->|Traffic Data| D8
    D8 -->|Traffic Updates| P5_4
    P5_4 -->|Traffic Info| P5_3
    
    %% Alternative Routes
    P5_3 -->|Alternative Request| P5_5
    P5_5 -->|Route Alternatives| D6
    D6 -->|Alternative Routes| P5_5
    P5_5 -->|Route Options| A
    
    %% Walking Routes
    A -->|Walking Route Request| P5_6
    P5_6 -->|Walking Route Query| D6
    D6 -->|Walking Routes| P5_6
    P5_6 -->|Walking Directions| A
```

## Key Data Flows at Level 2

### Inter-City Transport Booking System
- **Search Criteria**: Origin, destination, date, time, passenger count
- **Transport Information**: Service type, operator, schedules, pricing, availability
- **Passenger Details**: Names, contact info, age, seat preferences
- **Payment Data**: Amount, payment method, transaction ID
- **Booking Confirmation**: Booking ID, transport details, journey dates, seat numbers

### City Bus Route Planning System
- **Station Selection**: From station, to station, preferred time
- **Route Data**: Bus number, route name, via stations, departure/arrival times
- **Schedule Information**: Frequency, operating hours, fare structure
- **Navigation Integration**: GPS coordinates, turn-by-turn directions
- **Real-time Updates**: Schedule changes, delays, route modifications

### Navigation & Routes System
- **Route Planning**: Origin, destination, mode of transport, preferences
- **GPS Data**: Current location, destination coordinates, route waypoints
- **Navigation Instructions**: Turn-by-turn directions, distance, estimated time
- **Traffic Information**: Real-time traffic conditions, alternative routes
- **Walking Routes**: Pedestrian-friendly paths, walking time estimates
