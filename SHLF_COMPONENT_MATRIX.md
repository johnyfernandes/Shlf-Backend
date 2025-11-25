# Shlf iOS App - Component Matrix & Dependencies

## Component Usage Map

```
SHARED COMPONENTS (6 total)
├─ BookCoverView ...................... Used in 3+ views
│  ├── SearchView (60x90px)
│  ├── LibraryView (50x75px) 
│  ├── BookDetailView (180x270px)
│  └── Collections (varies)
│
├─ CachedAsyncImage ................... Internal dependency
│  └── Used by BookCoverView only
│
├─ SkeletonView ....................... Used in 2+ views
│  ├── LibraryView (BookRowSkeleton)
│  ├── SearchView (SearchResultSkeleton)
│  ├── BookDetailView (MetadataCardSkeleton)
│  └── ProfileView (StatsRowSkeleton)
│
├─ ErrorView .......................... Used in 1+ views
│  └── SearchView (retry action)
│
├─ SyncToast .......................... Used globally
│  ├── ContentView (syncToast modifier)
│  ├── BookDetailView (toast modifier)
│  └── All feature views
│
└─ FlowLayout ......................... Custom layout
   └── Available but not widely used
```

## Embedded Components (Repeated Patterns)

```
BookRow Pattern (Appears 2-3 times with variations)
├── LibraryView -> BookRow
│   Cover (50x75) + Title + Author + Progress + Badge
│
├── SearchView -> SearchResultRow  
│   Cover (60x90) + Title + Subtitle + Author + Metadata
│
└── Collections -> CollectionRow
    Icon + Name + Count badge

StatRow Pattern (Appears 2-3 times)
├── BookDetailView -> BookStatRow
│   Label + Value (Started/Completed/Time)
│
└── ProfileView -> StatRow
    Label + Value (Books/Reading/Pages)

RatingDisplay Pattern (Appears 2 times)
├── BookDetailView -> Stars with label
│   5 interactive stars for rating
│
└── LibraryView -> Stars in badge
    Filled/unfilled stars in summary
```

## View Dependency Tree

```
ShlfApp
└── ContentView (TabView)
    │
    ├── LibraryView (226 lines + BookRow)
    │   ├── Uses: BookRowSkeleton, BookRow, ContentUnavailableView
    │   ├── State: selectedFilter, isLoading, showingBookDetail, bookSlots
    │   └── Modals:
    │       └── BookDetailView (562 lines) [SHEET]
    │           ├── Uses: BookCoverView, ProgressView, Slider
    │           ├── Uses: StarsInput, TextFields, RatingView
    │           ├── State: isSaving, showingDeleteAlert, showingReadingTimer
    │           └── Modals:
    │               └── ReadingTimerView [FULL-SCREEN]
    │
    ├── CollectionsView (96 lines + CollectionRow)
    │   ├── Uses: CollectionRow, ContentUnavailableView
    │   ├── State: showingCreateSheet, selectedCollection
    │   └── Modals:
    │       ├── CreateCollectionSheet [SHEET]
    │       └── CollectionDetailView [SHEET]
    │           ├── Shows books in collection
    │           └── Manages collection editing
    │
    ├── SearchView (308 lines + SearchResultRow)
    │   ├── Uses: SearchResultRow, BookCoverView, ErrorView
    │   ├── Uses: SearchResultSkeleton, SearchSuggestionButton
    │   ├── State: searchText, searchResults, isSearching, error
    │   ├── Modifiers: searchable(), debounce()
    │   └── Modals:
    │       ├── BookDetailSheet [SHEET]
    │       │   └── Add book to library
    │       └── BarcodeScannerView [FULL-SCREEN]
    │           └── Scan ISBN to search
    │
    └── ProfileView (272 lines)
        ├── Uses: ReadingGoalCard, StatsView, StatRow
        ├── Uses: ContentUnavailableView
        ├── State: showingLoginSheet, showingRegisterSheet, stats
        └── Modals:
            ├── LoginView [SHEET]
            ├── RegisterView [SHEET]
            ├── SetGoalSheet [SHEET]
            └── StatsView [NAVIGATION]
                └── Detailed reading statistics
```

## Styling Dependencies

```
COLOR SYSTEM (Implicit/Hardcoded)
├── Primary: .accentColor
├── States: .green, .red, .orange, .yellow
├── Text: .primary, .secondary, .tertiary
├── Backgrounds: .systemBackground, .systemGray6
└── Used by: Every component (duplicated)

TYPOGRAPHY SYSTEM (System defaults only)
├── Headlines: .title2, .title3, .headline
├── Body: .body, .subheadline, .caption, .caption2
├── Weights: .bold, .semibold, (default)
└── Used by: Every view (scattered)

SPACING SYSTEM (Hardcoded throughout)
├── Padding: 4, 6, 8, 12, 16, 20, 24px (mixed)
├── Gaps: 6, 8, 12, 16, 20, 24px (inconsistent)
├── Icons: 24-48px (hardcoded)
└── Covers: 50x75, 60x90, 100x150, 180x270 (hardcoded)

SHADOW SYSTEM (Multiple variations)
├── Light: .opacity(0.05), radius 8
├── Medium: .opacity(0.1), radius 4
├── Dark: .opacity(0.3), radius 20
└── Toast: .opacity(0.3), radius 12

CORNER RADIUS SYSTEM (Scattered)
├── Small: 6px (book covers, icons)
├── Medium: 12px (card sections, buttons)
├── Large: 16px (progress cards)
├── Extra-large: 20px (goal cards)
└── Capsule: toasts, suggestions
```

## Data Flow

