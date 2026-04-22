import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

export default function GuestEvents() {
  // 1. State to hold all available events
  const [events, setEvents] = useState([]);
  // 2. State to show a success message when they RSVP
  const [message, setMessage] = useState('');

  // --- FETCH ALL EVENTS ---
  const fetchAllEvents = async () => {
    // Notice we do NOT filter by host_id here, because Guests need to see EVERYONE'S events!
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true }); // Sorts by soonest date first

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // --- RSVP FUNCTION ---
  const handleRSVP = async (eventId) => {
    // 1. Find out which guest is clicking the button
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in to RSVP.");
      return;
    }

    // 2. Insert their RSVP into the database
    const { error } = await supabase
      .from('rsvps')
      .insert([
        { 
          event_id: eventId, 
          guest_id: user.id, 
          status: 'Attending' 
        }
      ]);

    if (error) {
      console.error('Error saving RSVP:', error);
      setMessage('Failed to RSVP. You might have already registered for this event!');
    } else {
      setMessage('Successfully RSVP\'d! See you there.');
      
      // 🚨 MEMBER 3 TAKE NOTE:
      // This is exactly where Member 3 will eventually add the code 
      // to trigger the EmailJS confirmation and generate the QR code!
    }
    
    // Make the message disappear after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  // --- UI (WHAT THE GUEST SEES) ---
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Available Events</h1>
      <p>Welcome, Guest! Browse upcoming events below.</p>

      {/* Show the success message if it exists */}
      {message && (
        <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>
          {message}
        </div>
      )}

      {events.length === 0 ? (
        <p>There are no upcoming events at the moment.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
              <p style={{ margin: '5px 0' }}><strong>Total Capacity:</strong> {event.max_capacity}</p>
              
              <button 
                onClick={() => handleRSVP(event.id)} 
                style={{ backgroundColor: '#007bff', color: 'white', marginTop: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
                RSVP 'Yes'
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}