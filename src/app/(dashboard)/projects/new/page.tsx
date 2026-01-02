'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, X, Plus } from 'lucide-react'
import { createProjectSchema, type CreateProjectFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const popularTechnologies = [
  'Next.js', 'React', 'Vue.js', 'Angular', 'Node.js',
  'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase',
  'Tailwind', 'SASS', 'GraphQL', 'REST API', 'Docker'
]

export default function NewProjectPage() {
  const router = useRouter()
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: 'active',
      technologies: [],
    },
  })

  const addTechnology = (tech: string) => {
    const trimmed = tech.trim()
    if (trimmed && !technologies.includes(trimmed)) {
      const newTechs = [...technologies, trimmed]
      setTechnologies(newTechs)
      setValue('technologies', newTechs)
    }
    setTechInput('')
  }

  const removeTechnology = (tech: string) => {
    const newTechs = technologies.filter(t => t !== tech)
    setTechnologies(newTechs)
    setValue('technologies', newTechs)
  }

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTechnology(techInput)
    }
  }

  const onSubmit = async (data: CreateProjectFormData) => {
    setError(null)
    
    // Aqui faria a chamada ao Supabase para criar o projeto
    console.log('Criando projeto:', { ...data, technologies })
    
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redireciona para lista de projetos
    router.push('/projects')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Novo Projeto</h1>
          <p className="text-muted-foreground">
            Crie um novo projeto para gerenciar
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
          <CardDescription>
            Preencha os dados básicos do seu projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do projeto *
              </label>
              <Input
                id="name"
                placeholder="Ex: Meu E-commerce"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="description"
                placeholder="Descreva brevemente o projeto..."
                {...register('description')}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* URL do Repositório */}
            <div className="space-y-2">
              <label htmlFor="repository_url" className="text-sm font-medium">
                URL do Repositório
              </label>
              <Input
                id="repository_url"
                type="url"
                placeholder="https://github.com/usuario/repositorio"
                {...register('repository_url')}
                className={errors.repository_url ? 'border-destructive' : ''}
              />
              {errors.repository_url && (
                <p className="text-xs text-destructive">{errors.repository_url.message}</p>
              )}
            </div>

            {/* Tecnologias */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tecnologias
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma tecnologia..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => addTechnology(techInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tags selecionadas */}
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Sugestões */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-1">
                  {popularTechnologies
                    .filter(tech => !technologies.includes(tech))
                    .slice(0, 10)
                    .map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => addTechnology(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Status inicial
              </label>
              <div className="flex gap-2">
                {(['active', 'on-hold'] as const).map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={status}
                      {...register('status')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {status === 'active' ? 'Ativo' : 'Em espera'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Projeto'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
