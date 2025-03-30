export interface User {
  _id: string;
  email: string;
  role: 'buyer' | 'seller';
}

export interface Seller {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}


export interface Deal {
  _id: string;
  title: string;
  description: string;
  price?: number;
  revenue?: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  buyer: string | User;
  seller: User | string;
  documents: { url: string; publicId: string; uploadedBy: string; access: 'buyer' | 'seller' | 'both' }[];
  createdAt: string;
}

export interface Message {
  _id: string;
  content: string;
  deal: string;
  sender: User;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  message: string;
  deal: string;
  read: boolean;
  createdAt: string;
}