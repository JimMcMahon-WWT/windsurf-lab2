const app = require('./app');
const { connectDB } = require('./config/db');
const config = require('./config/config');

// Connect to MongoDB
connectDB();

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.server.env} mode on port ${PORT}`);
  console.log(`   API Version: ${config.server.apiVersion}`);
  console.log(`   Access: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
