/**
 * Server-Sent Events (SSE) Manager Service
 * Manages HTTP event-stream client connections and broadcasts live events
 */
const clients = new Set();

/**
 * Handle new SSE client connection
 */
const addClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for Nginx/Vercel

  // Send initial connection ACK
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Jeevan Real-Time Stream', timestamp: Date.now() })}\n\n`);

  clients.add(res);
  console.log(`[SSE Service] Client connected. Total active streams: ${clients.size}`);

  req.on('close', () => {
    clients.delete(res);
    console.log(`[SSE Service] Client disconnected. Total active streams: ${clients.size}`);
  });
};

/**
 * Broadcast event to all active connected clients
 * @param {string} eventType e.g., 'donor_status_changed', 'emergency_request_created'
 * @param {object} payload Event data object
 */
const broadcastEvent = (eventType, payload) => {
  if (clients.size === 0) return;

  const dataString = JSON.stringify({
    type: eventType,
    data: payload,
    timestamp: Date.now()
  });

  const sseMessage = `event: ${eventType}\ndata: ${dataString}\n\n`;

  for (const client of clients) {
    client.write(sseMessage);
  }

  console.log(`[SSE Service] Broadcasted "${eventType}" to ${clients.size} clients.`);
};

// Periodic keep-alive ping every 20 seconds to prevent connection drops
setInterval(() => {
  if (clients.size === 0) return;
  const ping = `: keep-alive ${Date.now()}\n\n`;
  for (const client of clients) {
    client.write(ping);
  }
}, 20000);

module.exports = {
  addClient,
  broadcastEvent,
  getActiveClientCount: () => clients.size
};
