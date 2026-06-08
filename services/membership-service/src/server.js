const app = require('./app');
const config = require('./config');

const PORT = config.port || 3002;

app.listen(PORT, () => {
  console.log(`Membership Service running on port ${PORT}`);
});
