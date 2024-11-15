import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useLocation } from 'react-router-dom';
import './MessagingPage.css';

const MessagingPage = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUserStaff, setCurrentUserStaff] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  const supabase = useSupabaseClient();
  const session = useSession();
  const messagesContainerRef = useRef(null); 
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const channelRef = useRef(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCurrentUserStaff(session.user.id);
      fetchStaff();
    }
  }, [session]);

  useEffect(() => {
    if (currentUserStaff) {
      fetchAllLastMessages();
    }
  }, [currentUserStaff]);

  const fetchAllLastMessages = async () => {
    if (!currentUserStaff) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserStaff.user_id},recipient_id.eq.${currentUserStaff.user_id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const messageMap = {};
      data.forEach(message => {
        const otherUserId = message.sender_id === currentUserStaff.user_id 
          ? message.recipient_id 
          : message.sender_id;
        
        if (!messageMap[otherUserId]) {
          messageMap[otherUserId] = message;
        }
      });

      setLastMessages(messageMap);
    } catch (error) {
      console.error('Error fetching last messages:', error);
    }
  };

  const sortedStaff = [...staff].sort((a, b) => {
    const lastMessageA = lastMessages[a.user_id];
    const lastMessageB = lastMessages[b.user_id];
    
    if (!lastMessageA && !lastMessageB) return 0;
    if (!lastMessageA) return 1;
    if (!lastMessageB) return -1;
    
    return new Date(lastMessageB.created_at) - new Date(lastMessageA.created_at);
  });

  useEffect(() => {
    if (location.state?.selectedStaffId) {
      const selectedStaff = staff.find(s => s.user_id === location.state.selectedStaffId);
      if (selectedStaff) {
        setSelectedStaff(selectedStaff);
      }
    }
  }, [staff, location.state]);

  useEffect(() => {
    if (location.state?.selectedStaffId) {
      const selectedStaff = staff.find(s => s.user_id === location.state.selectedStaffId);
      if (selectedStaff) {
        setSelectedStaff(selectedStaff);
      }
    }
  }, [staff, location.state]);

  // set up real-time channel
  useEffect(() => {
    if (currentUserStaff) {
      const channel = supabase.channel(`chat:${currentUserStaff.user_id}`, {
        config: {
          broadcast: { self: true }
        }
      });

      channel
        .on('broadcast', { event: 'new-message' }, ({ payload }) => {
          console.log('Received message:', payload);
          if (
            (payload.sender_id === selectedStaff?.user_id && payload.recipient_id === currentUserStaff.user_id) ||
            (payload.sender_id === currentUserStaff.user_id && payload.recipient_id === selectedStaff?.user_id)
          ) {
            setMessages(prevMessages => {
              const messageExists = prevMessages.some(msg => msg.id === payload.id);
              if (!messageExists) {
                // update last messages when a new message is received
                setLastMessages(prev => ({
                  ...prev,
                  [selectedStaff.user_id]: payload
                }));
                return [...prevMessages, payload];
              }
              return prevMessages;
            });
          }
        })
        .subscribe();

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }
  }, [currentUserStaff, selectedStaff]);

  useEffect(() => {
    if (selectedStaff && currentUserStaff) {
      fetchMessages();
    }
  }, [selectedStaff, currentUserStaff]);

  useEffect(() => {
    if (messages.length > 0 && selectedStaff) {
      markMessagesAsRead();
    }
  }, [messages, selectedStaff]);

  const fetchCurrentUserStaff = async (userId) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching current user staff:', error);
    } else {
      setCurrentUserStaff(data);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).toUpperCase();
  };

  const formatLastMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = (staffMember) => {
    const lastMessage = lastMessages[staffMember.user_id];
    if (!lastMessage) return null;

    const isSender = lastMessage.sender_id === currentUserStaff?.user_id;
    const preview = lastMessage.content.length > 30 
      ? `${lastMessage.content.substring(0, 30)}...` 
      : lastMessage.content;

    return {
      content: preview,
      timestamp: formatLastMessageTime(lastMessage.created_at),
      isSender
    };
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*');
      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error.message);
      setError('Failed to fetch staff members');
    }
  };

  const fetchMessages = async () => {
    if (!currentUserStaff || !selectedStaff) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserStaff.user_id},sender_id.eq.${selectedStaff.user_id}`)
        .or(`recipient_id.eq.${currentUserStaff.user_id},recipient_id.eq.${selectedStaff.user_id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
      setError('Failed to fetch messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStaff || !currentUserStaff) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            content: newMessage, 
            sender_id: currentUserStaff.user_id, 
            recipient_id: selectedStaff.user_id,
            read: false
          }
        ])
        .select();

      if (error) throw error;

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new-message',
          payload: data[0]
        });
      }

      const recipientChannel = supabase.channel(`chat:${selectedStaff.user_id}`);
      await recipientChannel.send({
        type: 'broadcast',
        event: 'new-message',
        payload: data[0]
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!session?.user?.id || !selectedStaff) return;

    const unreadMessages = messages.filter(msg => 
      msg.recipient_id === session.user.id && !msg.read
    );

    if (unreadMessages.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (error) throw error;

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unreadMessages.some(unread => unread.id === msg.id) 
            ? { ...msg, read: true } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedStaff]);

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

return (
      <div className="messaging-page">
        <div className="mcontacts-list">
          <h2>Chat</h2>
          {error && <p className="error-message">{error}</p>}
          {sortedStaff.length === 0 && !error && <p>No staff members found.</p>}
          {sortedStaff.map(s => {
            const lastMessage = getLastMessagePreview(s);
            return (
              <div
                key={s.id}
                className={`mcontact-item ${selectedStaff?.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStaff(s)}
              >
                <img 
                  src={s.photo_url || "/floweronly.svg"} 
                  alt={s.full_name}
                  className="mcontact-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/floweronly.svg";
                  }}
                />
                <div className="mcontact-info">
                  <div className="mcontact-name">{s.full_name}</div>
                  <div className="mcontact-role">{s.role}</div>
                  {lastMessage && (
                    <div className="mcontact-preview">
                      <span className={`preview-text ${!lastMessage.read ? 'unread' : ''}`}>
                        {lastMessage.isSender && 'You: '}{lastMessage.content}
                      </span>
                      <span className="preview-time">{lastMessage.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      <div className="chat-area">
        {selectedStaff ? (
          <>
            <div className="chat-header">
              <h2>{selectedStaff.full_name}</h2>
            </div>
            <div className="messages-container" ref={messagesContainerRef}>
              {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="date-separator">{formatDate(date)}</div>
                  {dateMessages.map(message => (
                    <div key={message.id} className={`message ${message.sender_id === currentUserStaff.user_id ? 'sent' : 'received'}`}>
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-timestamp">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select a staff member to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;