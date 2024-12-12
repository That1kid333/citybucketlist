import React, { useState } from 'react';
import { List, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useMessaging } from '../../hooks/useMessaging';
import { Message } from '../../types/message';

interface MessagesProps {
  user: any;
  userType: 'rider' | 'driver';
}

export function Messages({ user, userType }: MessagesProps) {
  const [messageText, setMessageText] = useState('');
  const { chats, messages, sendMessage, selectedChatId, setSelectedChatId } = useMessaging(user?.id, userType);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChatId) return;
    
    await sendMessage({
      chatId: selectedChatId,
      content: messageText.trim(),
      senderId: user.id,
      senderType: userType,
      timestamp: new Date().toISOString(),
    });
    
    setMessageText('');
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))]">
      {/* Chat List */}
      <div className="w-1/4 border-r border-zinc-800 overflow-y-auto">
        <List
          className="bg-zinc-900 rounded-lg"
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              onClick={() => setSelectedChatId(chat.id)}
              className={`cursor-pointer hover:bg-zinc-800 transition-colors ${
                selectedChatId === chat.id ? 'bg-zinc-800' : ''
              }`}
            >
              <div className="p-4 text-white">
                <div className="font-semibold">
                  {userType === 'rider' ? chat.driverName : chat.riderName}
                </div>
                <div className="text-sm text-zinc-400">
                  {chat.lastMessage || 'No messages yet'}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === user.id
                        ? 'bg-[#C69249] text-white'
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {message.content}
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  icon={<SendOutlined />}
                  className="bg-[#C69249] text-white border-none hover:bg-[#B58239]"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
