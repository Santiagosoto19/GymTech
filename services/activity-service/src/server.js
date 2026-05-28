const app = require('./app');
const config = require('./config');

const PORT = config.port || 3003;

app.listen(PORT, () => {
  console.log(`Activity Service running on port ${PORT}`);
});
