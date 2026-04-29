import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

export default function HostDashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from('events').select('*').eq('host_id', user.id);
      if (!error) setEvents(data); 
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async (e) => {
    e.preventDefault(); 
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('events')
      .insert([{ title: title, event_date: date, max_capacity: parseInt(capacity), host_id: user.id }]);

    if (!error) {
      setTitle(''); setDate(''); setCapacity(''); 
      fetchEvents(); 
    } else { alert('Failed to create event.'); }
  };

  const deleteEvent = async (eventId) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) fetchEvents();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Host Dashboard</h1>
      
      {/* THE MISSING CREATE FORM */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Create a New Event</h3>
        <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ padding: '8px' }}/>
          <input type="number" placeholder="Max Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min="1" style={{ padding: '8px' }}/>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>+ Create Event</button>
        </form>
      </div>

      <h3>Your Current Events</h3>
      {events.length === 0 ? (<p>You haven't created any events yet.</p>) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
              <h3>{event.title}</h3>
              <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
              <p>Capacity: {event.max_capacity}</p>
              <button onClick={() => deleteEvent(event.id)} style={{ backgroundColor: '#dc3545', color: 'white', marginTop: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Delete Event</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}