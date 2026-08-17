import React, { createContext, useState, useEffect } from 'react';

export const LiveAlertContext = createContext();

export const LiveAlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const streamUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/requests/live-stream';
    let eventSource = null;

    try {
      console.log(`[SSE Frontend] Connecting to SSE stream: ${streamUrl}`);
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('connected', (e) => {
        console.log('[SSE Frontend] Connected to Live Event Stream:', e.data);
        setIsConnected(true);
      });

      // Handle real-time donor status toggles
      eventSource.addEventListener('donor_status_changed', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const data = payload.data;
          console.log('[SSE Event: donor_status_changed]', data);

          if (data.isAvailable) {
            const newAlert = {
              id: Date.now() + Math.random(),
              type: 'donor_available',
              title: '🚨 Live Donor Proximity Alert!',
              message: `Donor (${data.bloodGroup}) just went AVAILABLE in ${data.location || 'your area'}!`,
              bloodGroup: data.bloodGroup,
              location: data.location,
              timestamp: new Date()
            };

            setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
          }
        } catch (err) {
          console.error('Error parsing SSE donor_status_changed event:', err);
        }
      });

      // Handle real-time emergency request creation
      eventSource.addEventListener('emergency_request_created', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const data = payload.data;
          console.log('[SSE Event: emergency_request_created]', data);

          const newAlert = {
            id: Date.now() + Math.random(),
            type: 'emergency_created',
            title: '🩸 Urgent Emergency Request Posted',
            message: `${data.unitsRequired} units of ${data.bloodGroup} needed at ${data.hospitalAddress || 'Hospital'} (${data.urgency || 'High'} Urgency)`,
            bloodGroup: data.bloodGroup,
            hospitalAddress: data.hospitalAddress,
            urgency: data.urgency,
            timestamp: new Date()
          };

          setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
        } catch (err) {
          console.error('Error parsing SSE emergency_request_created event:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('[SSE Frontend Warning] Stream connection error. Reconnecting...', err);
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to initialize SSE stream:', err);
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const triggerTestAlert = () => {
    const testAlert = {
      id: Date.now() + Math.random(),
      type: 'donor_available',
      title: '🚨 Real-Time Stream Demo Alert',
      message: 'Donor Ramesh K. (O+ Universal) just switched to AVAILABLE 1.8 km near your location!',
      bloodGroup: 'O+',
      location: 'Nearby Emergency Zone',
      timestamp: new Date()
    };
    setAlerts((prev) => [testAlert, ...prev.slice(0, 4)]);
  };

  return (
    <LiveAlertContext.Provider value={{ alerts, isConnected, dismissAlert, triggerTestAlert }}>
      {children}
    </LiveAlertContext.Provider>
  );
};
