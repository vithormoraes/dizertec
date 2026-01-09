'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Eye, FileCode2, FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const BUCKET_ID = 'project-materials'
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const FORBIDDEN_EXTENSIONS = new Set([
  'exe',
  'msi',
  'bat',
  'cmd',
  'com',
  'scr',
  'dll',
  'ps1',
  'vbs',
  'jar',
  'sh',
  'dmg',
  'pkg',
  'app',
])

const PREVIEWABLE_MIME_PREFIXES = ['text/', 'image/']
const PREVIEWABLE_MIME_EXACT = new Set(['application/pdf', 'application/json'])

type MaterialFileRow = {
  id: string
  project_id: string
  storage_path: string
  file_name: string
  content_type: string | null
  size_bytes: number
  description: string | null
  uploaded_by: string
  created_at: string
}

type MaterialNoteKind = 'instructions' | 'code'

type MaterialNoteRow = {
  id: string
  project_id: string
  kind: MaterialNoteKind
  title: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
}

function getFileExtension(fileName: string) {
  const idx = fileName.lastIndexOf('.')
  if (idx === -1) return ''
  return fileName.slice(idx + 1).toLowerCase()
}

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 120)
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

function isPreviewable(mimeType: string | null) {
  if (!mimeType) return false
  if (PREVIEWABLE_MIME_EXACT.has(mimeType)) return true
  return PREVIEWABLE_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
}

function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Arquivo muito grande. Tamanho máximo: ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
  }

  const ext = getFileExtension(file.name)
  if (ext && FORBIDDEN_EXTENSIONS.has(ext)) {
    return 'Tipo de arquivo não permitido por segurança.'
  }

  // Bloqueios extras por MIME comum de executáveis
  const dangerousMime = [
    'application/x-msdownload',
    'application/x-ms-installer',
    'application/x-executable',
    'application/x-sh',
  ]
  if (file.type && dangerousMime.includes(file.type)) {
    return 'Tipo de arquivo não permitido por segurança.'
  }

  return null
}

