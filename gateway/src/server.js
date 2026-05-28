const app = require('./app');
const config = require('./config');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
