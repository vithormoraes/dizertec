'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Bell, Shield, Palette } from 'lucide-react'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations'
import { useAuthStore } from '@/store'
import { mockUser } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export default function SettingsPage() {
  const { user: storeUser } = useAuthStore()
  const user = storeUser || mockUser
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      avatar_url: user?.avatar_url || '',
    },
  })

  const onSubmit = async (data: UpdateProfileFormData) => {
    // Aqui faria a chamada ao Supabase para atualizar o perfil
    console.log('Atualizando perfil:', data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    Perfil atualizado com sucesso!
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <label htmlFor="avatar_url" className="text-sm font-medium">
                      URL do Avatar
                    </label>
                    <Input
                      id="avatar_url"
                      type="url"
                      placeholder="https://exemplo.com/avatar.jpg"
                      {...register('avatar_url')}
                      className="max-w-md"
                    />
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <Input
                    id="full_name"
                    placeholder="Seu nome"
                    {...register('full_name')}
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: 'deploy_success', label: 'Deploy concluído com sucesso', description: 'Receber notificação quando um deploy for concluído' },
                { id: 'deploy_failed', label: 'Deploy falhou', description: 'Receber notificação quando um deploy falhar' },
                { id: 'new_member', label: 'Novo membro', description: 'Receber notificação quando alguém entrar no projeto' },
                { id: 'new_note', label: 'Nova nota', description: 'Receber notificação quando uma nota for adicionada' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label htmlFor={item.id} className="text-sm font-medium">
                      {item.label}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id={item.id}
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              ))}

              <Button>Salvar preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Tema</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Claro' },
                    { id: 'dark', label: 'Escuro' },
                    { id: 'system', label: 'Sistema' },
                  ].map((theme) => (
                    <label
                      key={theme.id}
                      className="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={theme.id}
                        defaultChecked={theme.id === 'system'}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-lg border-2 ${
                        theme.id === 'light' ? 'bg-white border-gray-200' :
                        theme.id === 'dark' ? 'bg-gray-900 border-gray-700' :
                        'bg-gradient-to-br from-white to-gray-900 border-gray-400'
                      }`} />
                      <span className="text-sm">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha atual</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova senha</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar nova senha</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button>Alterar senha</Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>
                  Ações irreversíveis para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">
                  Excluir minha conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
