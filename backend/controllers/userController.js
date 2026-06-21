import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.avatar_url = req.body.avatar_url || user.avatar_url;
        
        // Let's assume password change is handled separately or through here if provided
        let updatedData = {
            name: user.name,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified,
            password_hash: user.password_hash // normally we would hash if changed
        };
        
        await User.update(req.user.id, updatedData);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
