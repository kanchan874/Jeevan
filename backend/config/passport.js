const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function () {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('[Passport Warning] Google OAuth Client ID or Secret is not configured. Google login will be disabled.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // If user doesn't exist, create a new user (with random/temporary coordinates and placeholder phone)
          // The user will be prompted to update their profile (blood group, location, phone) on first login
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@google.com`;
          
          // Check if email already registered via local email-password
          user = await User.findOne({ email });
          if (user) {
            // Update user with googleId to link account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email: email,
            phone: '9999999999', // Placeholder to satisfy requirement, user can edit on profile
            bloodGroup: 'O+',    // Placeholder, user can edit
            location: 'T Nagar, Chennai', // Placeholder
            coordinates: { lat: 13.0405, lng: 80.2337 }, // Default coordinates
            isAvailable: true
          });

          return done(null, user);
        } catch (error) {
          console.error('[Passport Strategy Error]', error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
