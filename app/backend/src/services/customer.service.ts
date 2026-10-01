import { FilterQuery } from 'mongoose';
import { User, type IUser } from '@/models/User';
import { Order } from '@/models/Order';
import { ApiError } from '@/utils/ApiError';
import { getPageParams, buildPageMeta } from '@/utils/pagination';
import { ROLES, STAFF_ROLES, type Role } from '@/constants';

export const customerService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, skip } = getPageParams(query);
    const filter: FilterQuery<IUser> = { role: ROLES.CUSTOMER };
    if (query.search) {
      const s = String(query.search).trim();
      filter.$or = [{ name: { $regex: s, $options: 'i' } }, { email: { $regex: s, $options: 'i' } }];
    }
    if (query.status === 'active') filter.isActive = true;
    if (query.status === 'inactive') filter.isActive = false;

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },

  async get(id: string) {
    const user = await User.findById(id).lean();
    if (!user) throw ApiError.notFound('Customer not found');
    const [orderCount, spentAgg] = await Promise.all([
      Order.countDocuments({ user: id }),
      Order.aggregate([
        { $match: { user: user._id, status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);
    return { ...user, stats: { orders: orderCount, totalSpent: spentAgg[0]?.total ?? 0 } };
  },

  async setActive(id: string, isActive: boolean) {
    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) throw ApiError.notFound('Customer not found');
    return user.toJSON();
  },

  /**
   * Updates a staff member's role. Only a super admin may assign staff roles;
   * enforced at the route layer, re-checked here defensively.
   */
  async updateRole(actorRole: Role, id: string, role: Role) {
    if (actorRole !== ROLES.SUPER_ADMIN && STAFF_ROLES.includes(role)) {
      throw ApiError.forbidden('Only a super admin can assign staff roles');
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },
};
