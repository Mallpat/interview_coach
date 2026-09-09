export const registerInterviewSockets = (io) => {
  io.on('connection', (socket) => {
    // Join an interview room
    socket.on('join_session', ({ sessionId, role }) => {
      socket.join(sessionId);
      socket.emit('coach_status', {
        message: `AI Coach connected for ${role} round. Microphone and camera sensors active.`,
        timestamp: new Date().toISOString()
      });
    });

    // Receive live speech or camera telemetry
    socket.on('telemetry_update', ({ sessionId, fillerCount, gazeScore, speakingPace }) => {
      if (fillerCount > 4) {
        socket.emit('coach_nudge', {
          type: 'pacing',
          message: 'Pacing alert: Take a deliberate breath and pause rather than using filler words.',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Candidate requests a hint or clarification on the current question
    socket.on('request_hint', ({ sessionId, question }) => {
      socket.emit('coach_hint', {
        hint: `Focus on clarifying the core trade-off first, state your key assumptions, then walk through the implementation step-by-step using STAR.`,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });
};
