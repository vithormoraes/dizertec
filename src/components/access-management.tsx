'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus,
  Key,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AccessCredential, CredentialEnvironment } from '@/types'

const ENVIRONMENT_COLORS: Record<CredentialEnvironment, string> = {
  production: 'bg-red-500/10 text-red-200 border-red-500/20',
  staging: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
  development: 'bg-blue-500/10 text-blue-200 border-blue-500/20',
}

const ENVIRONMENT_LABELS: Record<CredentialEnvironment, string> = {
  production: 'Produção',
  staging: 'Staging',
  development: 'Dev',
}

interface AccessManagementProps {
  credentials?: AccessCredential[]
}

export function AccessManagement({ credentials = [] }: AccessManagementProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<Record<string, string>>({})

  const togglePassword = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = async (text: string, credentialId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField({ [credentialId]: field })
      setTimeout(() => {
        setCopiedField({})
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const isCopied = (credentialId: string, field: string) => {
    return copiedField[credentialId] === field
  }

  return (
    <Card className="bg-background/40 border-white/5">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gestão de Acessos</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-sm text-muted-foreground">
            Centralize e gerencie credenciais de acesso a sistemas externos
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {credentials.length === 0 
                ? 'Nenhuma credencial cadastrada' 
                : `${credentials.length} ${credentials.length === 1 ? 'credencial' : 'credenciais'} cadastrada${credentials.length === 1 ? '' : 's'}`
              }
            </p>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Credencial
            </Button>
          </div>

          {credentials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-muted-foreground">
              <Key className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Nenhuma credencial cadastrada</p>
              <p className="text-xs mt-1">Clique em &quot;Nova Credencial&quot; para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="rounded-xl border border-white/5 bg-background/60 p-4 space-y-3"
                >
                  {/* Header: Service Name and Environment */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">{credential.service_name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={ENVIRONMENT_COLORS[credential.environment]}
                        >
                          {ENVIRONMENT_LABELS[credential.environment]}
                        </Badge>
                      </div>
                      {credential.url && (
                        <a
                          href={credential.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1"
                        >
                          <span className="truncate max-w-[200px]">{credential.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Usuário
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-white/10 bg-background/80 px-3 py-2 text-sm">
                        {credential.username}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-white/10"
                        onClick={() => copyToClipboard(credential.username, credential.id, 'username')}
                        title="Copiar usuário"
                      >
                        {isCopied(credential.id, 'username') ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Senha
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-white/10 bg-background/80 px-3 py-2 text-sm font-mono">
                        {showPassword[credential.id] ? credential.password : '••••••••'}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-white/10"
                        onClick={() => togglePassword(credential.id)}
                        title={showPassword[credential.id] ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword[credential.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-white/10"
                        onClick={() => copyToClipboard(credential.password, credential.id, 'password')}
                        title="Copiar senha"
                      >
                        {isCopied(credential.id, 'password') ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Footer: Last Updated */}
                  <div className="text-xs text-muted-foreground pt-2 border-t border-white/5">
                    Atualizado em {new Date(credential.updated_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
