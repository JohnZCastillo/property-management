import * as z from 'zod'

export const companyValidation = z.object({
  name: z.string(),
  code: z.string(),
})

export const customerValidation = z.object({
  name: z.string().max(255).nonempty('Name is required'),
  email: z.email().max(255).optional(),
  contact: z.string().max(20).optional(),
  age: z.number().int().min(0, 'Age must be positive').optional(),
})

export const roomValidation = z.object({
  title: z.string().max(255).nonempty('Name is required'),
  propertyId: z.number().int()
})

export const expenseValidation = z.object({
  title: z.string().max(255).nonempty('Title is required'),
 amount: z.number()
  .min(0, 'Amount must be positive')
  .refine((val) => Number.isInteger(val * 100), {
    message: 'Amount must have max 2 decimal places'
  })
  .transform((val) => val.toFixed(2)), 
  targetType: z.enum(['property', 'room', 'job_order']), 
  targetId: z.number().int().positive('Valid target ID required').optional()
});

export const propertyValidation = z.object({
  title: z.string().max(255).nonempty('Title is required'),
});