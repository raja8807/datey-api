const supabaseAdmin = require('../../libs/supabaseAdmin');
const supabaseClient = require('../../libs/supabaseClient');

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user.email) {
      return res.status(401).json({
        error: 'Authentication required: No user email found',
      });
    }

    const supabase = supabaseClient(req.accessToken);

    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('app_email', req.user.email)
      .limit(1);

    if (userError) {
      console.error('Supabase error:', userError);

      if (userError.code === 'PGRST116') {
        return res.status(404).json(null);
      }

      return res.status(500).json({
        error: 'Database error',
        details: userError.message,
      });
    }

    const user = userData[0];
    if (!user) return res.status(200).json(null);

    // If no interests, return user directly
    if (!user.interests || user.interests.length === 0) {
      return res.status(200).json({
        ...user,
        interest_details: [],
      });
    }

    // Fetch interest names using the array of IDs
    const { data: interestDetails, error: interestsError } = await supabase
      .from('interests')
      .select('*')
      .in('id', user.interests);

    if (interestsError) {
      console.log('Interests fetch error ->', interestsError);

      return res.status(200).json({
        ...user,
        interest_details: [],
      });
    }

    return res.status(200).json({
      ...user,
      interest_details: interestDetails,
    });
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err.message);

    if (err.message.includes('JWT')) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }

    if (err.message.includes('network') || err.message.includes('connection')) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, age, gender, interests = [] } = req.body;

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
        user_metadata: {
          userId: updatedUser.id,
        },
      });
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
