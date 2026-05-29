'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import {
  ChevronRight,
  Droplets,
  Expand,
  Eye,
  Focus,
  Heart,
  Infinity,
  MessageSquare,
  Scan,
  Waves,
  Wind,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@workspace/ui/components/sidebar'
import { cn } from '@workspace/ui/lib/utils'
import type { Category, Difficulty, EnrichedVerse } from '@/lib/types/verse'
import { DHARANA_CATEGORIES, type VerseGroups } from '@/lib/data/verses'

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Breath: Wind,
  Sound: Waves,
  Visualization: Eye,
  Space: Expand,
  Body: Scan,
  Emotion: Heart,
  Dissolution: Droplets,
  Awareness: Focus,
  Nonduality: Infinity,
  Dialogue: MessageSquare,
}

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  beginner: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-rose-500',
}

interface VerseSidebarProps {
  groups: VerseGroups
}

export function VerseSidebar({ groups }: VerseSidebarProps) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [openSections, setOpenSections] = useState({
    opening: false,
    dharanas: false,
    closing: false,
  })
  const [openCategories, setOpenCategories] = useState<Set<Category>>(new Set())
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')

  const activeVerse = pathname.startsWith('/vidya/verse/')
    ? parseInt(pathname.split('/').pop() ?? '0', 10)
    : null

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matchVerse = (v: EnrichedVerse) => {
      const matchesQuery = !q || v.method_name.toLowerCase().includes(q)
      const matchesDifficulty = difficultyFilter === 'all' || v.difficulty === difficultyFilter
      return matchesQuery && matchesDifficulty
    }

    const dharanas: Partial<Record<Category, EnrichedVerse[]>> = {}
    for (const [cat, verses] of Object.entries(groups.dharanas) as [Category, EnrichedVerse[]][]) {
      const filtered = verses.filter(matchVerse)
      if (filtered.length > 0) dharanas[cat] = filtered
    }

    return {
      opening: groups.opening.filter(matchVerse),
      dharanas,
      closing: groups.closing.filter(matchVerse),
    }
  }, [groups, query, difficultyFilter])

  // Auto-expand sections that have results when a filter is active
  useEffect(() => {
    const isFiltering = query.trim() !== '' || difficultyFilter !== 'all'
    if (!isFiltering) return

    setOpenSections(prev => ({
      opening: prev.opening || filteredGroups.opening.length > 0,
      dharanas: prev.dharanas || Object.keys(filteredGroups.dharanas).length > 0,
      closing: prev.closing || filteredGroups.closing.length > 0,
    }))
    setOpenCategories(prev => {
      const next = new Set(prev)
      for (const cat of Object.keys(filteredGroups.dharanas)) next.add(cat as Category)
      return next
    })
  }, [query, difficultyFilter, filteredGroups])

  const toggleSection = (section: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))

  const toggleCategory = (cat: Category) =>
    setOpenCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 pt-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Vijñāna Bhairava Tantra
          </p>
        </div>
        <SidebarInput
          placeholder="Search verses…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* ── Opening Inquiry ─────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection('opening')}
            className="cursor-pointer select-none hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors"
          >
            <ChevronRight
              className={cn('transition-transform duration-200', openSections.opening && 'rotate-90')}
            />
            Opening Inquiry
            <span className="ml-auto font-normal text-muted-foreground/60 tabular-nums">
              1–23
            </span>
          </SidebarGroupLabel>

          {openSections.opening && filteredGroups.opening.length > 0 && (
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredGroups.opening.map(verse => (
                  <VerseItem
                    key={verse.verse_number}
                    verse={verse}
                    isActive={activeVerse === verse.verse_number}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── The 112 Dharanas ────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection('dharanas')}
            className="cursor-pointer select-none hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors"
          >
            <ChevronRight
              className={cn('transition-transform duration-200', openSections.dharanas && 'rotate-90')}
            />
            The 112 Dharanas
            <span className="ml-auto font-normal text-muted-foreground/60 tabular-nums">
              24–138
            </span>
          </SidebarGroupLabel>

          {openSections.dharanas && (
            <SidebarGroupContent>
              <SidebarMenu>
                {DHARANA_CATEGORIES.map(cat => {
                  const verses = filteredGroups.dharanas[cat]
                  if (!verses || verses.length === 0) return null
                  const Icon = CATEGORY_ICONS[cat]
                  const isOpen = openCategories.has(cat)

                  return (
                    <SidebarMenuItem key={cat}>
                      <SidebarMenuButton onClick={() => toggleCategory(cat)}>
                        <Icon />
                        <span>{cat}</span>
                        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-xs tabular-nums">{verses.length}</span>
                          <ChevronRight
                            className={cn(
                              'transition-transform duration-200',
                              isOpen && 'rotate-90'
                            )}
                          />
                        </span>
                      </SidebarMenuButton>

                      {isOpen && (
                        <SidebarMenuSub>
                          {verses.map(verse => (
                            <SidebarMenuSubItem key={verse.verse_number}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={activeVerse === verse.verse_number}
                                size="sm"
                              >
                                <Link href={`/vidya/verse/${verse.verse_number}`}>
                                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                    {verse.verse_number}
                                  </span>
                                  <span className="flex-1 truncate">{verse.method_name}</span>
                                  <div
                                    className={cn(
                                      'ml-auto size-1.5 shrink-0 rounded-full',
                                      DIFFICULTY_DOT[verse.difficulty]
                                    )}
                                  />
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Closing Dialogue ────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupLabel
            onClick={() => toggleSection('closing')}
            className="cursor-pointer select-none hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors"
          >
            <ChevronRight
              className={cn('transition-transform duration-200', openSections.closing && 'rotate-90')}
            />
            Closing Dialogue
            <span className="ml-auto font-normal text-muted-foreground/60 tabular-nums">
              139–163
            </span>
          </SidebarGroupLabel>

          {openSections.closing && filteredGroups.closing.length > 0 && (
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredGroups.closing.map(verse => (
                  <VerseItem
                    key={verse.verse_number}
                    verse={verse}
                    isActive={activeVerse === verse.verse_number}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-2 py-2.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Level
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs capitalize transition-colors',
                  difficultyFilter === level
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function VerseItem({ verse, isActive }: { verse: EnrichedVerse; isActive: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} size="sm">
        <Link href={`/vidya/verse/${verse.verse_number}`}>
          <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {verse.verse_number}
          </span>
          <span className="flex-1 truncate">{verse.method_name}</span>
          <div
            className={cn('ml-auto size-1.5 shrink-0 rounded-full', DIFFICULTY_DOT[verse.difficulty])}
          />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
