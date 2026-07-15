require('dotenv').config();

const express = require('express');
const registrationsRoutes = require('./src/registrations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api/registrations', registrationsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'service-registration' });
});

app.listen(PORT, () => {
  console.log(`Service registration running on port ${PORT}`);
});
