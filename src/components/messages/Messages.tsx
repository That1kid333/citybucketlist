import { User } from 'firebase/auth';

export interface MessagesProps {
  user: User;
  userType: 'driver' | 'rider' | 'admin';
}

export function Messages(props: MessagesProps) {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="text-neutral-400">
          Logged in as: {props.user.email} ({props.userType})
        </div>
        {/* Messages implementation */}
      </div>
    </div>
  );
}
