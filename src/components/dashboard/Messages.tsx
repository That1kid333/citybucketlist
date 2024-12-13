import React, { useState, useEffect } from 'react';
import { Tabs, List, Avatar, Badge, Input, Button } from 'antd';
import { User, Send } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../providers/AuthProvider';
import { Driver } from '../../types/driver';

export default function Messages() {
  const { user, rider } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user || !rider?.location) return;

    const driversQuery = query(
      collection(db, 'drivers'),
      where('location', '==', rider.location)
    );

    const unsubscribe = onSnapshot(driversQuery, (snapshot) => {
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Driver));
      setDrivers(driversData);
    }, (error) => {
      console.error('Error fetching drivers:', error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, rider?.location]);

  useEffect(() => {
    if (!user || !selectedDriver) return;

    const chatQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    }, (error) => {
      console.error('Error fetching messages:', error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, selectedDriver]);

  const sendMessage = async () => {
    if (!user || !selectedDriver || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        receiverId: selectedDriver.id,
        timestamp: serverTimestamp(),
        participants: [user.uid, selectedDriver.id]
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const items = [
    {
      key: '1',
      label: 'Recent Chats',
      children: (
        <div className="h-full flex flex-col">
          <List
            className="flex-grow overflow-y-auto"
            dataSource={messages}
            renderItem={(message) => (
              <List.Item className="cursor-pointer hover:bg-zinc-800 px-4">
                <List.Item.Meta
                  avatar={<Avatar icon={<User />} className="bg-zinc-700" />}
                  title={<span className="text-white">{message.senderId === user?.uid ? 'You' : selectedDriver?.firstName}</span>}
                  description={<span className="text-zinc-400">{message.text}</span>}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Available Drivers',
      children: (
        <div className="h-full flex flex-col">
          <List
            className="flex-grow overflow-y-auto"
            dataSource={drivers}
            renderItem={(driver) => (
              <List.Item 
                className="cursor-pointer hover:bg-zinc-800 px-4"
                onClick={() => setSelectedDriver(driver)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge 
                      dot 
                      color={driver.isOnline ? '#52c41a' : '#999'} 
                      offset={[-5, 32]}
                    >
                      <Avatar icon={<User />} className="bg-zinc-700" />
                    </Badge>
                  }
                  title={<span className="text-white">{driver.firstName} {driver.lastName}</span>}
                  description={<span className="text-zinc-400">{driver.location}</span>}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-full bg-zinc-900 text-white p-4">
      <div className="h-full flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="h-[calc(100vh-8rem)] overflow-hidden flex flex-col"
          />
        </div>
        
        {selectedDriver && (
          <div className="w-full md:w-2/3 flex flex-col h-[calc(100vh-8rem)]">
            <div className="bg-zinc-800 p-4 rounded-t-lg flex items-center">
              <Avatar icon={<User />} className="bg-zinc-700 mr-3" />
              <div>
                <div className="text-white font-medium">{selectedDriver.firstName} {selectedDriver.lastName}</div>
                <div className="text-zinc-400 text-sm">{selectedDriver.location}</div>
              </div>
            </div>
            
            <div className="flex-grow bg-zinc-800/50 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === user?.uid
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-b-lg flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPressEnter={sendMessage}
                className="flex-grow bg-zinc-700 border-zinc-600 text-white"
              />
              <Button
                type="primary"
                icon={<Send className="w-4 h-4" />}
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
