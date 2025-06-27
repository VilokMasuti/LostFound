# Reconnect - Lost & Found Phone Reporting System

A production-ready, full-stack web application that helps people report lost or found phones and automatically matches them using intelligent algorithms.

## 🚀 Features

### Core Functionality
- **Smart Phone Reporting**: Submit detailed reports for lost or found phones
- **Intelligent Matching**: Automatic matching based on brand, color, and location
- **Secure Messaging**: Private communication between users about matches
- **Image Upload**: Cloudinary integration for phone photos
- **Advanced Search**: Filter and search through reports with debounced queries
- **Real-time Updates**: React Query for efficient data fetching and caching

### User Experience
- **Responsive Design**: Mobile-first approach with perfect desktop experience
- **Dark/Light Theme**: System preference detection with manual toggle
- **Smooth Animations**: Framer Motion animations throughout
- **Loading States**: Skeleton loaders and proper loading indicators
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: WCAG compliant with proper ARIA labels

### Security & Performance
- **JWT Authentication**: Secure access and refresh token system
- **HTTP-only Cookies**: Secure token storage
- **Edge-safe Middleware**: No database calls in middleware
- **Input Validation**: Zod schemas for all forms
- **Image Optimization**: Automatic image compression and format conversion
- **Caching Strategy**: React Query with proper cache invalidation

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **TypeScript** - Full type safety
- **TailwindCSS** - Utility-first styling
- **ShadCN UI** - High-quality component library
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling with validation
- **React Query** - Server state management

### Backend
- **Next.js API Routes** - Server-side API
- **MongoDB** - Document database with Mongoose ODM
- **Cloudinary** - Image storage and optimization
- **JWT** - Authentication tokens
- **Zod** - Runtime type validation

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- Cloudinary account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/lostformed.git
   cd lostformed
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Fill in your environment variables:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/lostformed
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
lostformed/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── inbox/             # Messaging pages
│   ├── reports/           # Report listing pages
│   └── ...
├── components/            # React Components
│   ├── ui/               # ShadCN UI components
│   └── ...
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── models/               # MongoDB models
├── types/                # TypeScript type definitions
└── ...
\`\`\`

## 🔧 Key Features Implementation

### Authentication System
- JWT-based authentication with access and refresh tokens
- HTTP-only cookies for secure token storage
- Edge-safe middleware for route protection
- Automatic token refresh

### Smart Matching Algorithm
- Fuzzy matching based on phone brand, color, and location
- Levenshtein distance for location similarity
- Configurable similarity thresholds
- Real-time match notifications

### Image Upload System
- Cloudinary integration with automatic optimization
- Client-side image preview and validation
- Secure server-side upload handling
- Automatic image compression and format conversion

### Private Messaging

- One message per report to prevent spam
- Read/unread status tracking
- Message deletion and management

### Advanced Search & Filtering
- Debounced search for optimal performance
- Multiple filter options (brand, color, location, type)
- React Query for efficient data fetching
- Real-time filter updates

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
\`\`\`env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [ShadCN UI](https://ui.shadcn.com/) for the beautiful components
- [Cloudinary](https://cloudinary.com/) for image management
- [MongoDB](https://mongodb.com/) for the database
- [Vercel](https://vercel.com/) for hosting

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact at vilok@outlook.com


---

Built with ❤️ by the VILOK
