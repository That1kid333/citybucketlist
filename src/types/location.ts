export interface Location {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
}

export const locations: Location[] = [
  {
    id: 'pittsburgh',
    name: 'Pittsburgh',
    region: 'Pennsylvania',
    description: 'Serving the greater Pittsburgh metropolitan area',
    image: 'https://images.unsplash.com/photo-1696167455419-1c0e5fb14c5a?w=800&auto=format&fit=crop'
  },
  {
    id: 'swfl',
    name: 'South West Florida',
    region: 'Florida',
    description: 'Serving Fort Myers, Naples, and surrounding areas',
    image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&auto=format&fit=crop'
  }
];