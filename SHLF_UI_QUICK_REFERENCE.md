# Shlf iOS App - Quick Reference Guide

## Component Inventory

### Currently Available (6 Components)
```
1. BookCoverView          [Configurable] → Used in Library, Search, Collections
2. CachedAsyncImage       [Reusable]     → Image loading with cache
3. SkeletonView           [Variants]     → BookRowSkeleton, SearchResultSkeleton, etc.
4. ErrorView              [Standard]     → Error state + retry
5. SyncToast              [Modifiers]    → GlobalToastModifier, SyncToastModifier
6. FlowLayout             [Custom]       → Wrapping layout system
```

### Currently Missing (High Priority)
```
BUTTONS (Used 10+ places)
├── PrimaryButton         [Blue backgrounds, full width]
├── SecondaryButton       [Opacity backgrounds]
├── DestructiveButton     [Red backgrounds]
└── CardActionButton      [Icon + label pattern]

CARDS (Duplicated 8+ places)
├── Generic Card          [Background, shadow, rounded corners]
├── MetadataCard          [Icon, label, value layout]
├── StatCard              [Label + stat display]
└── BookInfoCard          [Cover + title + metadata]

ROWS (Repeated patterns)
├── BookRow               [Cover + title + author + status]
├── StatRow               [Label + value]
├── InfoRow               [Icon + label + value]
└── SectionHeaderWithBadge [Title + count badge]

INPUTS (Scattered implementation)
├── FormTextField         [Standard styling]
├── FormTextEditor        [Multi-line input]
├── RatingInput           [Interactive stars]
└── RatingView            [Display-only stars]

PROGRESS (Multiple implementations)
├── LinearProgressBar     [Percentage bar]
├── CircularProgress      [Goal progress]
└── ProgressIndicator     [Generic]

FEEDBACK
├── EmptyState            [Icon + title + action]
├── LoadingState          [Skeleton variation]
├── Toast                 [Notification]
└── Error Alert           [Standardized errors]
```

## Styling Constants to Extract

### Colors
```
Primary: .accentColor (blue)
Success: .green
Warning: .orange
Error: .red
Info: .blue

Secondary Colors:
├── Text:          .primary, .secondary, .tertiary
├── Backgrounds:   .systemBackground, .systemGray6
├── Borders:       .gray.opacity(0.2)
└── Interactive:   Color.opacity(0.1) for backgrounds
```

### Typography
```
Headlines:
├── .title2       → Book titles
├── .title3       → Section headers  
└── .headline     → Primary content

Body:
├── .body         → Default
├── .subheadline  → Secondary info
├── .caption      → Metadata
└── .caption2     → Minimal

Weights:
├── .bold         → Titles
├── .semibold     → Important
└── (default)     → Regular
```

### Spacing Patterns
```
Horizontal Padding:    Standard .padding()
Vertical Padding:      4px to 24px variants
HStack/VStack:         8, 12, 16, 20, 24px
Section Gaps:          16-24px
Card Padding:          16-20px
```

### Corner Radii
```
Small:      6px (book covers, icons)
Medium:     12px (cards, buttons)
Large:      16px (progress cards)
X-Large:    20px (goal cards)
Capsule:    Used for toasts
```

### Shadows
```
Light:      .black.opacity(0.05), radius: 8, x: 0, y: 4
Medium:     .black.opacity(0.1), radius: 4, x: 0, y: 2
Dark:       .black.opacity(0.3), radius: 20, x: 0, y: 10
Toast:      .black.opacity(0.3), radius: 12, x: 0, y: 4
Book Cover: .black.opacity(0.1), radius: 4, x: 0, y: 2
```

## View Organization

```
ContentView (Root)
└── TabView
    ├── LibraryView
    │   ├── BookDetailView (sheet)
    │   └── ReadingTimerView (full-screen)
    │
    ├── CollectionsView
    │   ├── CollectionDetailView (sheet)
    │   └── CreateCollectionSheet (sheet)
    │
    ├── SearchView
    │   ├── BookDetailSheet (sheet)
    │   └── BarcodeScannerView (full-screen)
    │
    └── ProfileView
        ├── LoginView (sheet)
        ├── RegisterView (sheet)
        ├── SetGoalSheet (sheet)
        └── StatsView (nav link)
```

## Code Metrics

```
Total View Files:        22
Total Component Files:    6
Lines of Code (Views):   ~3,500
Lines of Code (Components): ~900
Avg View Size:           ~160 lines
Avg Component Size:      ~150 lines

Reusable Components:     6 (27%)
Embedded Components:     8 (36%)
Feature Views:           8 (36%)
```

## Duplication Hotspots