async function openSignedUrl(storagePath: string, downloadFileName?: string) {
  const supabase = createClient() as any
  if (!supabase?.storage) {
    throw new Error('Supabase Storage não está configurado neste ambiente.')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_ID)
    .createSignedUrl(storagePath, 60)

  if (error) throw error
  const url = data?.signedUrl
  if (!url) throw new Error('Não foi possível gerar o link do arquivo.')

  // Download quando solicitado
  if (downloadFileName) {
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

export function ProjectMaterialsSection({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<MaterialFileRow[]>([])
  const [notes, setNotes] = useState<MaterialNoteRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [noteKind, setNoteKind] = useState<MaterialNoteKind>('instructions')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const hasSupabaseStorage = useMemo(() => {
    const supabase = createClient() as any
    return Boolean(supabase?.storage)
  }, [])

  const load = async () => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const supabase = createClient() as any

      // Arquivos
      if (supabase?.from) {
        const { data: fileRows, error: filesError } = await supabase
          .from('project_material_files')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        if (filesError) throw filesError
        setFiles((fileRows ?? []) as MaterialFileRow[])

        const { data: noteRows, error: notesError } = await supabase
          .from('project_material_notes')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false })

        if (notesError) throw notesError
        setNotes((noteRows ?? []) as MaterialNoteRow[])
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao carregar materiais do projeto.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const handleUpload = async () => {
    setErrorMsg(null)
    if (!selectedFile) {
      setErrorMsg('Selecione um arquivo para enviar.')
      return
    }

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    try {
      setIsLoading(true)
      const supabase = createClient() as any
      if (!supabase?.storage) {
        setErrorMsg('Supabase Storage não está configurado. Configure as variáveis do Supabase para habilitar upload.')
        return
      }

      const safeName = sanitizeFileName(selectedFile.name)
      const objectName = `projects/${projectId}/${crypto.randomUUID()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(objectName, selectedFile, {
          upsert: false,
          contentType: selectedFile.type || undefined,
        })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase
        .from('project_material_files')
        .insert({
          project_id: projectId,
          storage_path: objectName,
          file_name: selectedFile.name,
          content_type: selectedFile.type || null,
          size_bytes: selectedFile.size,
          description: fileDescription.trim() ? fileDescription.trim() : null,
        })

      if (insertError) {
        // rollback do objeto
        await supabase.storage.from(BUCKET_ID).remove([objectName])
        throw insertError
      }

      setSelectedFile(null)
      setFileDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''

      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao enviar arquivo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (row: MaterialFileRow) => {
    setErrorMsg(null)

    const ok = window.confirm(`Excluir o arquivo "${row.file_name}"? Esta ação não pode ser desfeita.`)
    if (!ok) return

    try {
      setIsLoading(true)
      const supabase = createClient() as any

      const { error: deleteRowError } = await supabase
        .from('project_material_files')
        .delete()
        .eq('id', row.id)

      if (deleteRowError) throw deleteRowError

      if (supabase?.storage) {
        await supabase.storage.from(BUCKET_ID).remove([row.storage_path])
      }

      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao excluir arquivo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    setErrorMsg(null)

    if (!noteTitle.trim()) {
      setErrorMsg('Informe um título para a nota.')
      return
    }

    if (!noteContent.trim()) {
      setErrorMsg('Informe o conteúdo da nota.')
      return
    }

    try {
      setIsLoading(true)
      const supabase = createClient() as any

      const { error } = await supabase.from('project_material_notes').insert({
        project_id: projectId,
        kind: noteKind,
        title: noteTitle.trim(),
        content: noteContent,
      })

      if (error) throw error

      setNoteTitle('')
      setNoteContent('')
      setNoteKind('instructions')

      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao criar nota.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (row: MaterialNoteRow) => {
    setErrorMsg(null)

    const ok = window.confirm(`Excluir a nota "${row.title}"? Esta ação não pode ser desfeita.`)
    if (!ok) return

    try {
      setIsLoading(true)
      const supabase = createClient() as any
      const { error } = await supabase
        .from('project_material_notes')
        .delete()
        .eq('id', row.id)

      if (error) throw error
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao excluir nota.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-background/40 border-white/5">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Materiais do Projeto</CardTitle>
        <CardDescription>
          Armazene arquivos, códigos e instruções privadas deste projeto. Limite: {formatBytes(MAX_FILE_SIZE_BYTES)}. Executáveis são bloqueados.
        </CardDescription>
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMsg}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files" className="gap-2">
              <Upload className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Instruções / Códigos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {!hasSupabaseStorage && (
              <div className="rounded-xl border border-white/10 bg-background/30 px-4 py-3 text-sm text-muted-foreground">
                Upload/Download indisponível neste ambiente. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para habilitar o Storage.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Input
                  ref={fileInputRef as any}
                  type="file"
                  disabled={isLoading || !hasSupabaseStorage}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="border-white/10 bg-background/40"
                />
                <Input
                  placeholder="Descrição (opcional) — ex: contrato, build, assets, etc."
                  value={fileDescription}
                  disabled={isLoading || !hasSupabaseStorage}
                  onChange={(e) => setFileDescription(e.target.value)}
                  className="border-white/10 bg-background/40"
                />
                {selectedFile && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-white/5 text-white/80">
                      {selectedFile.name}
                    </Badge>
                    <span>{formatBytes(selectedFile.size)}</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-white/70 hover:text-white"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      disabled={isLoading}
                    >
                      <X className="h-3.5 w-3.5" />
                      limpar
                    </button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={isLoading || !hasSupabaseStorage}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Enviar
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading && files.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando arquivos...
                </div>
              ) : files.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
                  Nenhum arquivo enviado ainda.
                </div>
              ) : (
                files.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-foreground">{row.file_name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatBytes(row.size_bytes)}</span>
                        {row.content_type && <span>• {row.content_type}</span>}
                        {row.description && <span>• {row.description}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPreviewable(row.content_type) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openSignedUrl(row.storage_path)}
                          disabled={!hasSupabaseStorage || isLoading}
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openSignedUrl(row.storage_path, row.file_name)}
                        disabled={!hasSupabaseStorage || isLoading}
                      >
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
                        onClick={() => handleDeleteFile(row)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground/80">Tipo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={noteKind === 'instructions' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setNoteKind('instructions')}
                    className="gap-2"
                    disabled={isLoading}
                  >
                    <FileText className="h-4 w-4" />
                    Instruções
                  </Button>
                  <Button
                    type="button"
                    variant={noteKind === 'code' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setNoteKind('code')}
                    className="gap-2"
                    disabled={isLoading}
                  >
                    <FileCode2 className="h-4 w-4" />
                    Código
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground/80">Título</label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex: Como rodar localmente / Credenciais de sandbox / Snippets úteis"
                  className="border-white/10 bg-background/40"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground/80">Conteúdo</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={
                  noteKind === 'code'
                    ? 'Cole aqui comandos, scripts, snippets e exemplos.'
                    : 'Descreva passos, links internos, padrões e instruções.'
                }
                className="min-h-[140px] border-white/10 bg-background/40"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-end">
              <Button onClick={handleCreateNote} disabled={isLoading} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading && notes.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando notas...
                </div>
              ) : notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma instrução/código cadastrado ainda.
                </div>
              ) : (
                notes.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-white/5 bg-background/40 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{row.title}</p>
                          <Badge variant="secondary" className="bg-white/5 text-white/80">
                            {row.kind === 'code' ? 'Código' : 'Instruções'}
                          </Badge>
                        </div>
                        <pre className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-background/60 p-3 text-xs text-white/80 whitespace-pre-wrap">
                          {row.content}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
                          onClick={() => handleDeleteNote(row)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
