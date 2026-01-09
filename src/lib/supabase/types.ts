export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          repository_url: string | null
          technologies: string[] | null
          status: 'active' | 'archived' | 'on-hold'
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          repository_url?: string | null
          technologies?: string[] | null
          status?: 'active' | 'archived' | 'on-hold'
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          repository_url?: string | null
          technologies?: string[] | null
          status?: 'active' | 'archived' | 'on-hold'
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          created_at?: string
        }
      }
      deployments: {
        Row: {
          id: string
          project_id: string
          environment: 'development' | 'staging' | 'production'
          url: string | null
          status: 'success' | 'failed' | 'pending'
          deployed_at: string | null
          deployed_by: string | null
          git_commit: string | null
          git_branch: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          environment: 'development' | 'staging' | 'production'
          url?: string | null
          status?: 'success' | 'failed' | 'pending'
          deployed_at?: string | null
          deployed_by?: string | null
          git_commit?: string | null
          git_branch?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          environment?: 'development' | 'staging' | 'production'
          url?: string | null
          status?: 'success' | 'failed' | 'pending'
          deployed_at?: string | null
          deployed_by?: string | null
          git_commit?: string | null
          git_branch?: string | null
          created_at?: string
        }
      }
      project_notes: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content: string
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_analytics: {
        Row: {
          id: string
          project_id: string
          date: string
          commits_count: number | null
          deployments_count: number | null
          active_members_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          commits_count?: number | null
          deployments_count?: number | null
          active_members_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          commits_count?: number | null
          deployments_count?: number | null
          active_members_count?: number | null
          created_at?: string
        }
      }

      project_material_files: {
        Row: {
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
        Insert: {
          id?: string
          project_id: string
          storage_path: string
          file_name: string
          content_type?: string | null
          size_bytes: number
          description?: string | null
          uploaded_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          storage_path?: string
          file_name?: string
          content_type?: string | null
          size_bytes?: number
          description?: string | null
          uploaded_by?: string
          created_at?: string
        }
      }

      project_material_notes: {
        Row: {
          id: string
          project_id: string
          kind: 'instructions' | 'code'
          title: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          kind?: 'instructions' | 'code'
          title: string
          content: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          kind?: 'instructions' | 'code'
          title?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      general_instructions: {
        Row: {
          id: string
          title: string
          category: string | null
          kind: 'document' | 'link' | 'text'
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
        Insert: {
          id?: string
          title: string
          category?: string | null
          kind?: 'document' | 'link' | 'text'
          description?: string | null
          content?: string | null
          link_url?: string | null
          storage_path?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string | null
          kind?: 'document' | 'link' | 'text'
          description?: string | null
          content?: string | null
          link_url?: string | null
          storage_path?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
