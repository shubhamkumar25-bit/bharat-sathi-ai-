import 'dotenv/config';
import app from './app.js';

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`BharatSaathi API running on http://localhost:${PORT}`);
});