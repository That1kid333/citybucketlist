import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { messagingService } from '../../services/messaging.service';
import { Chat, Message } from '../../types/message';
import { format } from 'date-fns';
import { Avatar, Button, Input, List, Typography, Divider } from 'antd';
import { SendOutlined, SearchOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = messagingService.subscribeToChats(
      user.uid,
      'driver',
      (updatedChats) => {
        setChats(updatedChats);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = messagingService.subscribeToMessages(
      selectedChat.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
      }
    );

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    await messagingService.sendMessage(selectedChat.id, {
      content: newMessage.trim(),
      senderId: user.uid,
      senderName: user.displayName || 'Unknown Driver',
      senderType: 'driver',
      timestamp: new Date().toISOString(),
      read: false,
    });

    setNewMessage('');
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    if (user) {
      await messagingService.markChatAsRead(chat.id, user.uid);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    // Implement driver search functionality
  };

  return (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4">
          <Title level={4}>Messages</Title>
          <Input
            placeholder="Search drivers..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            className="mb-4"
          />
        </div>
        <List
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => handleChatSelect(chat)}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? 'bg-gray-100' : ''
              }`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={chat.riderPhoto}
                    size="large"
                  >
                    {chat.riderName[0]}
                  </Avatar>
                }
                title={chat.riderName}
                description={chat.lastMessage}
              />
              <div className="text-right">
                <Text type="secondary">
                  {format(new Date(chat.lastMessageTime), 'HH:mm')}
                </Text>
                {chat.unreadCount > 0 && (
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center">
                <Avatar
                  src={selectedChat.riderPhoto}
                  size="large"
                >
                  {selectedChat.riderName[0]}
                </Avatar>
                <div className="ml-3">
                  <Title level={5} className="mb-0">
                    {selectedChat.riderName}
                  </Title>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.senderId === user?.uid
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === user?.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    <Text className={message.senderId === user?.uid ? 'text-white' : ''}>
                      {message.content}
                    </Text>
                    <div className="text-xs mt-1">
                      <Text type="secondary" className={message.senderId === user?.uid ? 'text-gray-200' : ''}>
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Text type="secondary">Select a chat to start messaging</Text>
          </div>
        )}
      </div>
    </div>
  );
};
