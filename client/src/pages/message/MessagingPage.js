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
  const supabase = useSupabaseClient();
  const session = useSession();
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
      // create a channel for the current user
      const channel = supabase.channel(`chat:${currentUserStaff.user_id}`, {
        config: {
          broadcast: { self: true }
        }
      });

      // listen for new messages
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
                return [...prevMessages, payload];
              }
              return prevMessages;
            });
          }
        })
        .subscribe();

      channelRef.current = channel;

      // cleanup
      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      };
    }
  }, [currentUserStaff, selectedStaff]);

  // fetch initial messages when selecting a staff member
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
      // insert message into database
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

      // broadcast the new message to both sender and recipient channels
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new-message',
          payload: data[0]
        });
      }

      // also broadcast to recipient's channel
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="messaging-page">
      <div className="mcontacts-list">
        <h2>Chat</h2>
        {error && <p className="error-message">{error}</p>}
        {staff.length === 0 && !error && <p>No staff members found.</p>}
        {staff.map(s => (
          <div
            key={s.id}
            className={`mcontact-item ${selectedStaff?.id === s.id ? 'active' : ''}`}
            onClick={() => setSelectedStaff(s)}
          >
            <div className="mcontact-avatar">{s.full_name.charAt(0)}</div>
            <div className="mcontact-info">
              <div className="mcontact-name">{s.full_name}</div>
              <div className="mcontact-role">{s.role}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedStaff ? (
          <>
            <div className="chat-header">
              <h2>{selectedStaff.full_name}</h2>
            </div>
            <div className="messages-container">
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