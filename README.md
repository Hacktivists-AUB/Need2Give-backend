# Need2Give-backend

## Prerequisites
Node.js
npm
PostgreSQL

## Setup & Installation
Follow these steps to set up and run the project locally:

**1. Clone the repository:** Clone the forked repository to your local machine using the following command:

```git clone [URL-of-your-forked-repo]```

**2. Install dependencies:** Navigate to the project directory and run the following command to install the required dependencies:

`npm install`

**3. Set up PostgreSQL:** Create a new PostgreSQL database and run it on your local machine. Make sure to note the database name, user, and password.

**4. Configure environment variables:** Create a .env file in the project root directory with the same contents as the provided `.env.sample` file. Fill in the required values, such as database name, user, password, encryption key, and other settings.
 
**5. Run migrations:** In the terminal, run the following command to apply the database migrations:

`npm run migrate:up`

**6. Seed the database:** Run the following command to seed the database with initial data:

`npm run seed`

**7. Start the server:** Finally, run the following command to start the backend server:

`npm start`

Now, your backend server should be running at http://localhost:5555.

