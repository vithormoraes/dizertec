import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar data
export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: ptBR })
}

// Formatar data relativa (ex: "há 2 dias")
export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

// Formatar data e hora
export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

// Gerar iniciais do nome
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Truncar texto
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Cores por status de projeto
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  }
  return colors[status] || colors['active']
}

// Cores por status de deployment
export function getDeploymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'success': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'building': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }
  return colors[status] || colors['pending']
}

// Labels de status
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'active': 'Ativo',
    'archived': 'Arquivado',
    'on-hold': 'Em espera',
    'success': 'Sucesso',
    'failed': 'Falhou',
    'pending': 'Pendente',
    'building': 'Construindo',
  }
  return labels[status] || status
}

// Labels de ambiente
export function getEnvironmentLabel(env: string): string {
  const labels: Record<string, string> = {
    'development': 'Desenvolvimento',
    'staging': 'Staging',
    'production': 'Produção',
  }
  return labels[env] || env
}

// Cores de ambiente
export function getEnvironmentColor(env: string): string {
  const colors: Record<string, string> = {
    'development': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'staging': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'production': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  }
  return colors[env] || colors['development']
}

// Labels de role
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'owner': 'Proprietário',
    'admin': 'Administrador',
    'member': 'Membro',
    'viewer': 'Visualizador',
  }
  return labels[role] || role
}
