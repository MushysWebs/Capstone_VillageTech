import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './MessagingPage.css';

const MessagingPage = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();
  const session = useSession();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("Session:", session);
    console.log("Supabase client:", supabase);
    if (supabase && session) {
      fetchStaff();
      setupSubscription();
    } else {
      console.log("Supabase or session not available");
    }
  }, [supabase, session]);

  const setupSubscription = () => {
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const fetchStaff = async () => {
    try {
      console.log("Fetching staff...");
      const { data, error } = await supabase.from('staff').select('*');
      if (error) throw error;
      console.log("Fetched staff data:", data);
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error.message);
      setError('Failed to fetch staff. Please try again.');
    }
  };

  const fetchMessages = async () => {
    if (!selectedStaff || !session.user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .or(`sender_id.eq.${session.user.id},sender_id.eq.${selectedStaff.id}`)
        .or(`recipient_id.eq.${session.user.id},recipient_id.eq.${selectedStaff.id}`);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  const handleNewMessage = (payload) => {
    setMessages(prevMessages => [...prevMessages, payload.new]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStaff || !session.user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            content: newMessage, 
            sender_id: session.user.id, 
            recipient_id: selectedStaff.id 
          }
        ]);
      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  return (
    <div className="messaging-page">
      <div className="contacts-list">
        <div className="contacts-header">
          <h2>Chat</h2>
        </div>
        {error && <p className="error-message">{error}</p>}
        {staff.length === 0 && !error && <p>No staff members found.</p>}
        {staff.map(s => (
          <div
            key={s.id}
            className={`contact-item ${selectedStaff?.id === s.id ? 'active' : ''}`}
            onClick={() => setSelectedStaff(s)}
          >
            <img src={s.photo_url || "/floweronly.svg"} alt={s.full_name} className="contact-avatar" />
            {s.full_name}
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
              {messages.map(message => (
                <div key={message.id} className={`message ${message.sender_id === session.user.id ? 'sent' : 'received'}`}>
                  {message.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select a staff member to start messaging</p>
        )}
      </div>
      <div className="email-area">
        <h2>Village Vet ({session?.user?.email})</h2>
        <input
          type="text"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Write email..."
          className="email-input"
        />
      </div>
    </div>
  );
};

export default MessagingPage;