```
API Layer
└── APIManager.shared (environment)
    ├── getBooks() -> BookSlotsDTO + [BookDTO]
    ├── searchBooks() -> [SearchResultDTO]
    ├── updateBook() -> BookDTO
    ├── deleteBook() -> success/error
    └── getReadingStats() -> ReadingStatsDTO

SwiftData Local Store
├── Book (read/write)
├── User (read/write)
├── ReadingSession (read/write)
├── ReadingGoal (read/write)
└── Collection (read/write)

Toast System
└── ToastManager.shared (environment)
    ├── success(message)
    ├── error(message)
    ├── warning(message)
    ├── syncing()
    └── info(message)

Sync System
└── SyncManager.shared (environment)
    ├── syncAll() -> push local changes
    ├── fetchAllFromBackend() -> pull remote
    └── isSyncing, isOnline, syncErrors

User State
└── APIManager.shared
    ├── currentUser: UserDTO?
    ├── isAuthenticated: Bool
    └── logout() -> clear auth

Device State
└── DeviceIDManager.shared (environment)
    └── deviceId: String
```

## Component Reusability Score

```
EXCELLENT (High reuse, well-designed)
├── CachedAsyncImage     [Used internally by BookCoverView] ████████ 8/10
├── BookCoverView        [Used in 3+ views, configurable] ███████ 7/10
├── SkeletonView         [Multiple variants, reusable] ███████ 7/10
└── SyncToast            [Global modifier, well-designed] ███████ 7/10

GOOD (Reusable, some duplication)
├── ErrorView            [Used with variations] ██████ 6/10
└── FlowLayout           [Underutilized custom layout] ██████ 6/10

POOR (High duplication, not extracted)
├── BookRow              [Repeated 2-3 times] ████ 4/10
├── StatRow              [Repeated 2+ times] ████ 4/10
├── RatingDisplay        [Repeated 2+ times] ████ 4/10
├── Card patterns        [Repeated 8+ times] ███ 3/10
├── Button styles        [Repeated 10+ times] ███ 3/10
└── Spacing              [Magic numbers 30+ times] ██ 2/10
```

## Refactoring Priority Matrix

```
        HIGH IMPACT │ LOW IMPACT
HIGH    │ Extract    │ Enhance
EFFORT  │ Modifiers  │ Documentation
        │ Animation  │
        ├────────────┼────────────┤
        │ Create     │ Create Form
        │ Buttons    │ Components
        │ Create     │ 
        │ Cards      │ Add
        │ Extract    │ Accessibility
LOW     │ Design     │
EFFORT  │ Tokens     │
        │ Extract    │
        │ Spacing    │
        │ Extract    │
        │ Colors     │
        └────────────┴────────────┘

PRIORITY ORDER:
1. Extract Colors (Quick win: 1-2h, High impact)
2. Extract Spacing (Quick win: 1-2h, High impact)
3. Create PrimaryButton (Quick: 30m, Medium impact)
4. Create Card Component (Medium: 1h, Medium impact)
5. Extract Typography (Medium: 1-2h, Medium impact)
6. Extract Metrics (Medium: 1-2h, Medium impact)
7. Create StatRow (Quick: 30m, Low impact)
8. Create RatingView (Medium: 1-2h, Low impact)
9. Create FormTextField (Medium: 1h, Low impact)
10. Standardize Animations (Advanced: 2h, Polish)
```

## Testing Coverage by Component

```
TESTABLE COMPONENTS
├── BookCoverView
│   ├── Various sizes display correctly
│   ├── Fallback placeholder shows when no URL
│   └── Shadow applied correctly
│
├── SkeletonView
│   ├── Animation triggers on appear
│   ├── Shimmer effect works
│   └── Variants render correctly
│
├── ErrorView
│   ├── Error message displays
│   ├── Retry button callbacks
│   └── Network error handling
│
├── SyncToast
│   ├── Toast appears with correct type
│   ├── Auto-dismiss timing
│   └── Modifier integration
│
├── CachedAsyncImage
│   ├── Image caching works
│   ├── Network fetch fallback
│   └── Placeholder display
│
└── FlowLayout
    ├── Items wrap correctly
    ├── Spacing consistent
    └── Height calculation accurate
```

## Known Limitations & Technical Debt

```
STYLING TECH DEBT
├── No design tokens file
│   Impact: Changes require searching 30+ files
│   Effort: 1-2 hours to extract
│   Benefit: 10x faster styling changes
│
├── Hardcoded spacing
│   Impact: Inconsistent alignment
│   Effort: 1-2 hours to standardize
│   Benefit: Cleaner code, easier maintenance
│
├── Duplicated button code
│   Impact: 10+ copies of similar logic
│   Effort: 30 mins to 1 hour per button type
│   Benefit: 50+ lines saved per file
│
├── Scattered typography
│   Impact: Font inconsistency
│   Effort: 1-2 hours to consolidate
│   Benefit: Easier dark mode support
│
├── Card pattern duplication
│   Impact: 8+ copies of shadow+border+padding
│   Effort: 1-2 hours to extract
│   Benefit: Faster design changes
│
└── No animation constants
    Impact: 15+ different animation durations
    Effort: 1-2 hours to standardize
    Benefit: Cohesive motion design
```

## Quick Stats

```
View Files:                22
Component Files:           6
Estimated Custom Views:    8 embedded
Total SLOC (Views):        ~3,500
Total SLOC (Components):   ~900
Avg File Size:             ~160 lines

Reuse Rate:                27% (6/22)
Code Duplication:          ~15-20% estimated
Missing Components:        10-15
Design System Gaps:        6 major areas
Styling Magic Numbers:     50+ instances
```

