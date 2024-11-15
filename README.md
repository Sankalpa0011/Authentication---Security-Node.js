# Secrets - Starting Code

This project is a web application that allows users to share their secrets anonymously. It demonstrates various skills and technologies used in modern web development.

## Skills Gained

### Backend Development
- **Node.js**: Utilized for server-side scripting.
- **Express.js**: Used to create the server and handle routing.
- **MongoDB**: Implemented as the database to store user data and secrets.
- **Mongoose**: Used for object data modeling (ODM) to interact with MongoDB.
- **Environment Variables**: Managed sensitive information using `dotenv`.

### Authentication and Security
- **Passport.js**: Implemented for user authentication.
  - **Local Strategy**: Used for username and password authentication.
  - **Google OAuth 2.0**: Integrated Google authentication for users.
- **Session Management**: Managed user sessions using express-session
- **Password Hashing**: Secured passwords using passport-local-mongoose for hashing and salting.
- **Encryption**: Demonstrated the use of mongoose-encryption for encrypting sensitive data (commented out in the code).

### Frontend Development
- **EJS (Embedded JavaScript)**: Used as the templating engine to render dynamic content.
- **Bootstrap**: Utilized for responsive and modern UI design.
- **Font Awesome**: Included for scalable vector icons.

### Additional Skills
- **Version Control**: Managed code using Git and GitHub.
- **Error Handling**: Implemented error handling for various operations.
- **Middleware**: Used middleware functions in Express for session handling and authentication.

## Project Structure

```
.env
.gitignore
app.js
package.json
public/
    css/
        bootstrap-social.css
        styles.css
views/
    home.ejs
    login.ejs
    partials/
        footer.ejs
        header.ejs
    register.ejs
    secrets.ejs
    submit.ejs
```

## How to Run

1. **Clone the repository**:
    ```sh
    git clone https://github.com/your-username/secrets-starting-code.git
    cd secrets-starting-code
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Create a 

.env

 file in the root directory and add the following:
    ```env
    SESSION_SECRET=your_session_secret
    CLIENT_ID=your_google_client_id
    CLIENT_SECRET=your_google_client_secret
    ```

4. **Run the application**:
    ```sh
    node app.js
    ```

5. **Access the application**:
    Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the ISC License.

---

Feel free to contribute to this project by submitting issues or pull requests. Happy coding!
