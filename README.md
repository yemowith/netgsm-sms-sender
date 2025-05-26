# NetGSM SMS Gateway with Supabase Integration

A robust TypeScript-based SMS gateway service that integrates NetGSM's SMS services with Supabase for message tracking and management. This service provides REST API endpoints for sending both regular SMS and OTP messages, with built-in message logging and tracking capabilities.

## Features

- **SMS Services**

  - Send regular SMS messages via NetGSM REST API
  - Send OTP messages via NetGSM XML API
  - Support for bulk SMS sending
  - Message delivery status tracking

- **Supabase Integration**

  - Message history logging
  - Delivery status tracking
  - User management and authentication
  - Rate limiting and quota management

- **Security & Reliability**
  - Secure API endpoints with Bearer token authentication
  - Supabase JWT authentication support
  - Rate limiting and request validation
  - Health check endpoint for monitoring
  - Docker support for easy deployment

## Prerequisites

- Node.js (v20 or higher)
- Docker (optional, for containerized deployment)
- NetGSM account credentials
- Supabase project and credentials

## Environment Variables

Create a `.env` file in the root directory:

```env
# NetGSM Credentials
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_SMSHEADER=your_header
NETGSM_APPKEY=your_appkey  # Required for OTP messages

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Security
SECRET_TOKEN=your_secret_token
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=4400  # Optional, defaults to 4400
```

## Database Schema (Supabase)

### Messages Table

```sql
create table messages (
  id uuid default uuid_generate_v4() primary key,
  phone text not null,
  message text not null,
  type text not null check (type in ('sms', 'otp')),
  status text not null,
  job_id text,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table messages enable row level security;

-- Create policies
create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = user_id);

create policy "Service role can insert messages"
  on messages for insert
  with check (auth.role() = 'service_role');
```

## Installation

### Local Development

1. Clone and setup:

```bash
git clone <repository-url>
cd sms-netgsm-sender
npm install
```

2. Set up Supabase:

   - Create a new project in Supabase
   - Run the database migrations
   - Configure authentication if needed

3. Start the service:

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm start
```

### Docker Deployment

```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## API Endpoints

### 1. Send Regular SMS

```http
POST /sms/send
Authorization: Bearer your_secret_token
Content-Type: application/json

{
    "phone": "905xxxxxxxxx",
    "message": "Your message here",
    "metadata": {
        "user_id": "optional-user-id",
        "campaign_id": "optional-campaign-id"
    }
}
```

### 2. Send OTP SMS

```http
POST /sms/otp
Authorization: Bearer your_secret_token
Content-Type: application/json

{
    "phone": "905xxxxxxxxx",
    "message": "Your OTP code is: 123456",
    "metadata": {
        "user_id": "optional-user-id",
        "purpose": "verification"
    }
}
```

### 3. Check Message Status

```http
GET /sms/status/:jobId
Authorization: Bearer your_secret_token
```

### 4. Get Message History

```http
GET /sms/history
Authorization: Bearer your_secret_token
Query Parameters:
  - page (default: 1)
  - limit (default: 20)
  - type (optional: 'sms' or 'otp')
  - status (optional: 'queued', 'sent', 'delivered', 'failed')
```

## Supabase Integration

### Message Tracking

- All sent messages are automatically logged in Supabase
- Delivery status updates are tracked
- Support for message metadata and user association

### Authentication

- JWT-based authentication with Supabase
- Role-based access control
- Service role for internal operations

### Rate Limiting

- Per-user rate limiting
- Daily/monthly quota management
- Configurable limits per message type

## Development

### Project Structure

```
.
├── src/
│   ├── sender.ts          # Main application and API endpoints
│   ├── netgsmSms.ts       # Regular SMS implementation
│   ├── netgsmOtp.ts       # OTP SMS implementation
│   ├── supabase/          # Supabase integration
│   │   ├── client.ts      # Supabase client setup
│   │   ├── messages.ts    # Message operations
│   │   └── auth.ts        # Authentication utilities
│   └── types/             # TypeScript type definitions
├── migrations/            # Database migrations
├── docker/               # Docker configuration
└── tests/               # Test files
```

### Available Scripts

```bash
# Development
npm run start:dev     # Start development server
npm run test         # Run tests
npm run lint         # Run linter

# Production
npm run build        # Build the project
npm start           # Start production server
```

## Security Best Practices

1. **API Security**

   - Always use HTTPS in production
   - Implement rate limiting
   - Use secure token management
   - Validate all input data

2. **Supabase Security**

   - Enable Row Level Security (RLS)
   - Use appropriate policies
   - Secure service role key
   - Regular security audits

3. **NetGSM Security**
   - Secure credential storage
   - Regular password rotation
   - Monitor API usage
   - Implement error handling

## Monitoring and Logging

- Health check endpoint (`/health`)
- Supabase logging integration
- Error tracking and reporting
- Performance monitoring
- Message delivery status tracking

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
