import app from './app.js';
import connectDB from './config/db.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

// Establish MongoDB Connection
connectDB();

// Start Express Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle Unhandled Rejections (like database connection issues)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down gracefully...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
// Trigger restart
});
