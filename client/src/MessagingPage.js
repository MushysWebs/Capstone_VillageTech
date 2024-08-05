import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import './Dashboard.css';

const MessagingPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const supabase = useSupabaseClient();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('MessagingPage useEffect triggered');
    fetchContacts();
    
    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => handleNewMessage(payload)
      )
      .subscribe();

    return () => {
      console.log('Cleaning up MessagingPage');
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    console.log('Fetching contacts...');
    try {
      const { data, error } = await supabase.from('contacts').select('*');
      if (error) throw error;
      console.log('Fetched contacts:', data);
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const fetchMessages = async (contactId) => {
    console.log('Fetching messages for contact:', contactId);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .or(`sender_id.eq.${contactId},recipient_id.eq.${contactId}`);
      if (error) throw error;
      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  const handleNewMessage = (payload) => {
    console.log('New message received:', payload);
    setMessages(prevMessages => [...prevMessages, payload.new]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          { content: newMessage, sender_id: 'your_user_id', recipient_id: selectedContact.id }
        ]);
      if (error) throw error;
      console.log('Message sent:', data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="messaging-page">
      <h1>Messaging Page</h1>
      <div className="contacts-list">
        <h2>Contacts ({contacts.length})</h2>
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
            onClick={() => setSelectedContact(contact)}
          >
            {contact.name}
          </div>
        ))}
      </div>
      <div className="chat-area">
        {selectedContact ? (
          <>
            <h2>{selectedContact.name}</h2>
            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.sender_id === 'your_user_id' ? 'sent' : 'received'}`}>
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
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select a contact to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;