import type { Request, Response } from 'express';
import { dashboardService } from '@/services/dashboard.service';
import { customerService } from '@/services/customer.service';
import { categoryService } from '@/services/category.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';
import type { Role } from '@/constants';

export const adminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await dashboardService.stats();
    return sendSuccess(res, stats, 'Dashboard stats fetched');
  }),

  // Customers
  listCustomers: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await customerService.list(req.query);
    return sendSuccess(res, items, 'Customers fetched', 200, meta);
  }),

  getCustomer: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.get(req.params.id);
    return sendSuccess(res, customer, 'Customer fetched');
  }),

  setCustomerActive: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.setActive(req.params.id, Boolean(req.body.isActive));
    return sendSuccess(res, customer, 'Customer updated');
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await customerService.updateRole(req.user!.role as Role, req.params.id, req.body.role);
    return sendSuccess(res, user, 'Role updated');
  }),

  // Categories (admin management)
  listCategories: asyncHandler(async (_req: Request, res: Response) => {
    const items = await categoryService.listAll();
    return sendSuccess(res, items, 'Categories fetched');
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, 'Category created', 201);
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    return sendSuccess(res, category, 'Category updated');
  }),

  removeCategory: asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.remove(req.params.id);
    return sendSuccess(res, result, 'Category deleted');
  }),
};
