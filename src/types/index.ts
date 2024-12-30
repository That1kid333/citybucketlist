export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  phone: string;
  userType: 'rider' | 'driver';
}

export interface Driver extends User {
  isActive?: boolean;
  vehicle?: Vehicle;
  driversLicense?: DriversLicense;
  backgroundCheck?: BackgroundCheck;
  locationName?: string;
  responseTime?: number;
  totalHours?: number;
  upcomingRides?: Ride[];
  notifications?: Notification[];
}

export interface Rider extends User {
  firstName: string;
  lastName: string;
  uid: string;
  savedLocations?: Location[];
  paymentMethods?: PaymentMethod[];
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  insurance?: Insurance;
  registration?: Registration;
}

export interface DriversLicense {
  number: string;
  expirationDate: string;
  state: string;
  documentUrl?: string;
}

export interface BackgroundCheck {
  status: 'pending' | 'approved' | 'rejected';
  completedDate?: string;
  documentUrl?: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  expirationDate: string;
  documentUrl: string;
}

export interface Registration {
  expirationDate: string;
  documentUrl: string;
}

export interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled';
  passengers: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatInterface {
  riderId: string;
  riderName: string;
  messages: ChatMessage[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => Promise<void>;
}
