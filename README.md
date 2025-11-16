# Betegna - Ethiopian Roommate & Room Sharing Platform

Betegna is an MVP web application designed to help Ethiopian diaspora in Gulf countries (UAE, KSA, Qatar, Oman, Bahrain, Kuwait, Lebanon, Yemen, Egypt) find safe, culturally compatible roommates and rooms.

## Features

- **User Authentication**: JWT-based auth with secure password hashing
- **Room Listings**: Search and filter rooms by country, city, price, amenities, and preferences
- **Messaging**: In-app chat between tenants and room owners
- **Ratings & Reviews**: Feedback system for rooms and users
- **Admin Dashboard**: User management, listing moderation, and analytics
- **Ads Integration**: Targeted advertising system
- **Multi-language Support**: English, Amharic, Oromiffa, Tigrinya
- **Analytics**: Event tracking for insights

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- JWT authentication
- In-memory JSON data stores (ready for database migration)
- Security: Helmet, CORS, rate limiting

### Frontend
- React + TypeScript
- React Router
- React Query (TanStack Query)
- i18next for internationalization
- Tailwind CSS + custom CSS

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
Betegna/
├── backend/
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/  # Auth & validation middleware
│   │   ├── models/       # TypeScript types
│   │   ├── data/         # In-memory data stores
│   │   ├── utils/        # JWT & utilities
│   │   ├── analytics/   # Event tracking
│   │   └── app.ts        # Express app setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React page components
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks (useAuth)
│   │   ├── api/          # API client
│   │   ├── locales/      # i18n translation files
│   │   └── App.tsx       # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile

### Rooms
- `GET /api/rooms` - List rooms (with filters & pagination)
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room listing
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Soft delete room

### Messages
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages` - Send message

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/rooms/:id` - Get room feedback
- `GET /api/feedback/users/:id` - Get user feedback

### Ads
- `GET /api/ads` - Get ads (filtered by position, country, city)
- `POST /api/ads/:id/click` - Track ad click

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/rooms` - List rooms
- `GET /api/admin/analytics/summary` - Analytics summary

## Data Storage

Currently uses in-memory JSON objects for all data. This is designed to be easily migrated to a database (PostgreSQL recommended) in the future. The data structure is defined in `backend/src/data/store.ts`.

## Security Features

- Password hashing with bcrypt
- JWT access tokens
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Input validation with Zod

## Future Enhancements

- Database migration (PostgreSQL)
- File upload for room photos
- WebSocket for real-time messaging
- Push notifications
- ID verification system
- Mobile app (React Native)
- Advanced search filters
- Map integration
- Payment integration

## License

MIT

