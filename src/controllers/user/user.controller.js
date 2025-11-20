const supabaseClient = require('../../libs/supabaseClient');

exports.getCurrentUser = async (req, res) => {
  try {
    // Check if user email is available in the request
    if (!req.user.email) {
      return res.status(401).json({
        error: 'Authentication required: No user email found',
      });
    }

    const supabase = supabaseClient(req.accessToken);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('app_email', req.user.email);

    // Handle Supabase query errors
    if (error) {
      console.error('Supabase error:', error);

      if (error.code === 'PGRST116') {
        return res.status(404).json(null);
      }

      return res.status(500).json({
        error: 'Database error',
        details: error.message,
      });
    }
    console.log('User retrieved successfully:', user[0]);
    res.status(200).json(user[0] || null);
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err.message);

    // Handle specific error cases
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

  return {};
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, age, gender } = req.body;

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
        .update({ name, age, gender })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.log('Update error ->', updateError);
        throw updateError;
      }

      [updatedUser] = data;
    } else {
      // 3. User does NOT exist → create one
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          app_email: req.user.email,
          name,
          age,
          gender,
        })
        .select();

      if (insertError) {
        console.log('Insert error ->', insertError);
        throw insertError;
      }

      [updatedUser] = data;
    }

    // Return final user record (updated or created)
    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};
