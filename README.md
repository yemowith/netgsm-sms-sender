# NetGSM SMS Gateway Service

A TypeScript-based SMS gateway service that provides REST API endpoints for sending both regular SMS and OTP messages using NetGSM's API services.

## Features

- Send regular SMS messages via NetGSM REST API
- Send OTP messages via NetGSM XML API
- Secure API endpoints with Bearer token authentication
- Docker support for easy deployment
- Health check endpoint for monitoring
- TypeScript implementation with proper error handling

## Prerequisites

- Node.js (v20 or higher recommended)
- Docker (optional, for containerized deployment)
- NetGSM account credentials

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# NetGSM Credentials
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_SMSHEADER=your_header
NETGSM_APPKEY=your_appkey  # Required for OTP messages

# API Security
SECRET_TOKEN=your_secret_token

# Server Configuration
PORT=4400  # Optional, defaults to 4400
```

## Installation

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd sms-netgsm-sender
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Start the service:

```bash
npm start
```

### Docker Deployment

1. Build the Docker image:

```bash
docker-compose build
```

2. Start the service:

```bash
docker-compose up -d
```

## API Endpoints

### 1. Send Regular SMS

```http
POST /sms/send
Authorization: Bearer your_secret_token
Content-Type: application/json

{
    "phone": "905xxxxxxxxx",
    "message": "Your message here"
}
```

Response:

```json
{
  "success": true,
  "jobID": "17377215342605050417149344",
  "description": "queued"
}
```

### 2. Send OTP SMS

```http
POST /sms/otp
Authorization: Bearer your_secret_token
Content-Type: application/json

{
    "phone": "905xxxxxxxxx",
    "message": "Your OTP code is: 123456"
}
```

Response:

```json
{
  "success": true,
  "jobID": "jobid123",
  "type": "otp"
}
```

### 3. Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Error Responses

### Authentication Error

```json
{
  "error": "Unauthorized"
}
```

### Validation Error

```json
{
  "error": "Missing phone or message"
}
```

### SMS Sending Error

```json
{
  "error": "SMS failed",
  "code": "error_code"
}
```

## Development

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm start` - Start the production server
- `npm run start:dev` - Start the development server with hot reload
- `npm run nm src/sender.ts` - Run with nodemon for development

### Project Structure

```
.
├── src/
│   ├── sender.ts          # Main application and API endpoints
│   ├── netgsmSms.ts       # Regular SMS implementation
│   └── netgsmOtp.ts       # OTP SMS implementation
├── dist/                  # Compiled JavaScript files
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .env                  # Environment variables (not in git)
```

## Docker Configuration

The service is configured to run in Docker with the following features:

- Multi-stage build for smaller image size
- Health check endpoint for container orchestration
- Environment variable support
- Port 4400 exposed by default

### Docker Commands

```bash
# Build and start
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## Security Considerations

1. Always use HTTPS in production
2. Keep your `SECRET_TOKEN` secure and rotate it periodically
3. Store NetGSM credentials securely
4. Use environment variables for sensitive data
5. Implement rate limiting in production

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
