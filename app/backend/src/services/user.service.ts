import { Types } from 'mongoose';
import { User } from '@/models/User';
import { Address } from '@/models/Address';
import { ApiError } from '@/utils/ApiError';

export const userService = {
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.badRequest('Current password is incorrect');
    user.password = newPassword;
    await user.save();
    return { updated: true };
  },

  // ---- Wishlist ----
  async getWishlist(userId: string) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name slug price images type fragrance stock',
    });
    if (!user) throw ApiError.notFound('User not found');
    return user.wishlist;
  },

  async toggleWishlist(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const pid = new Types.ObjectId(productId);
    const exists = user.wishlist.some((w) => w.equals(pid));
    if (exists) {
      user.wishlist = user.wishlist.filter((w) => !w.equals(pid));
    } else {
      user.wishlist.push(pid);
    }
    await user.save();
    return { inWishlist: !exists };
  },

  // ---- Addresses ----
  async listAddresses(userId: string) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  },

  async addAddress(userId: string, data: Record<string, unknown>) {
    const count = await Address.countDocuments({ user: userId });
    const isDefault = count === 0 || Boolean(data.isDefault);
    if (isDefault) await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    const address = await Address.create({ ...data, user: userId, isDefault });
    return address.toObject();
  },

  async updateAddress(userId: string, addressId: string, data: Record<string, unknown>) {
    if (data.isDefault) await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      data,
      { new: true, runValidators: true },
    );
    if (!address) throw ApiError.notFound('Address not found');
    return address.toObject();
  },

  async removeAddress(userId: string, addressId: string) {
    const res = await Address.deleteOne({ _id: addressId, user: userId });
    if (res.deletedCount === 0) throw ApiError.notFound('Address not found');
    return { deleted: true };
  },
};
