# KFT Management System

A comprehensive business management application built with React, TypeScript, and modern web technologies.

## 🚀 Features

- **Authentication System**: Complete login, logout, forgot password, and reset password functionality
- **Dashboard**: Overview of business metrics and analytics
- **Invoice Management**: Create, edit, and track invoices
- **Order Management**: Manage orders and fulfillment
- **Customer Management**: Customer database and relationship management
- **Cash Management**: Track cash flow and transactions
- **Reports & Analytics**: Generate business reports
- **Admin Management**: User and system administration
- **Responsive Design**: Mobile-first, accessible design
- **Dark/Light Theme**: Theme switching support

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **React Query** - Server state management
- **Formik + Yup** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Axios** - HTTP client for API calls

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd KFT-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit `.env` file with your configuration:
   \`\`\`env
   VITE_API_URL=http://localhost:3000/api/v1
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏃‍♂️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

### Demo Credentials
- **Email**: sam@brightdiva.com
- **Password**: Sam123789

### Features
- Secure JWT-based authentication
- Password reset functionality
- Session management
- Route protection

## 🎨 Design System

### Colors
- **Primary**: #243636 (Professional dark teal)
- **Secondary**: #7c9982 (Calming sage green)
- **Success**: #2c6e49 (Success operations)
- **Error**: #d62828 (Error states)
- **Warning**: #ff8c42 (Warning messages)
- **Gray**: #a3bac3 (Neutral elements)

### Typography
- **Font Family**: Roboto
- **Weights**: 300, 400, 500, 700

## ♿ Accessibility

The application follows WCAG 2.1 AA guidelines:

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets AA contrast ratios
- **Reduced Motion**: Respects user preferences

## 📱 Responsive Design

- **Mobile-first approach**
- **Breakpoints**: xs(475px), sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
- **Touch-friendly**: 44px minimum touch targets
- **Flexible layouts**: CSS Grid and Flexbox

## 🏗️ Project Structure

\`\`\`
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── auth/           # Authentication components
│   └── providers/      # Context providers
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── App.tsx             # Main app component
└── main.tsx            # App entry point
\`\`\`

## 🔌 API Integration

The application integrates with a REST API for:

- Authentication (login, logout, password reset)
- Invoice management
- Order management
- Customer management
- Cash management
- Dashboard analytics
- Admin operations

### API Configuration

Set the API URL in your `.env` file:
\`\`\`env
VITE_API_URL=http://localhost:3000/api/v1
\`\`\`

## 🚀 Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy the `dist` folder** to your hosting provider

### Environment Variables for Production

\`\`\`env
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=KFT Management System
VITE_APP_VERSION=1.0.0
\`\`\`

## 🧪 Testing

The application includes:

- **Type checking** with TypeScript
- **Linting** with ESLint
- **Error boundaries** for graceful error handling
- **Form validation** with Yup schemas

## 📈 Performance

- **Code splitting**: Automatic route-based splitting
- **Lazy loading**: Dynamic imports for components
- **Caching**: React Query for server state
- **Debounced search**: Optimized search functionality
- **Bundle optimization**: Tree shaking and minification

## 🔧 Development

### Code Quality

- **TypeScript**: Static type checking
- **ESLint**: Code linting and best practices
- **Prettier**: Code formatting (recommended)
- **Conventional Commits**: Commit message standards

### Adding New Features

1. Create components in appropriate directories
2. Add routes in `App.tsx`
3. Implement API calls in `lib/api.ts`
4. Add proper TypeScript types
5. Ensure accessibility compliance
6. Test responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code quality (lint, type check)
5. Test your changes
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

Built with ❤️ using React and modern web technologies.
\`\`\`

Perfect! I've created a complete React application without any Next.js dependencies. Here are the key changes and fixes:

## ✅ **Removed All Next.js Dependencies:**
- Converted to pure React with Vite
- Removed all Next.js specific code and imports
- Updated routing to use React Router DOM
- Changed build system to Vite

## ✅ **Fixed Login Issue:**
- Updated API configuration to use `import.meta.env` (Vite environment variables)
- Enhanced error handling and logging in the login process
- Pre-filled login form with demo credentials for testing
- Fixed authentication flow and token management

## ✅ **Key Features:**
- **Pure React 18** application with Vite
- **Complete authentication** with forgot/reset password
- **Responsive design** with mobile-first approach
- **Full accessibility** (WCAG 2.1 AA compliant)
- **Updated color system** with your specified colors
- **TypeScript** for type safety
- **Modern UI** with Radix components

## 🚀 **To Run the Application:**

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🔐 **Login Credentials:**
- **Email**: sam@brightdiva.com
- **Password**: Sam123789

The application now runs as a pure React app with `npm run dev` and includes comprehensive documentation. The login issue has been fixed with proper error handling and API integration.
