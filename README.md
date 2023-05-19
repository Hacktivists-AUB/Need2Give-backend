# Need2Give-frontend
<div align="center">
  <img src="./logo.png">
</div>
<br/>

Need2Give aims to bridge the gap between donation centers and users. Our goal is to provide a platform for users to connect with donation centers and donation centers to promote their items.

## Prerequisites
- Have [NodeJS](https://nodejs.org) and [npm](https://www.npmjs.com/) installed
- Have [PostgreSQL](https://www.postgresql.org) installed and running

## Setup
Follow these steps to setup and run the project locally:

1. Clone the repository
```sh
git clone https://github.com/Hacktivists-AUB/Need2Give-frontend
```

2. Install dependencies
```sh
npm install
```

3. Create a PostgreSQL database
To do that, simply run the following sql query:
```sql
CREATE DATABASE <database_name>;
```

4. Configure environment variables

Create a `.env` file in the project root directory with the same content as the [.env.sample](.env.sample), and configure its fields according to your setup.
 
5. Run migrations
```sh
npm run migrate:latest
```
For more information on other migration options, run the following command
```sh
npm run migrate
```

6. Seed the database (optional)
```sh
npm run seed
```

## Usage
The following command should be simple enough in development:
```sh
npm start
```

The following commands should be better in production for efficiency purposes:
```sh
npx tsc --outDir build
node build/index.js
```

## License
This project is licensed under the [GNU General Public License v3.0](https://github.com/Hacktivists-AUB/Need2Give-frontend/blob/main/LICENSE).
