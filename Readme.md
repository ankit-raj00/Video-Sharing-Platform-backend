

# Video Sharing Platform Backend

Description:  
This is the backend API for a video-sharing platform, built using Node.js with Express. It provides functionalities like user authentication, video management, comment handling, subscription management, playlist management, and a user dashboard. The backend leverages JWT authentication, file uploads using Multer, and offers secure routes for authenticated users.

---

## Features:

1. **User Management**:  
   - Sign up, login, update profile, change password, and track watch history.

2. **Video Management**:  
   - Upload, update, delete, and publish/unpublish videos with video file and thumbnail support.

3. **Comment Management**:  
   - Add, update, and delete comments on videos.

4. **Like/Dislike System**:  
   - Users can like or dislike videos and comments.

5. **Subscription Management**:  
   - Subscribe to channels, manage subscriptions, and track subscribers.

6. **Playlist Management**:  
   - Create, update, delete playlists and add/remove videos to/from playlists.

7. **Dashboard**:  
   - View channel statistics and uploaded videos.

---

## Technologies Used:

- Node.js (JavaScript runtime environment)  
- Express.js (Web framework)  
- JSON Web Tokens (JWT) for authentication  
- Multer (File upload middleware)  
- MongoDB (Database)

---

## Installation Steps:

1. **Clone the Repository:**  
   ```
   git clone https://github.com/ankit-raj00/backend.git
   cd backend
   ```

2. **Install Dependencies:**  
   Ensure Node.js is installed, then run:  
   ```
   npm install
   ```

3. **Set Up Environment Variables:**  
   Create a `.env` file in the root directory and define the following:

   ```
   PORT=8000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   ```

4. **Start the Server:**  
   For Development:  
   ```
   npm run dev
   ```  
   For Production:  
   ```
   npm start
   ```

   The server will run at `http://localhost:8000`.

---

## Available API Routes:

### User Routes:  
- Register a new user: POST `/api/v1/users/register`  
- Log in a user: POST `/api/v1/users/login`  
- Get current user details: GET `/api/v1/users/current-user`  
- Change password: POST `/api/v1/users/change-password`  
- Update account: PATCH `/api/v1/users/update-account`  

### Video Routes:  
- Upload a new video: POST `/api/v1/videos`  
- Get all videos: GET `/api/v1/videos`  
- Update video details: PATCH `/api/v1/videos/:videoId`  
- Delete a video: DELETE `/api/v1/videos/:videoId`  

### Comment Routes:  
- Add a comment: POST `/api/v1/comments/:videoId`  
- Update a comment: PATCH `/api/v1/comments/c/:commentId`  
- Delete a comment: DELETE `/api/v1/comments/c/:commentId`  

### Subscription Routes:  
- Subscribe to a channel: POST `/api/v1/subscriptions/c/:channelId`  
- Get channel subscribers: GET `/api/v1/subscriptions/c/:channelId`  

---

## Package Details:

**Scripts**:  
- `npm run dev`: Starts the development server with live reloading.  
- `npm start`: Starts the production server.

**Dependencies**:  
- bcrypt  
- cloudinary  
- cookie-parser  
- cors  
- dotenv  
- express  
- jsonwebtoken  
- mongoose  
- mongoose-aggregate-paginate-v2  
- multer  

**Dev Dependencies**:  
- nodemon  
- prettier  

---

## License:  
This project is licensed under the MIT License.  

--- 

