'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Link2,
  NotebookPen,
  Plus,
  Search,
  Trash2,
  Upload,
  Edit,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

const BUCKET_ID = 'general-instructions'
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB
const PAGE_SIZE = 9

const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'dll', 'ps1', 'vbs', 'jar', 'sh', 'dmg', 'pkg', 'app'
])

const PREVIEWABLE_MIME_PREFIXES = ['text/', 'image/']
const PREVIEWABLE_MIME_EXACT = new Set(['application/pdf', 'application/json'])

const CATEGORIES = [
  'Deploy',
  'Banco de Dados',
  'Frontend',
  'Backend',
  'DevOps',
  'Seguranca',
  'Produto',
  'Outros',
]

const KINDS = ['document', 'link', 'text'] as const

export type InstructionKind = (typeof KINDS)[number]

export interface GeneralInstruction {
  id: string
  title: string
  category: string | null
  kind: InstructionKind
  description: string | null
  content: string | null
  link_url: string | null
  storage_path: string | null
  mime_type: string | null
  size_bytes: number | null
  created_by: string | null
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

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || !Number.isFinite(bytes)) return '-'
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
    return `Arquivo muito grande. Tamanho maximo: ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
  }
  const ext = getFileExtension(file.name)
  if (ext && FORBIDDEN_EXTENSIONS.has(ext)) {
    return 'Tipo de arquivo nao permitido por seguranca.'
  }
  const dangerousMime = [
    'application/x-msdownload',
    'application/x-ms-installer',
    'application/x-executable',
    'application/x-sh',
  ]
  if (file.type && dangerousMime.includes(file.type)) {
    return 'Tipo de arquivo nao permitido por seguranca.'
  }
  return null
}

async function openSignedUrl(storagePath: string, downloadFileName?: string) {
  const supabase = createClient() as any
  if (!supabase?.storage) throw new Error('Supabase Storage nao configurado.')

  const { data, error } = await supabase.storage
    .from(BUCKET_ID)
    .createSignedUrl(storagePath, 90)

  if (error) throw error
  const url = data?.signedUrl
  if (!url) throw new Error('Nao foi possivel gerar o link do arquivo.')

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

export function GeneralInstructionsPage() {
  const [instructions, setInstructions] = useState<GeneralInstruction[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<InstructionKind | 'all'>('all')
  const [orderBy, setOrderBy] = useState<'updated_at' | 'title' | 'category' | 'kind'>('updated_at')
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [fileDesc, setFileDesc] = useState('')
  const [fileCategory, setFileCategory] = useState<string>('Deploy')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkCategory, setLinkCategory] = useState<string>('Deploy')
  const [linkDesc, setLinkDesc] = useState('')

  const [textTitle, setTextTitle] = useState('')
  const [textCategory, setTextCategory] = useState<string>('Deploy')
  const [textContent, setTextContent] = useState('')
  const [textDesc, setTextDesc] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const hasSupabaseStorage = useMemo(() => {
    const supabase = createClient() as any
    return Boolean(supabase?.storage)
  }, [])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [total])

  const load = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const supabase = createClient() as any
      if (!supabase?.from) {
        setLoading(false)
        return
      }
      let query = supabase
        .from('general_instructions')
        .select('*', { count: 'exact' })

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      if (kindFilter !== 'all') {
        query = query.eq('kind', kindFilter)
      }

      if (search.trim()) {
        const term = search.trim().replace(/%/g, '')
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
      }

      query = query.order(orderBy, { ascending: orderDir === 'asc' })

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      setInstructions((data ?? []) as GeneralInstruction[])
      setTotal(count ?? 0)
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao carregar instrucoes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, kindFilter, orderBy, orderDir, page])

  const handleUploadDocument = async () => {
    setErrorMsg(null)
    if (!fileToUpload) {
      setErrorMsg('Selecione um arquivo.')
      return
    }
    const validation = validateFile(fileToUpload)
    if (validation) {
      setErrorMsg(validation)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient() as any
      if (!supabase?.storage) {
        setErrorMsg('Supabase Storage nao configurado. Configure as variaveis para habilitar uploads.')
        return
      }

      const safe = sanitizeFileName(fileToUpload.name)
      const objectName = `general/${crypto.randomUUID()}-${safe}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(objectName, fileToUpload, { upsert: false, contentType: fileToUpload.type || undefined })
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('general_instructions').insert({
        title: fileToUpload.name,
        category: fileCategory,
        kind: 'document',
        description: fileDesc.trim() ? fileDesc.trim() : null,
        storage_path: objectName,
        mime_type: fileToUpload.type || null,
        size_bytes: fileToUpload.size,
      })
      if (insertError) {
        await supabase.storage.from(BUCKET_ID).remove([objectName])
        throw insertError
      }

      setFileToUpload(null)
      setFileDesc('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setPage(1)
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao enviar documento.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLink = async () => {
    setErrorMsg(null)
    if (!linkTitle.trim() || !linkUrl.trim()) {
      setErrorMsg('Informe titulo e URL.')
      return
    }
    try {
      setLoading(true)
      const supabase = createClient() as any
      const { error } = await supabase.from('general_instructions').insert({
        title: linkTitle.trim(),
        category: linkCategory,
        kind: 'link',
        description: linkDesc.trim() ? linkDesc.trim() : null,
        link_url: linkUrl.trim(),
      })
      if (error) throw error
      setLinkTitle('')
      setLinkUrl('')
      setLinkDesc('')
      setPage(1)
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao salvar link.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateText = async () => {
    setErrorMsg(null)
    if (!textTitle.trim()) {
      setErrorMsg('Informe um titulo.')
      return
    }
    if (!textContent.trim()) {
      setErrorMsg('Adicione o conteudo do texto.')
      return
    }
    try {
      setLoading(true)
      const supabase = createClient() as any
      const { error } = await supabase.from('general_instructions').insert({
        title: textTitle.trim(),
        category: textCategory,
        kind: 'text',
        description: textDesc.trim() ? textDesc.trim() : null,
        content: textContent,
      })
      if (error) throw error
      setTextTitle('')
      setTextContent('')
      setTextDesc('')
      setPage(1)
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao salvar texto.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (row: GeneralInstruction) => {
    const ok = window.confirm(`Excluir "${row.title}"?`)
    if (!ok) return
    try {
      setLoading(true)
      const supabase = createClient() as any
      const { error } = await supabase.from('general_instructions').delete().eq('id', row.id)
      if (error) throw error
      if (row.kind === 'document' && row.storage_path && supabase?.storage) {
        await supabase.storage.from(BUCKET_ID).remove([row.storage_path])
      }
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao excluir item.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (row: GeneralInstruction) => {
    if (row.kind !== 'text') return
    setEditingId(row.id)
    setEditingContent(row.content ?? '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    if (!editingContent.trim()) {
      setErrorMsg('Conteudo nao pode ficar vazio.')
      return
    }
    try {
      setLoading(true)
      const supabase = createClient() as any
      const { error } = await supabase
        .from('general_instructions')
        .update({ content: editingContent, updated_at: new Date().toISOString() })
        .eq('id', editingId)
      if (error) throw error
      setEditingId(null)
      setEditingContent('')
      await load()
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Falha ao salvar edicao.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = CATEGORIES

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Instrucoes Gerais
        </h1>
        <p className="text-muted-foreground">
          Centralize documentos, links e textos ricos para todo o time. Arquivos privados, com limite de {formatBytes(MAX_FILE_SIZE_BYTES)}.
        </p>
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMsg}
          </div>
        )}
      </div>

      <Card className="bg-background/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Adicionar novo conteudo</CardTitle>
          <CardDescription>Documentos, links e textos ricos (markdown com preview).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="document" className="space-y-4">
            <TabsList>
              <TabsTrigger value="document" className="gap-2">
                <Upload className="h-4 w-4" /> Documento
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-2">
                <Link2 className="h-4 w-4" /> Link
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <NotebookPen className="h-4 w-4" /> Texto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="space-y-3">
              {!hasSupabaseStorage && (
                <div className="rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                  Storage indisponivel neste ambiente. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para uploads.
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef as any}
                    type="file"
                    disabled={loading || !hasSupabaseStorage}
                    onChange={(e) => setFileToUpload(e.target.files?.[0] ?? null)}
                    className="border-white/10 bg-background/40"
                  />
                  <Input
                    placeholder="Descricao (opcional)"
                    value={fileDesc}
                    onChange={(e) => setFileDesc(e.target.value)}
                    disabled={loading}
                    className="border-white/10 bg-background/40"
                  />
                  <Select
                    value={fileCategory}
                    onValueChange={(v) => setFileCategory(v)}
                    disabled={loading}
                  >
                    <SelectTrigger className="border-white/10 bg-background/40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fileToUpload && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Select value={`${orderBy}:${orderDir}`} onValueChange={(v) => {
                  const [field, dir] = v.split(':')
                  setOrderBy(field as any)
                  setOrderDir(dir as any)
                  setPage(1)
                }}>
                  <SelectTrigger className="border-white/10 bg-background/40">
                    <SelectValue placeholder="Ordenacao" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="updated_at:desc">Atualizado (desc)</SelectItem>
                    <SelectItem value="updated_at:asc">Atualizado (asc)</SelectItem>
                    <SelectItem value="title:asc">Titulo (A-Z)</SelectItem>
                    <SelectItem value="title:desc">Titulo (Z-A)</SelectItem>
                    <SelectItem value="category:asc">Categoria (A-Z)</SelectItem>
                    <SelectItem value="category:desc">Categoria (Z-A)</SelectItem>
                    <SelectItem value="kind:asc">Tipo (A-Z)</SelectItem>
                    <SelectItem value="kind:desc">Tipo (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                      <Badge variant="secondary" className="bg-white/5 text-white/80">{fileToUpload.name}</Badge>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{total} resultado(s)</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-foreground">Pagina {page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Proxima
                  </Button>
                </div>
              </div>
                      <span>{formatBytes(fileToUpload.size)}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-white/70 hover:text-white"
                        onClick={() => {
                          setFileToUpload(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        disabled={loading}
                      >
                        <X className="h-3.5 w-3.5" /> limpar
                      </button>
                    </div>
                  )}
                </div>
                <Button onClick={handleUploadDocument} disabled={loading || !hasSupabaseStorage} className="gap-2">
                  <Upload className="h-4 w-4" /> Enviar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Titulo do link"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  disabled={loading}
                  className="md:col-span-2 border-white/10 bg-background/40"
                />
                <Select value={linkCategory} onValueChange={(v) => setLinkCategory(v)} disabled={loading}>
                  <SelectTrigger className="border-white/10 bg-background/40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={loading}
                className="border-white/10 bg-background/40"
              />
              <Input
                placeholder="Descricao (opcional)"
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                disabled={loading}
                className="border-white/10 bg-background/40"
              />
              <Button onClick={handleCreateLink} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar link
              </Button>
            </TabsContent>

            <TabsContent value="text" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Titulo do texto"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  disabled={loading}
                  className="md:col-span-2 border-white/10 bg-background/40"
                />
                <Select value={textCategory} onValueChange={(v) => setTextCategory(v)} disabled={loading}>
                  <SelectTrigger className="border-white/10 bg-background/40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Descricao (opcional)"
                value={textDesc}
                onChange={(e) => setTextDesc(e.target.value)}
                disabled={loading}
                className="border-white/10 bg-background/40"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Textarea
                  placeholder="Escreva em Markdown. Ex: ## Passos, *italico*, **negrito**"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={loading}
                  className="min-h-[200px] border-white/10 bg-background/40"
                />
                <div className="rounded-xl border border-white/10 bg-background/30 p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-2">Preview (Markdown)</p>
                  <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent || 'Nada para mostrar ainda.'}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateText} disabled={loading} className="gap-2">
                <Plus className="h-4 w-4" /> Salvar texto
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-background/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Instrucoes salvas</CardTitle>
          <CardDescription>Pesquise, filtre e navegue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/40 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por titulo ou descricao"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todas</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as any)}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="document">Documento</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && instructions.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Carregando instrucoes...
            </div>
          ) : instructions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
              Nenhum resultado para os filtros/busca atuais.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {instructions.map((item) => (
                <Card key={item.id} className="border-white/5 bg-background/40">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {item.description ?? 'Sem descricao'}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="secondary" className="bg-white/5 text-white/80">
                            {item.category ?? 'Outros'}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-xs capitalize">
                            {item.kind === 'document' ? 'Documento' : item.kind === 'link' ? 'Link' : 'Texto'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.kind === 'text' && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => startEdit(item)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {item.kind === 'document' && item.storage_path && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {item.mime_type && <span>{item.mime_type}</span>}
                        {item.size_bytes ? <span>• {formatBytes(item.size_bytes)}</span> : null}
                        <div className="flex gap-2">
                          {isPreviewable(item.mime_type) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openSignedUrl(item.storage_path!)}
                              disabled={!hasSupabaseStorage || loading}
                            >
                              <FileText className="h-4 w-4" /> Visualizar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => openSignedUrl(item.storage_path!, item.title)}
                            disabled={!hasSupabaseStorage || loading}
                          >
                            <Download className="h-4 w-4" /> Baixar
                          </Button>
                        </div>
                      </div>
                    )}

                    {item.kind === 'link' && item.link_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {item.link_url}
                        </a>
                      </div>
                    )}

                    {item.kind === 'text' && item.content && (
                      <div className="prose prose-invert max-w-none text-sm border border-white/5 rounded-lg p-3 bg-background/30">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingId && (
        <div className="rounded-xl border border-white/10 bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Editar texto</p>
              <p className="text-xs text-muted-foreground">Atualize o conteudo em Markdown.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setEditingId(null); setEditingContent('') }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="min-h-[180px] border-white/10 bg-background/40"
              disabled={loading}
            />
            <div className="rounded-xl border border-white/10 bg-background/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{editingContent || 'Nada para mostrar ainda.'}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setEditingId(null); setEditingContent('') }} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={loading} className="gap-2">
              <FileText className="h-4 w-4" /> Salvar alteracoes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
