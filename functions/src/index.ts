import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an existing admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can create other admins.'
    );
  }

  // Get user and add admin custom claim
  try {
    await admin.auth().setCustomUserClaims(data.uid, { admin: true });
    return {
      result: `Success! ${data.uid} has been made an admin.`
    };
  } catch (err) {
    throw new functions.https.HttpsError('internal', 'Error setting admin claim');
  }
});

// One-time setup function to create the first admin
export const createInitialAdmin = functions.https.onRequest(async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).send('Email parameter is required');
    return;
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    res.status(200).send(`Successfully set admin claim for ${email}`);
  } catch (error) {
    console.error('Error creating initial admin:', error);
    res.status(500).send('Error creating initial admin');
  }
});
