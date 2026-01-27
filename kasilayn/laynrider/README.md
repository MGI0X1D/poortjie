# Laynrider Dashboard & Booking Documentation

This directory contains the core files for the Laynrider (Rider) experience on the Poortjie Services web platform.

## 1. Rider Dashboard (`dashboard.html`)
The dashboard is the entry point for riders to see available transportation.

### Key Features
- **Real-time Fleet Tracking:** Listens to Firestore collections for live updates on driver status and location.
- **Categorized Sections:**
    - **Available Drivers:** Online and ready to accept trips.
    - **Currently Busy:** Drivers on active trips.
    - **Offline:** Inactive drivers.
- **Filtering:** Filter drivers by car body type (Sedan, SUV, Hatchback, Bakkie).
- **Sorting:** 
    - **Name (A-Z):** Alphabetical list.
    - **Closest to me:** Uses Geolocation API to sort drivers by real-time distance.

### Data Sources (Firestore)
- **Drivers:** `kasilayn/fleet/drivers`
- **Cars:** `kasilayn/fleet/cars`
- **Logic:** Matches `drivers.carRef` or `drivers.carRegistration` to documents in the `cars` collection to show vehicle details.

### Navigation
- Clicking an **Available** driver card redirects to `booking.html?driverUid={ID}`.

---

## 2. Booking Confirmation (`booking.html`)
The screen where a user finalizes their trip details before requesting a ride.

### Key Features
- **Interactive Map:** Powered by Google Maps. Shows pickup, destination, and the driver's live location.
- **Smart Autocomplete:** Uses Google Places API for pickup and destination entry. Pickup is auto-filled with current GPS location if available.
- **Route Visualization:** Draws the driving route (polyline) on the map and calculates real-time distance and duration.
- **Dynamic Fare Calculation:** 
    - **Formula:** `Base Fee + (Rate per Km * Distance) + (Rate per Hour * Duration)`
    - Values are fetched from the specific car's document in Firestore.
- **Booking Creation:** On "Confirm Booking", creates a document in the `kasilayn/fleet/bookings` collection with status `PENDING`. Redirects to `history.html` on success.

---

## 3. Booking History (`history.html`)
The screen where users can view all their past and active bookings.

### Key Features
- **Real-time Updates:** Uses a Firestore snapshot listener to automatically update booking statuses (e.g., from PENDING to ACCEPTED) as they change in the database.
- **Categorized Statuses:** Visual indicators (colors) for different booking states:
    - **PENDING:** Amber (Waiting for driver).
    - **ACCEPTED/COMPLETED:** Green.
    - **CANCELLED:** Red.
- **Booking Summary:** Each card displays:
    - Driver Name
    - Pickup & Destination addresses.
    - Date & Time (`whenText`).
    - Estimated Fare and Distance.
- **Direct Navigation:** Clicking a booking card opens the detailed status view (`waiting.html`).
- **Authentication:** Only shows bookings for the currently logged-in user (`requesterUid`).

### Required Fields
The following fields are mandatory for every booking record:
- `pickup`: Full address string (and location object).
- `destination`: Full address string (and location object).
- `driverUid`: UID of the selected driver.
- `driverUsername`: Username/Display name of the driver.
- `requesterUid`: UID of the rider who made the request.
- `status`: Initialized to `PENDING`.
- `pickupShort`: First part of the pickup address.
- `destinationShort`: First part of the destination address.
- `carSeats`: Number of seats in the vehicle.

### State Management
- **Booking Flow:** The rider app creates the booking document. The system (driver app or backend) is responsible for responding to the request. The driver's status is NOT automatically updated by the rider app.

---

## 4. Driver Registration (`register-driver.html`)
The screen where users can register as drivers and add their vehicles to the fleet.

### Key Features
- **Profile Setup:** Drivers can set their display name and upload a profile photo.
- **Vehicle Registration:** Captures detailed car information:
    - Make, Model, Color, Registration.
    - Body Type (for filtering on the dashboard).
    - Available Seats.
    - Vehicle Photo.
- **Data Integration:** 
    - Uses an **atomic Firestore transaction** to promote users to drivers.
    - Copies core details (username, email, phone, bio) from `users/{uid}` to `kasilayn/fleet/drivers/{uid}`.
    - Updates `users/{uid}` with the `isDriver: true` role and a `driverRef`.
    - Saves vehicle details to `kasilayn/fleet/cars/{registration}`.
- **State Management:** New drivers are initialized with an `OFFLINE` status by default.
- **Pre-condition:** Prevents duplicate registration by checking if a driver document already exists for the UID.

---

## Development Notes
- **UI Framework:** Tailwind CSS (utility-first).
- **Icons:** FontAwesome 6.
- **Maps Library:** Google Maps JS API (Places, Directions, Geocoding).
- **Firestore Schema:** 
    - `kasilayn/fleet/drivers/{uid}`: `status` (ONLINE, BUSY, OFFLINE), `lastLocation` (GeoPoint), `carRegistration`.
    - `kasilayn/fleet/bookings/{id}`: `requesterUid`, `driverUid`, `driverUsername`, `pickup`, `destination`, `status`.
