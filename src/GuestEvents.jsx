import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import { notifyTicketCreated } from './api/sendTicket'; 

export default function GuestEvents() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // MISSING SPAM PROTECTION

  const fetchAllEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (!error) setEvents(data);
  };

  useEffect(() => { fetchAllEvents(); }, []);

  const handleRSVP = async (event) => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    setMessage('Processing RSVP...');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be logged in to RSVP.");
      setIsSubmitting(false);
      return;
    }

    // MISSING .select().single() requirement for the email API!
    const { data: newRsvp, error } = await supabase
      .from('rsvps')
      .insert([{ event_id: event.id, guest_id: user.id, status: 'Attending' }])
      .select() 
      .single(); 

    if (error) {
      setMessage('Failed to RSVP. You might have already registered!');
    } else {
      setMessage('Successfully RSVP\'d! Sending your ticket...');
      
      // MISSING EMAIL TRIGGER!
      await notifyTicketCreated({
        rsvpId: newRsvp.id,           
        guestEmail: user.email,       
        eventTitle: event.title,      
        eventDate: event.event_date   
      });
      setMessage('Ticket sent to your email!');
    }
    
    setIsSubmitting(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Available Events</h1>
      {message && (<div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>)}

      {events.length === 0 ? (<p>There are no upcoming events at the moment.</p>) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
              <p style={{ margin: '5px 0' }}><strong>Total Capacity:</strong> {event.max_capacity}</p>
              
              {/* MISSING DISABLED LOADING STATE */}
              <button 
                onClick={() => handleRSVP(event)} 
                disabled={isSubmitting}
                style={{ backgroundColor: isSubmitting ? '#cccccc' : '#007bff', color: 'white', marginTop: '10px', padding: '8px 12px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', borderRadius: '5px' }}>
                {isSubmitting ? "Sending..." : "RSVP 'Yes'"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}