import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

export default function HostDashboard() {
  // --- STATE VARIABLES ---
  const [events, setEvents] = useState([]);
  
  // New state variables for the Create Event form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');

  // --- FETCH EVENTS ---
  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user.id);

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data); 
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- CREATE EVENT FUNCTION ---
  const createEvent = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing when you click submit
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert the new event into Supabase
    const { error } = await supabase
      .from('events')
      .insert([
        { 
          title: title, 
          event_date: date, 
          max_capacity: parseInt(capacity), // Ensure capacity is saved as a number
          host_id: user.id 
        }
      ]);

    if (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Check console.');
    } else {
      // Clear the form boxes
      setTitle(''); 
      setDate(''); 
      setCapacity(''); 
      // Refresh the list so the new event appears instantly!
      fetchEvents(); 
    }
  };

  // --- DELETE EVENT FUNCTION ---
  const deleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    } else {
      fetchEvents();
    }
  };

  // --- UI (WHAT THE USER SEES) ---
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Host Dashboard</h1>
      <p>Welcome, Host! Manage your events below.</p>

      {/* --- CREATE EVENT FORM --- */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>Create a New Event</h3>
        <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Event Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ padding: '8px' }}
          />
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            style={{ padding: '8px' }}
          />
          <input 
            type="number" 
            placeholder="Max Capacity (e.g., 50)" 
            value={capacity} 
            onChange={(e) => setCapacity(e.target.value)} 
            required 
            min="1"
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
            + Create Event
          </button>
        </form>
      </div>

      {/* --- EVENT LIST --- */}
      <h3>Your Current Events</h3>
      {events.length === 0 ? (
        <p>You haven't created any events yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
              <p style={{ margin: '5px 0' }}><strong>Capacity:</strong> {event.max_capacity}</p>
              
              <button 
                onClick={() => deleteEvent(event.id)} 
                style={{ backgroundColor: '#dc3545', color: 'white', marginTop: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
                Delete Event
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}