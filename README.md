# QuickAvail.xyz

A modern availability scheduling tool built with Next.js and MongoDB. Create and share your availability schedules in 4 simple steps.

## Features

- 🚀 **4-Step Process**: Project → Availability → Contact Info → Share
- 📅 **Flexible Scheduling**: Quick slots (Morning/Afternoon/Evening) + Custom time slots
- 🔗 **Secure Sharing**: Cryptographically secure share links
- 📊 **Analytics**: Track total hours, days selected, and view counts
- ⏰ **Auto-Expiration**: Schedules expire after 7 days
- 📱 **Responsive**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with TTL indexes
- **Deployment**: Vercel-ready

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/quickavail.xyz.git
cd quickavail.xyz
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB=quickavail

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 4. Initialize Database

Start the development server and initialize the database schema:
```bash
npm run dev
curl -X POST http://localhost:3000/api/init-db
```

### 5. Open the App

Visit [http://localhost:3000](http://localhost:3000) to start creating schedules!

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:pass@host:port/?directConnection=true` |
| `MONGODB_DB` | Database name | `quickavail` |
| `NEXTAUTH_URL` | Base URL for the application | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for sessions | `your-secret-key-here` |

## API Endpoints

### Create Schedule
```bash
POST /api/schedules
Content-Type: application/json

{
  "personName": "John Doe",
  "personEmail": "john@example.com",
  "selectedProject": "general",
  "projects": [...],
  "selectedDates": {...}
}
```

### Get Schedule
```bash
GET /api/schedules/{shareId}
```

### Initialize Database
```bash
POST /api/init-db
```

## Database Schema

### availability_schedules
- Stores all availability schedules
- TTL expiration after 7 days
- Indexes on `shareId` and user fields

### quick_time_slots
- Predefined time slot templates
- Morning (9AM-12PM), Afternoon (12PM-5PM), Evening (5PM-8PM)

### users
- Reserved for future Clerk authentication integration

## Security Features

- 🔐 Cryptographically secure share IDs
- 🛡️ Input validation and sanitization
- ⏰ Automatic data expiration
- 🔒 Environment variable configuration
- 🚫 No personal data in URLs

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

1. Set environment variables:
   ```bash
   export MONGODB_URI="your_connection_string"
   export NEXTAUTH_URL="https://yourdomain.com"
   ```

2. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact [your-email@domain.com]
