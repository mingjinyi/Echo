import express from 'express';
import cors from 'cors';
import path from 'path';
import chatRoutes from './routes/chat';
import profileRoutes from './routes/profile';
import memoryRoutes from './routes/memory';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`回声 (Echo) server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
