const supabaseClient = require('../../libs/supabaseClient');

exports.getInterests = async (req, res) => {
  try {
    const supabase = supabaseClient(req.accessToken);

    const { data, error } = await supabase.from('interests').select('id, name');

    if (error) {
      console.log('Supabase error →', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.log('Server error →', err);

    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
};
