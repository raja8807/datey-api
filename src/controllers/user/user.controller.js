const supabaseAdmin = require('../../libs/supabaseAdmin');
const supabaseClient = require('../../libs/supabaseClient');

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res
        .status(401)
        .json({ error: 'Authentication required: No user email found' });
    }

    const userId = req.user?.user_metadata?.user_id;
    if (!userId) return res.status(200).json(null);

    const supabase = supabaseClient(req.accessToken);

    // Try to fetch the user and include any relational user_preferences -> preferences if set up
    const { data: userData, error: userError } = await supabase
      .from('users')

      .select(
        `
         *,
         user_preferences (*)
        `,
      )
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Supabase error fetching user:', userError);
      // handle known PostgREST error codes if needed
      if (userError.code === 'PGRST116') return res.status(404).json(null);
      return res
        .status(500)
        .json({ error: 'Database error', details: userError.message });
    }

    if (!userData) return res.status(200).json(null);

    // Build interest_details from whichever structure you use
    let interestDetails = [];

    // Case A: nested relational preferences via user_preferences -> preferences
    if (
      Array.isArray(userData.user_preferences) &&
      userData.user_preferences.length > 0
    ) {
      // collect nested preference objects if available
      const nested = userData.user_preferences
        .map((up) => up.preferences || up.interest || null)
        .filter(Boolean);

      if (nested.length > 0) {
        interestDetails = nested;
      }
    }

    // Case B: user has an array of interest IDs on the users table (users.interests)
    if (
      interestDetails.length === 0 &&
      Array.isArray(userData.interests) &&
      userData.interests.length > 0
    ) {
      const { data: interestsFromTable, error: interestsError } = await supabase
        .from('interests') // or 'preferences' depending on your master table name
        .select('*')
        .in('id', userData.interests);

      if (interestsError) {
        console.error('Error fetching interests by IDs:', interestsError);
        // Fall back to empty array but still return user
        interestDetails = [];
      } else {
        interestDetails = interestsFromTable || [];
      }
    }

    // Final response: ensure interest_details always present as an array
    const safeUser = {
      ...userData,
      interest_details: interestDetails,
    };

    return res.status(200).json(safeUser);
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);

    if (err?.message?.includes('JWT')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (
      err?.message?.toLowerCase().includes('network') ||
      err?.message?.toLowerCase().includes('connection')
    ) {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }

    return res
      .status(500)
      .json({ error: 'Internal server error', message: err.message });
  }
};

// exports.getCurrentUser = async (req, res) => {
//   try {
//     if (!req.user.email) {
//       return res.status(401).json({
//         error: 'Authentication required: No user email found',
//       });
//     }

//     if (req.user?.user_metadata?.user_id) {
//       const supabase = supabaseClient(req.accessToken);

//       // Fetch user
//       const { data: userData, error: userError } = await supabase
//         .from('users')
//         .select(
//           `
//          *,
//          user_preferences (*)
//         `,
//         )
//         .eq('id', req?.user?.user_metadata?.user_id || null)
//         .limit(1);

//       if (userError) {
//         console.error('Supabase error:', userError);

//         if (userError.code === 'PGRST116') {
//           return res.status(404).json(null);
//         }

//         return res.status(500).json({
//           error: 'Database error',
//           details: userError.message,
//         });
//       }

//       const user = userData[0];
//       if (!user) return res.status(200).json(null);

//       // If no interests, return user directly
//       if (!user.interests || user.interests.length === 0) {
//         return res.status(200).json({
//           ...user,
//           interest_details: [],
//         });
//       }

//       // Fetch interest names using the array of IDs
//       const { data: interestDetails, error: interestsError } = await supabase
//         .from('interests')
//         .select('*')
//         .in('id', user.interests);

//       if (interestsError) {
//         console.log('Interests fetch error ->', interestsError);

//         return res.status(200).json({
//           ...user,
//           interest_details: [],
//         });
//       }

//       return res.status(200).json({
//         ...user,
//         interest_details: interestDetails,
//       });
//     }

//     return res.status(200).json(null);
//   } catch (err) {
//     console.error('Unexpected error in getCurrentUser:', err.message);

//     if (err.message.includes('JWT')) {
//       return res.status(401).json({
//         error: 'Invalid or expired token',
//       });
//     }

//     if (err.message.includes('network') || err.message.includes('connection')) {
//       return res.status(503).json({
//         error: 'Service temporarily unavailable',
//       });
//     }

//     return res.status(500).json({
//       error: 'Internal server error',
//       message: err.message,
//     });
//   }
// };

exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, age, gender, preferences, interests = [] } = req.body;

    // Convert objects → array of IDs
    const interestIds = interests.map((i) => i.id) || [];

    const supabase = supabaseClient(req.accessToken);

    // 1. Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('app_email', req.user.email)
      .limit(1);

    if (selectError) {
      console.log('Select error ->', selectError);
      throw selectError;
    }

    let updatedUser;

    if (existingUser && existingUser.length > 0) {
      // 2. User exists → update it
      const userId = existingUser[0].id;

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          name,
          age,
          gender,
          interests: interestIds, // ✅ save interest IDs
        })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.log('Update error ->', updateError);
        throw updateError;
      }

      [updatedUser] = data;

      if (preferences) {
        const updatedPreference = await supabase
          .from('user_preferences')
          .update({
            user_id: updatedUser.id,
            ...preferences,
          })
          .eq('user_id', updatedUser.id)
          .select('*');
        console.log('upated---->>', updatedPreference);
      }
    } else {
      // 3. User does NOT exist → create one
      const phone = req.user.email.split('@')[0];

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          app_email: req.user.email,
          name,
          age,
          gender,
          phone,
          interests: interestIds, // ✅ save interests on create
        })
        .select();

      if (insertError) {
        console.log('Insert error ->', insertError);
        throw insertError;
      }

      [updatedUser] = data;

      // Update Auth user (service role)
      await supabaseAdmin.auth.admin.updateUserById(req.user.sub, {
        phone,
        phone_confirm: false,
        display_name: updatedUser.name,
        user_metadata: {
          user_id: updatedUser.id,
        },
      });

      const createdPreference = await supabase.from('user_preferences').insert({
        user_id: updatedUser.id,
      });

      console.log('created--->>', createdPreference);
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

// exports.updateCurrentUserInterests = async (req, res) => {
//   try {
//     const { interests } = req.body;
//     const userId = req.user.id;

//     const supabase = supabaseClient(req.accessToken);

//     // Validate: interest IDs must exist in interests table
//     const { data: validInterests, error: fetchError } = await supabase
//       .from("interests")
//       .select("id")
//       .in("id", interests);

//     if (fetchError) throw fetchError;

//     const validIds = validInterests.map(i => i.id);

//     // Update user record
//     const { data, error: updateError } = await supabase
//       .from("users")
//       .update({ interests: validIds })
//       .eq("id", userId)
//       .select("id, interests");

//     if (updateError) throw updateError;

//     return res.status(200).json({
//       message: "Interests updated successfully",
//       user: data[0],
//     });

//   } catch (err) {
//     return res.status(500).json({
//       error: "Internal server error",
//       message: err.message,
//     });
//   }
// };
