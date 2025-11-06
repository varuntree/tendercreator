export interface CompanyProfile {
  company_name: string
  company_description: string
  industry: string
  services_offered: string[]
  key_projects: string
  certifications: string[]
  differentiators: string
}

export interface OrganizationSettings {
  logo_url?: string
  profile?: CompanyProfile
  [key: string]: unknown
}

export interface Organization {
  id: string
  name: string
  settings: OrganizationSettings
  created_at: string
  updated_at: string
}
