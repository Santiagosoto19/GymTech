const app = require('./app');
const config = require('./config');

const PORT = config.port || 3005;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
