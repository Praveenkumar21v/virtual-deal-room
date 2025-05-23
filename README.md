## Clone the Repository
Open your terminal and run the following command to clone the repository:

git clone [<repository-url>](https://github.com/Praveenkumar21v/virtual-deal-room.git)

## Server setup

npm init -y

cd mern-backend

npm install the required dependencies 

## Install Dependencies

Navigate to the backend directory and install the required packages:

npm install

## Environment Variables

Create a .env file in the root of the project and add the following environment variables:

MONGODB_URI=<your_mongodb_connection_string>
REDIS_HOST=<your_redis_host>
REDIS_PORT=<your_redis_port>
REDIS_USER=<your_redis_user>
REDIS_PASSWORD=<your_redis_password>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=30
JWT_COOKIE_EXPIRE=30
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
CLIENT_URL=<your_client_url>

# Database
## MongoDB Setup

Using MongoDB Atlas, follow these steps:

1. Create a new cluster.
2. Whitelist your IP address in the network access settings.
3. Create a database user with read and write access.
4. Obtain the connection string and replace <password> with your database user's password.

The application will automatically create the necessary collections (e.g., users, deals, messages, notifications) when you run the server for the first time.

## Redis Setup

Install Redis

Using a cloud-based Redis service. (https://app.redislabs.com/)


## Starting the Server

You can start the server using the following command:

 The server should now be running on http://localhost:8080 (or the port specified in your .env file).


## Cloudinary

# Cloudinary Cloud name

https://cloudinary.com/

Cloudinary Dashboard -> name

# Cloudinary Api key and Secret
Cloudinary Dashboard -> Go to API keys 


## Stripe

# Stripe secret key 

Stripe Dashboard -> Developers -> ApiKeys -> Secret Key

# Stripe Webhook

1. Go to Stripe CLI Downloads (https://docs.stripe.com/stripe-cli#install)


2. Download the Windows version (stripe.exe).zip file

3. Unzip the file and open with command prompt

4. stripe login

5. visit  https://dashboard.stripe.com/stripecli/confirm_auth?t=33ta7iWY6fgvusQpzry4Kh8L6vpfQJl1 to authorize 

6. stripe listen --forward-to http://localhost:8080/webhook  -> we get Stripe webhook


## API Endpoints to Test

You can use tools like Postman to test the API endpoints. Make sure to set the Authorization header with the Bearer token for protected routes.

1. # Authentication APIs (/auth) - From routes/authRoutes.js:
 
# GET /auth/me

Retrieve the current logged-in user's details.

Requires JWT token (protected route).

Send a GET request with a valid Authorization: Bearer <token> header.

Expected Response: 200 OK with user data (e.g., { success: true, data: { email, role } }).

# POST /auth/register

Register a new user.

Body: { "email": "test@example.com", "password": "password123", "role": "buyer" }

Send a POST request with the JSON body.

Expected Response: 201 Created with { success: true, token, role }.

## POST /auth/login

Log in a user and return a JWT token.

Body: { "email": "test@example.com", "password": "password123" }

Send a POST request with the JSON body.

Expected Response: 200 OK with { success: true, token, role }.

## POST /auth/logout

Log out the current user and invalidate the session.

Requires JWT token (protected route).

Send a POST request with a valid Authorization: Bearer <token> header.

Expected Response: 200 OK with { success: true, data: {} }.


2. # Deal Management APIs (/deals) - From routes/dealRoutes.js:

## GET /deals

Fetch all active deals (Pending or In Progress).

Requires JWT token.

Send a GET request with a valid token.

Expected Response: 200 OK with { success: true, count, data: [deals] }.

## POST /deals

Create a new deal.

Requires JWT token.

Body: { "title": "Test Deal", "description": "Test Description", "price": 1000, "seller": "<seller_id>" }

Send a POST request with the JSON body and token.

Expected Response: 201 Created with { success: true, data: { deal } }.

## GET /deals/:id

Fetch a specific deal by ID.

Requires JWT token.

Send a GET request with a valid deal ID (e.g., /deals/123).

Expected Response: 200 OK with { success: true, data: { deal } }.

## PUT /deals/:id

Update a specific deal.

Requires JWT token.

Body: { "price": 1500, "status": "In Progress" }

Send a PUT request with a valid deal ID and token.

Expected Response: 200 OK with { success: true, data: { updated_deal } }.

## PUT /deals/:dealId/status

Update the status for specific deal with an action performed.

Body: { "action": "accept" | "reject" }

Requires JWT token.

Send a PUT request with a valid deal ID and token.

Expected Response: 200 OK with { success: true, data: { updated_deal of status based on action } }.


3. # Chat APIs (/chat)- From routes/chatRoutes.js:

## GET /chat/:dealId

Fetch all messages for a deal.

Requires JWT token.

Send a GET request with a valid dealId (e.g., /chat/123).

Expected Response: 200 OK with { success: true, data: [messages] }.

## POST /chat/:dealId

Send a new message in a deal’s chat.

Requires JWT token.

Body: { "content": "Hello, this is a test message" }

Send a POST request with a valid dealId and token.

Expected Response: 201 Created with { success: true, data: { message } }.

## PUT /chat/:dealId/mark/:messageId

Mark a message as read.

Requires JWT token.

Send a PUT request with valid dealId and messageId (e.g., /chat/123/mark/456).

Expected Response: 200 OK with { success: true, data: { updated_message } }.

## GET /chat/:dealId/online

Check the online status of deal participants.

Requires JWT token.

Send a GET request with a valid dealId (e.g., /chat/123/online).

Expected Response: 200 OK with { success: true, data: { buyer: { id, online }, seller: { id, online } } }.


4. # Document APIs (/documents)- From routes/documentRoutes.js:

## POST /documents/:dealId

Upload a document to a deal.

Requires JWT token.

Body: Form-data with document field (e.g., a PDF file).

Send a POST request with a valid dealId, token, and file attachment.

Expected Response: 201 Created with { success: true, data: "cloudinary_url" }.

## GET /documents/:dealId

Fetch all documents for a deal.

Requires JWT token.

Send a GET request with a valid dealId (e.g., /documents/123).

Expected Response: 200 OK with { success: true, data: [documents] }.

5. Notification APIs (/notifications)- From routes/notificationRoutes.js:

## GET /notifications
Fetch unread notifications for the current user.

Requires JWT token.

Send a GET request with a valid token.

Expected Response: 200 OK with { success: true, data: [notifications] }.

## PUT /notifications/:id

Mark a notification as read.

Requires JWT token.

Send a PUT request with a valid notification ID (e.g., /notifications/123).

Expected Response: 200 OK with { success: true, data: { updated_notification } }.

6. Analytics APIs (/analytics)- From routes/analyticsRoutes.js:

## GET /analytics

Fetch deal statistics (admin only).

Requires JWT token and admin role.

Send a GET request with a valid admin token.

200 OK with { success: true, data: { completed, pending, inProgress, cancelled, userEngagement } }.

7. Payment APIs (/payments)- From routes/paymentRoutes.js:

## POST /payments/:dealId/intent

Create a Stripe payment intent for a deal.

Requires JWT token.

Send a POST request with a valid dealId and token.

Expected Response: 200 OK with { success: true, clientSecret }.

## POST /payments/webhook

Handle Stripe webhook events (e.g., payment succeeded).

Body: Raw JSON from Stripe (e.g., payment_intent.succeeded event).

Headers: stripe-signature for verification.

Use Stripe CLI to simulate a webhook event:
stripe trigger payment_intent.succeeded --override "metadata[dealId]=<dealId>"

Expected Response: 200 OK with { received: true }.

8. Health Check API

## GET /healthz

Check server health.

Send a GET request (no auth required).

Expected Response: 200 OK with { status: "ok" }.


# Additional Notes
 
1. Socket.IO is used for real-time communication in chat and notifications. Ensure that the client-side is set up to connect to the WebSocket server.

2. Cloudinary is used for document storage. Make sure to configure your Cloudinary account and set the environment variables accordingly.

3. Stripe is used for payment processing. Ensure you have set up your Stripe account and configured the necessary keys.


# Client Setup:

## Create a New Next.js Project

Use the following command to create a new Next.js project.

npx create-next-app@latest virtual-deal-room-frontend

cd virtual-deal-room-frontend

npm install all dependencies required

## Environment Variables

Create a .env.local file in the root of the frontend project and add the following environment variables:

NEXT_PUBLIC_API_URL = http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripe_publish_key
NEXT_PUBLIC_WS_URL=ws://localhost:8080

## Starting the Development Server
You can start the development server using the following command:

npm run dev

## Key Directories

/app: Contains the main application code, including pages and components.
/auth: Contains authentication-related components (login and registration).
/dashboard: Contains components related to the user dashboard, including analytics and deal management.
/components: Contains reusable UI components.
/context: Contains context providers for managing global state (authentication).
/lib: Contains utility functions and API calls.
/styles: Contains global styles and CSS files.

## API Integration

The frontend interacts with the backend API using Axios. The API calls are defined in the /lib/api.ts file. Here are some key functions:

# Authentication

login(email: string, password: string): Logs in a user.

register(email: string, password: string, role: string): Registers a new user.

logout(): Logs out the user.

getMe(): Fetches the current user's details.

# Deals

getDeals(): Fetches all deals.

createDeal(deal: Partial<Deal>): Creates a new deal.

getDeal(id: string): Fetches a specific deal.

updateDeal(id: string, data: Partial<Deal>): Updates a deal.

updateDealStatus(dealId: string, action: 'accept' | 'reject'): Updates the status of a deal.

# Chat

getMessages(dealId: string): Fetches messages for a specific deal.

sendMessage(dealId: string, content: string): Sends a message in a deal's chat.

# Documents

uploadDocument(dealId: string, formData: FormData): Uploads a document for a deal.

getDocuments(dealId: string): Fetches documents for a specific deal.

## Additional Notes
Socket.IO-client: The frontend uses Socket.IO for real-time communication in chat and notifications. Ensure that the WebSocket connection is established correctly.

Styling: The application uses Tailwind CSS for styling. Ensure that you have configured Tailwind CSS correctly in your project.

## Stripe test payment

card number: 4242 4242 4242 4242
expiry: 12/26 
cvv: 234 
zip: 10001

## # Stripe public key 

Stripe Dashboard -> Developers -> ApiKeys -> Public Key


# Virtual Deal Room Deployment

## Backend Deployment

1. Create a Dockerfile for the backend.

2. Open Google Cloud Console.

3. Complete billing setup.

4. Create a new project.

5. Navigate to APIs and Services → Library.

6. Enable Identity and Access Management (IAM) API.

7. Go to Cloud Run → Create a service.

8. Connect to the Git repository.

9. Select "Continuously deploy from a repository (source or function)".

10. Set up Cloud Build.

11. Choose Source Repository.

12. Configure Build Configuration (/mern-backend/Dockerfile).

13. Create a build.

14. Add .env variables.

15. Click Create.

16. Backend service is now live at:
https://virtual-deal-room-373024329505.us-central1.run.app


## Frontend Deployment

1. Create a Dockerfile for the frontend.

2. Open Google Cloud Console.

3. Complete billing setup.

4. Create a new project.

5. Navigate to APIs and Services → Library.

6. Enable Identity and Access Management (IAM) API.

7. Go to Cloud Run → Create a service.

8. Connect to the Git repository.

9. Select "Continuously deploy from a repository (source or function)".

10. Set up Cloud Build.

11. Choose Source Repository.

12. Configure Build Configuration (/mern-frontend/Dockerfile).

13. Create a build.

14. Add .env variables.

15. Click Create.

16. Frontend service is now live at:
https://client-deal-room-373024329505.us-central1.run.app

## Sample Credentials:

# Buyer
jack@gmail.com | Chandu@13k

# Seller
Chandu@gmail.com | Chandu@13k
# virtual-deal-room
