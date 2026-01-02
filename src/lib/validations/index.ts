import { z } from 'zod'

// Schema de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema de cadastro
export const signupSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
})

export type SignupFormData = z.infer<typeof signupSchema>

// Schema de criação de projeto
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  repository_url: z.string().url('URL inválida').optional().or(z.literal('')),
  technologies: z.array(z.string()).default([]),
  status: z.enum(['active', 'archived', 'on-hold']).default('active'),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

// Schema de atualização de projeto
export const updateProjectSchema = createProjectSchema.partial()

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>

// Schema de deployment
export const createDeploymentSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['success', 'failed', 'pending', 'building']).default('pending'),
  git_commit: z.string().optional(),
  git_branch: z.string().optional(),
})

export type CreateDeploymentFormData = z.infer<typeof createDeploymentSchema>

// Schema de nota
export const createNoteSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  content: z.string().optional(),
})

export type CreateNoteFormData = z.infer<typeof createNoteSchema>

// Schema de atualização de nota
export const updateNoteSchema = createNoteSchema.partial()

export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>

// Schema de membro
export const addMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'member', 'viewer']),
})

export type AddMemberFormData = z.infer<typeof addMemberSchema>

// Schema de atualização de perfil
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
