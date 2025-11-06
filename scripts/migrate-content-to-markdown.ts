/**
 * Migration Script: Convert Mixed HTML/Markdown Content to Pure Markdown
 *
 * Purpose: Clean up work_package_content table to store only pure markdown.
 * This ensures consistent format for editor rendering and export functionality.
 *
 * Run with: npx tsx scripts/migrate-content-to-markdown.ts
 */

import { createClient } from '@supabase/supabase-js'
import { htmlToMarkdown } from '../libs/utils/html-to-markdown'

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i

interface WorkPackageContent {
  id: string
  work_package_id: string
  content: string
  created_at: string
  updated_at: string
}

async function main() {
  // Initialize Supabase client with environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🚀 Starting content migration to pure markdown...\n')

  // Fetch all work package content
  const { data: contents, error } = await supabase
    .from('work_package_content')
    .select('*')
    .not('content', 'is', null)

  if (error) {
    console.error('❌ Failed to fetch work package content:', error)
    process.exit(1)
  }

  if (!contents || contents.length === 0) {
    console.log('✅ No content found to migrate')
    return
  }

  console.log(`📊 Found ${contents.length} work package content records\n`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const record of contents as WorkPackageContent[]) {
    const trimmed = record.content.trim()

    // Skip empty content
    if (!trimmed) {
      skipped++
      continue
    }

    // Check if content contains HTML
    const hasHTML = HTML_DETECTION_REGEX.test(trimmed)

    if (!hasHTML) {
      // Already markdown, skip
      console.log(`⏭️  Skipping ${record.work_package_id} (already markdown)`)
      skipped++
      continue
    }

    try {
      // Convert HTML to markdown
      console.log(`🔄 Converting ${record.work_package_id}...`)
      const markdown = htmlToMarkdown(trimmed)

      // Update database
      const { error: updateError } = await supabase
        .from('work_package_content')
        .update({
          content: markdown,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id)

      if (updateError) {
        console.error(`❌ Failed to update ${record.work_package_id}:`, updateError)
        failed++
        continue
      }

      console.log(`✅ Migrated ${record.work_package_id}`)
      migrated++

    } catch (error) {
      console.error(`❌ Failed to convert ${record.work_package_id}:`, error)
      failed++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📈 Migration Summary:')
  console.log(`   ✅ Migrated: ${migrated}`)
  console.log(`   ⏭️  Skipped:  ${skipped}`)
  console.log(`   ❌ Failed:   ${failed}`)
  console.log(`   📊 Total:    ${contents.length}`)
  console.log('='.repeat(50))

  if (failed > 0) {
    console.log('\n⚠️  Some records failed to migrate. Please review errors above.')
    process.exit(1)
  }

  console.log('\n✅ Migration completed successfully!')
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
