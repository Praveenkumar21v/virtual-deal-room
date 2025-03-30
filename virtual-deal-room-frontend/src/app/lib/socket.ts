import { io } from 'socket.io-client';

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
console.log('Connecting with token:', token);

const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  auth: { token },
  transports: ['websocket'], 
});

socket.on('connect', () => console.log('Socket connected'));
socket.on('connect_error', (err) => console.error('Socket connection error:', err));

export default socket;