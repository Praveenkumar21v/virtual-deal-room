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
