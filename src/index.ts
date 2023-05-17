import config from './config';
import app from './api';

app.listen(config.SERVER_PORT, () => {
  console.log(`Listening at http://${config.SERVER_HOST}:${config.SERVER_PORT}`);
});
