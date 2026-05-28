const app = require('./app');
const config = require('./config');

const PORT = config.port || 3004;

app.listen(PORT, () => {
  console.log(`Reporting Service running on port ${PORT}`);
});
