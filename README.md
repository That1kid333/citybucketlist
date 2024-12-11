# City Bucket List

A modern web application for managing driver-rider relationships and ride scheduling.

## Features

- Driver Portal with comprehensive dashboard
- Real-time ride management
- Earnings tracking and analytics
- Schedule management
- Messaging system
- Profile and settings management

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- Firebase for backend services
  - Authentication
  - Firestore Database
  - Cloud Storage
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/That1kid333/citybucketlist.git
cd citybucketlist
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
