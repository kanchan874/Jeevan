const twilio = require('twilio');

// In-memory log of simulated SMS sent (useful for frontend demonstration)
const simulatedSMSLogs = [];

/**
 * Sends a fallback SMS to a phone number.
 * Uses Twilio if credentials are set, otherwise logs it and stores it in the simulation outbox.
 */
const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const logEntry = {
    id: '_' + Math.random().toString(36).substr(2, 9),
    to: to,
    body: body,
    timestamp: new Date(),
    status: 'Simulated'
  };

  if (accountSid && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: body,
        from: fromNumber,
        to: to.startsWith('+') ? to : `+91${to}` // Default to Indian prefix if not present
      });
      console.log(`[SMS Success] Real SMS sent to ${to}. Message SID: ${message.sid}`);
      logEntry.status = 'Sent';
      logEntry.sid = message.sid;
      simulatedSMSLogs.push(logEntry);
      return { success: true, realSMS: true, messageSid: message.sid };
    } catch (error) {
      console.error(`[SMS Error] Twilio sending failed: ${error.message}`);
      logEntry.status = `Failed: ${error.message}`;
      simulatedSMSLogs.push(logEntry);
      return { success: false, error: error.message };
    }
  } else {
    // Simulation / Fallback Mode
    console.log('\n=================== SIMULATED SMS SENT ===================');
    console.log(`TO: ${to}`);
    console.log(`BODY: ${body}`);
    console.log('==========================================================\n');
    
    logEntry.status = 'Simulated';
    simulatedSMSLogs.push(logEntry);
    
    // Keep log size reasonable (last 50 messages)
    if (simulatedSMSLogs.length > 50) {
      simulatedSMSLogs.shift();
    }

    return { success: true, realSMS: false, simulated: true };
  }
};

/**
 * Returns all simulated SMS logs.
 */
const getSimulatedLogs = () => {
  return simulatedSMSLogs;
};

module.exports = {
  sendSMS,
  getSimulatedLogs
};
