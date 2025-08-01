# CalTrail - Calorie Tracking Application

CalTrail is a comprehensive calorie tracking application that allows users to log their daily food intake and get personalized nutrition guidance from certified nutritionists.

## 🚀 Features

### For Users
- **Food Logging**: Track daily calorie intake by logging meals and snacks
- **Nutrition Dashboard**: View daily, weekly, and monthly nutrition summaries
- **Goal Setting**: Set personal nutrition and weight goals
- **Progress Tracking**: Monitor calorie intake, macronutrients, and progress toward goals
- **Nutritionist Support**: Get personalized feedback and recommendations from assigned nutritionists

### For Nutritionists
- **Client Management**: Manage assigned users and track their progress
- **Nutrition Monitoring**: Review client food logs and nutrition data
- **Feedback System**: Provide comments and recommendations on user meal entries
- **Progress Analytics**: Generate reports and track client success

### For Administrators
- **User Management**: Manage all users in the system
- **Nutritionist Assignment**: Assign nutritionists to users
- **System Administration**: Oversee platform operations and analytics

## 🏗️ Architecture

### Backend (Node.js + Express)
- **API Server**: RESTful API with Express.js
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **Food Database**: Integration with USDA FoodData Central API
- **Security**: Helmet, rate limiting, input validation with Joi

### Frontend (React)
- **UI Framework**: React 18 with React Router for navigation
- **State Management**: React Context API for authentication
- **Data Fetching**: React Query for server state management
- **Styling**: Tailwind CSS for responsive design
- **Forms**: React Hook Form for form handling
- **Charts**: Recharts for nutrition visualizations

### Database Schema
- **Users**: User accounts with roles (USER, NUTRITIONIST, ADMIN)
- **Foods**: Food database with nutritional information
- **Meal Entries**: User food logs with quantity and timing
- **Comments**: Nutritionist feedback on user meals
- **Daily Summaries**: Cached daily nutrition totals

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- USDA FoodData Central API key (optional, for food database integration)

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/caltrail_db"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # USDA Food API (optional)
   USDA_API_KEY=your-usda-api-key-here
   USDA_API_URL=https://api.nal.usda.gov/fdc/v1
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database with sample data
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the client directory (optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## 🧪 Demo Accounts

After running the seed script, you can use these demo accounts:

### Admin
- **Email**: admin@caltrail.com
- **Password**: admin123

### Nutritionist
- **Email**: nutritionist@caltrail.com
- **Password**: nutritionist123

### Users
- **Email**: user1@caltrail.com - user5@caltrail.com
- **Password**: user123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (nutritionist/admin)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/nutrition-summary` - Get user nutrition summary
- `PUT /api/users/:id/assign-nutritionist` - Assign nutritionist (admin)

### Foods
- `GET /api/foods` - Get foods with search and pagination
- `GET /api/foods/:id` - Get food by ID
- `POST /api/foods` - Create custom food (nutritionist/admin)
- `GET /api/foods/search/usda` - Search USDA database
- `POST /api/foods/import/usda/:fdcId` - Import USDA food

### Meals
- `GET /api/meals/user/:userId` - Get user meal entries
- `POST /api/meals` - Create meal entry
- `PUT /api/meals/:id` - Update meal entry
- `DELETE /api/meals/:id` - Delete meal entry
- `GET /api/meals/user/:userId/daily/:date` - Get daily nutrition
- `GET /api/meals/user/:userId/weekly` - Get weekly nutrition

### Comments
- `GET /api/comments/meal/:mealEntryId` - Get meal comments
- `POST /api/comments` - Create comment (nutritionist)
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🔒 Security Features

- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Joi schema validation on all endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🌟 Key Features in Detail

### Nutrition Tracking
- Comprehensive food database with USDA integration
- Macro and micronutrient tracking
- Daily, weekly, and monthly summaries
- Progress visualization with charts

### Professional Guidance
- Certified nutritionist support
- Personalized meal recommendations
- Progress monitoring and feedback
- Goal adjustment based on results

### User Experience
- Intuitive, mobile-responsive design
- Fast food search and logging
- Real-time nutrition calculations
- Comprehensive progress dashboards

## 🚦 Development

### Available Scripts

**Backend**
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm test` - Run test suite

**Frontend**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technology Stack

**Backend Technologies**
- Node.js & Express.js
- PostgreSQL & Prisma ORM
- JWT Authentication
- Joi Validation
- bcrypt Password Hashing
- Helmet Security
- Morgan Logging
- CORS Support

**Frontend Technologies**
- React 18
- React Router DOM
- React Query
- React Hook Form
- Tailwind CSS
- Lucide React Icons
- Recharts
- React Toastify
- date-fns

## 📈 Future Enhancements

- **Mobile App**: React Native mobile application
- **Meal Planning**: Advanced meal planning features
- **Recipe Integration**: Recipe database and meal prep guides
- **Wearable Integration**: Sync with fitness trackers
- **AI Recommendations**: Machine learning-based nutrition suggestions
- **Social Features**: Community support and sharing
- **Advanced Analytics**: Detailed progress reports and insights
- **Telehealth Integration**: Video consultations with nutritionists

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📞 Support

For support, email support@caltrail.com or join our community discord server.