```
BUTTON STYLING                [Appears in: 10+ files]
├── Primary button pattern    [BookDetailView, Profile, Collections, Search]
├── Destructive pattern       [LibraryView, BookDetailView, Collections]
└── Secondary pattern         [Multiple sheets]

CARD PATTERN                  [Appears in: 8+ files]
├── Rounded rectangle + shadow [BookDetailView, ReadingGoalCard, ProfileView]
├── Background color system   [systemBackground, systemGray6 mix]
└── Padding consistency       [16-20px variations]

SPACING                       [Scattered throughout]
├── Horizontal: inconsistent values
├── Vertical: inconsistent values
└── Section gaps: hardcoded

TYPOGRAPHY                    [No constants]
├── Font size: system defaults only
├── Font weight: .bold, .semibold mixed
└── Line limits: hardcoded where used

EMPTY STATES                  [Duplicated 3+ times]
├── ContentUnavailableView    [LibraryView, SearchView, CollectionsView]
└── Icon + title + action     [Same pattern]
```

## High-Impact Refactoring

### Quick Wins (Start Here)
```
1. Extract Colors.swift
   Impact: High | Effort: Low | Time: 1-2 hours
   Reduces: Color duplication, hard to change

2. Extract Spacing.swift
   Impact: High | Effort: Low | Time: 1-2 hours
   Reduces: Padding inconsistency, easier alignment

3. Create PrimaryButton.swift
   Impact: Medium | Effort: Low | Time: 30 mins
   Reduces: Code duplication in 10+ files

4. Create Card.swift
   Impact: Medium | Effort: Low | Time: 1 hour
   Reduces: Repeated card styling pattern
```

### Medium Effort (Next Phase)
```
5. Create Typography.swift
   Impact: Medium | Effort: Low | Time: 1-2 hours
   Reduces: Scattered font definitions

6. Extract Metrics.swift
   Impact: Medium | Effort: Low | Time: 1-2 hours
   Reduces: Magic numbers for sizes

7. Create StatRow.swift
   Impact: Low | Effort: Low | Time: 30 mins
   Reduces: BookStatRow + StatRow duplication

8. Create RatingView/RatingInput.swift
   Impact: Low | Effort: Medium | Time: 1-2 hours
   Reduces: Star display/input duplication
```

### Advanced (Polish)
```
9. Create FormTextField.swift
   Impact: Low | Effort: Low | Time: 1 hour
   Reduces: Input field styling inconsistency

10. Standardize Animations.swift
    Impact: Low | Effort: Medium | Time: 2 hours
    Reduces: Hardcoded animation values
```

## File Locations (Absolute Paths)

### Components (Currently)
```
/Users/john/Developer/XCode/Shlf/Shlf/Views/Components/
├── BookCoverView.swift
├── CachedAsyncImage.swift
├── ErrorView.swift
├── FlowLayout.swift
├── SkeletonView.swift
└── SyncToast.swift
```

### Main Views
```
/Users/john/Developer/XCode/Shlf/Shlf/Views/
├── Library/
│   ├── BookDetailView.swift
│   ├── LibraryView.swift
│   └── ReadingTimerView.swift
├── Search/
│   ├── BarcodeScannerView.swift
│   ├── BookDetailSheet.swift
│   └── SearchView.swift
├── Collections/
│   ├── CollectionDetailView.swift
│   ├── CollectionsView.swift
│   └── CreateCollectionSheet.swift
├── Profile/
│   ├── LoginView.swift
│   ├── ProfileView.swift
│   ├── ReadingGoalCard.swift
│   ├── RegisterView.swift
│   ├── SetGoalSheet.swift
│   └── StatsView.swift
├── App/
│   └── ShlfApp.swift
└── ContentView.swift
```

## Integration Points

### Environment Objects
```
@Environment(APIManager.self)      → API calls
@Environment(\.modelContext)       → SwiftData access
@Environment(SyncManager.self)     → Data sync
@Environment(ToastManager.self)    → Notifications
@Environment(DeviceIDManager.self) → Device ID
@Environment(HapticManager.self)   → Haptic feedback
```

### Key Managers (Utilities)
```
/Users/john/Developer/XCode/Shlf/Shlf/Utilities/
├── ImageCache.swift              → Image caching
├── KeychainHelper.swift           → Secure storage
├── ToastManager.swift             → Toast notifications
├── HapticManager.swift            → Haptic feedback
├── DeviceIDManager.swift          → Device tracking
└── Extensions/View+Extensions.swift
    ├── hapticFeedback()
    ├── pressAnimation()
    ├── debounce()
    └── PressAnimationButtonStyle
```

## Design Decisions

### Strengths
```
✓ Tab-based navigation           → Familiar iOS pattern
✓ List-based layouts             → iOS conventions
✓ SwiftData for local storage    → Type-safe persistence
✓ Async/await patterns           → Modern concurrency
✓ Sheet vs full-screen modals    → Appropriate for content
✓ Haptic feedback integrated     → User feedback
✓ Loading states with skeletons  → Good UX
✓ Error handling with retry      → Resilient
```

### Opportunities
```
→ Create design tokens           → Consistency
→ Extract button styles          → Reusability
→ Standardize card patterns      → Maintainability
→ Add accessibility labels       → WCAG compliance
→ Create input components        → Form consistency
→ Unify empty state patterns     → User experience
→ Add animation utilities        → Cohesive motion
```

