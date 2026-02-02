const express = require('express');
const { userRoutes } = require('./routes/users');
const { adminRoutes } = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SDLC Security Demo API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
