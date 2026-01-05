'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { ProjectTask, TaskStatus, TaskPriority, Profile } from '@/types'

// Modelos de IA disponíveis
const AI_MODELS = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-3', name: 'Claude 3' },
  { id: 'gemini-pro', name: 'Gemini Pro' },
  { id: 'llama-2', name: 'LLaMA 2' },
]

// Formatos de saída
const OUTPUT_FORMATS = [
  { id: 'text', name: 'Texto' },
  { id: 'json', name: 'JSON' },
  { id: 'code', name: 'Código' },
  { id: 'markdown', name: 'Markdown' },
]

interface PromptField {
  id: string
  prompt: string
  aiModel: string
  outputFormat: string
}

interface TaskModalProps {
  task?: ProjectTask
  projectId: string
  ownerId: string
  availableUsers: Profile[]
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: any) => void
}

export function TaskModal({
  task,
  projectId,
  ownerId,
  availableUsers,
  isOpen,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [dueDate, setDueDate] = useState(
    task?.due_date ? task.due_date.split('T')[0] : ''
  )
  const [assigneeId, setAssigneeId] = useState(task?.owner_id || ownerId)
  const [tags, setTags] = useState<string[]>(task?.technologies || [])
  const [currentTag, setCurrentTag] = useState('')
  const [prompts, setPrompts] = useState<PromptField[]>([])
  const [outputFormat, setOutputFormat] = useState('text')

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addPrompt = () => {
    const newPrompt: PromptField = {
      id: `prompt-${Date.now()}`,
      prompt: '',
      aiModel: 'gpt-4',
      outputFormat: 'text',
    }
    setPrompts([...prompts, newPrompt])
  }

  const updatePrompt = (promptId: string, field: keyof PromptField, value: string) => {
    setPrompts(
      prompts.map((p) => (p.id === promptId ? { ...p, [field]: value } : p))
    )
  }

  const removePrompt = (promptId: string) => {
    setPrompts(prompts.filter((p) => p.id !== promptId))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    const taskData = {
      id: task?.id || `task-${Date.now()}`,
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      owner_id: assigneeId,
      due_date: dueDate || null,
      technologies: tags,
      prompts,
      outputFormat,
      created_at: task?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(taskData)
    handleClose()
  }

  const handleClose = () => {
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setStatus(task?.status || 'pending')
    setPriority(task?.priority || 'medium')
    setDueDate(task?.due_date ? task.due_date.split('T')[0] : '')
    setAssigneeId(task?.owner_id || ownerId)
    setTags(task?.technologies || [])
    setCurrentTag('')
    setPrompts([])
    setOutputFormat('text')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col gap-0 p-0 sm:h-[85vh] sm:rounded-xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* Header Fixo */}
          <DialogHeader className="flex-shrink-0 border-b border-white/10 p-6">
            <DialogTitle className="text-xl">
              {task ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {task ? 'Atualize os detalhes da tarefa' : 'Configure uma nova tarefa com IA'}
            </DialogDescription>
          </DialogHeader>

          {/* Conteúdo com Scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    placeholder="Digite o título da tarefa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-background/40"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os detalhes da tarefa"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="resize-none bg-background/40"
                  />
                </div>
              </div>

              {/* Metadados */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="priority" className="mb-2 block text-sm font-medium">
                    Prioridade
                  </label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                    <SelectTrigger className="bg-background/40">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="status" className="mb-2 block text-sm font-medium">
                    Status Inicial
                  </label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger className="bg-background/40">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in-progress">Em Progresso</SelectItem>
                      <SelectItem value="review">Revisão</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="mb-2 block text-sm font-medium">
                    Data de Vencimento
                  </label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-background/40"
                  />
                </div>
              </div>

              {/* Responsável */}
              <div>
                <label htmlFor="assignee" className="mb-2 block text-sm font-medium">
                  Responsável pela Execução
                </label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger className="bg-background/40">
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Etiquetas
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicione uma tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="bg-background/40"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 bg-white/5"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prompts Dinâmicos de IA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Prompts de IA</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPrompt}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Adicionar Prompt
                  </Button>
                </div>

                {prompts.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 py-8 text-center text-sm text-muted-foreground">
                    Nenhum prompt configurado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prompts.map((promptField, index) => (
                      <div
                        key={promptField.id}
                        className="space-y-3 rounded-lg border border-white/5 bg-background/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">Prompt #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrompt(promptField.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-muted-foreground">
                            Comando
                          </label>
                          <Textarea
                            value={promptField.prompt}
                            onChange={(e) =>
                              updatePrompt(promptField.id, 'prompt', e.target.value)
                            }
                            placeholder="Digite o comando para a IA executar..."
                            rows={2}
                            className="resize-none bg-background/40 text-sm"
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-medium text-muted-foreground">
                              Modelo de IA
                            </label>
                            <Select
                              value={promptField.aiModel}
                              onValueChange={(value) =>
                                updatePrompt(promptField.id, 'aiModel', value)
                              }
                            >
                              <SelectTrigger className="bg-background/40">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {AI_MODELS.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-medium text-muted-foreground">
                              Formato de Saída
                            </label>
                            <Select
                              value={promptField.outputFormat}
                              onValueChange={(value) =>
                                updatePrompt(promptField.id, 'outputFormat', value)
                              }
                            >
                              <SelectTrigger className="bg-background/40">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {OUTPUT_FORMATS.map((format) => (
                                  <SelectItem key={format.id} value={format.id}>
                                    {format.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formato de Saída Global */}
              <div>
                <label htmlFor="outputFormat" className="mb-2 block text-sm font-medium">
                  Formato de Saída Padrão
                </label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="bg-background/40">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTPUT_FORMATS.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer Fixo */}
          <DialogFooter className="flex-shrink-0 border-t border-white/10 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 sm:flex-none"
            >
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
