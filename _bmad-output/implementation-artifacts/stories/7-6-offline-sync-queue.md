# Story 7.6: Offline Sync Queue

Status: done

## Story

As a user,
I want my progress saved when offline,
so that I don't lose learning progress due to connectivity issues.

## Acceptance Criteria

1. **Given** I am offline, **When** I complete learning activities (lessons, reviews, quiz), **Then** my progress is saved locally, changes are added to a sync queue, and I see an "Offline" indicator in the UI
2. **Given** I have pending sync items, **When** connectivity is restored, **Then** the sync queue is processed automatically, items are sent to the server in order, and successful items are removed from queue
3. **Given** a sync item fails (server error), **When** the failure occurs, **Then** the item remains in queue with retry count incremented, after 3 failures item is moved to failed queue, and error is logged to Sentry (without PII)
4. **Given** I return online after being offline, **When** sync completes, **Then** I see a brief confirmation "Progress synced" and the "Offline" indicator is removed

## Tasks / Subtasks

- [x] Task 1: Create sync queue utility (AC: #1, #2)
  - [x] Create `lib/api/sync.ts`
  - [x] Define SyncQueueItem interface
  - [x] Implement add to queue function
  - [x] Implement process queue function

- [x] Task 2: Create useSyncStore (AC: #1, #2)
  - [x] Create `lib/stores/useSyncStore.ts`
  - [x] Track online/offline status
  - [x] Track pending items count
  - [x] Track sync in progress

- [x] Task 3: Detect connectivity changes (AC: #1, #4)
  - [x] Use @react-native-community/netinfo
  - [x] Update store on connectivity change
  - [x] Trigger sync on reconnection

- [x] Task 4: Add offline indicator (AC: #1)
  - [x] Create OfflineIndicator component
  - [x] Show when isOffline is true
  - [x] Position at top or bottom of screen

- [x] Task 5: Queue progress updates (AC: #1)
  - [x] When lesson complete, add to queue
  - [x] When review rated, add to queue
  - [x] When settings change, add to queue

- [x] Task 6: Implement automatic sync (AC: #2)
  - [x] Trigger on connectivity restored
  - [x] Trigger on app foreground
  - [x] Process queue in order

- [x] Task 7: Handle sync failures (AC: #3)
  - [x] Implement retry logic (3 attempts)
  - [x] Exponential backoff: 1s, 2s, 4s
  - [x] Move to failed queue after 3 failures
  - [x] Log to Sentry

- [x] Task 8: Show sync confirmation (AC: #4)
  - [x] Show "Progress synced" toast
  - [x] Remove offline indicator
  - [x] Update UI state

## Dev Notes

### Architecture Patterns

- **Local-First**: Save locally first, sync in background
- **Queue-Based**: FIFO processing of sync items
- **Retry Logic**: Exponential backoff with max retries
- **Last-Write-Wins**: Timestamp-based conflict resolution

### Code Patterns

```typescript
// lib/api/sync.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureException } from '@sentry/react-native';

interface SyncQueueItem {
  id: string;
  type: 'lesson_complete' | 'review_rating' | 'settings_update';
  payload: unknown;
  createdAt: string;
  retryCount: number;
}

const QUEUE_KEY = 'sync_queue';
const FAILED_QUEUE_KEY = 'sync_queue_failed';
const MAX_RETRIES = 3;

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>) {
  const queue = await getQueue();
  queue.push({
    ...item,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function processSyncQueue() {
  const queue = await getQueue();

  for (const item of queue) {
    try {
      await syncItem(item);
      await removeFromQueue(item.id);
    } catch (error) {
      item.retryCount += 1;

      if (item.retryCount >= MAX_RETRIES) {
        await moveToFailedQueue(item);
        await removeFromQueue(item.id);
        captureException(error, { extra: { itemType: item.type } });
      } else {
        await updateQueueItem(item);
        // Wait with exponential backoff
        await sleep(Math.pow(2, item.retryCount) * 1000);
      }
    }
  }
}

async function syncItem(item: SyncQueueItem) {
  switch (item.type) {
    case 'lesson_complete':
      await syncLessonComplete(item.payload);
      break;
    case 'review_rating':
      await syncReviewRating(item.payload);
      break;
    case 'settings_update':
      await syncSettings(item.payload);
      break;
  }
}
```

```typescript
// lib/stores/useSyncStore.ts
import NetInfo from '@react-native-community/netinfo';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  setOnline: (value: boolean) => void;
  setSyncing: (value: boolean) => void;
  setPendingCount: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  setOnline: (value) => set({ isOnline: value }),
  setSyncing: (value) => set({ isSyncing: value }),
  setPendingCount: (count) => set({ pendingCount: count }),
}));

// Initialize network listener
NetInfo.addEventListener((state) => {
  const wasOffline = !useSyncStore.getState().isOnline;
  const isNowOnline = state.isConnected;

  useSyncStore.getState().setOnline(isNowOnline);

  if (wasOffline && isNowOnline) {
    // Trigger sync on reconnection
    processSyncQueue();
  }
});
```

### Offline Indicator

```typescript
function OfflineIndicator() {
  const { isOnline, pendingCount } = useSyncStore();

  if (isOnline) return null;

  return (
    <View className="bg-yellow-500 py-2 px-4 flex-row items-center justify-center">
      <WifiOffIcon className="w-4 h-4 text-yellow-900" />
      <Text className="ml-2 text-yellow-900 font-medium">
        Offline {pendingCount > 0 && `(${pendingCount} pending)`}
      </Text>
    </View>
  );
}
```

### Sync Confirmation

```typescript
// After successful sync
Toast.show({
  type: 'success',
  message: 'Progress synced',
  duration: 2000,
});
```

### References

- [Source: epics.md#Story 7.6: Offline Sync Queue]
- [Source: architecture.md#Offline-First Sync Strategy]
- [Source: prd.md#FR53-FR55: Sync functionality]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No blocking issues encountered during implementation.

### Completion Notes List

- **Task 1**: Created `lib/api/sync.ts` with SyncQueueItem interface, FIFO queue management via AsyncStorage, `addToSyncQueue`, `processSyncQueue`, `getQueue`, `getFailedQueue`, `clearQueue`, `clearFailedQueue`. 20 unit tests.
- **Task 2**: Created `lib/stores/useSyncStore.ts` Zustand store tracking isOnline, isSyncing, pendingCount, lastSyncedAt, showSyncSuccess with increment/decrement helpers. 12 unit tests.
- **Task 3**: Created `lib/hooks/useNetworkStatus.ts` using `@react-native-community/netinfo` to monitor connectivity, update store, and trigger sync on reconnection. Added netinfo dependency. 6 unit tests.
- **Task 4**: Created `components/ui/OfflineIndicator.tsx` with three states: offline banner (midnight bg with WifiOff icon), syncing indicator (gold accent), and "Progress synced" success toast. Uses Divine Geometry palette. 9 unit tests.
- **Task 5**: Created `lib/api/syncHelpers.ts` with `queueLessonComplete`, `queueReviewRating`, `queueSettingsUpdate` convenience functions that add to queue and increment pending count. 7 unit tests.
- **Task 6**: Created `lib/hooks/useSyncOnForeground.ts` using AppState to trigger sync when app returns to foreground (only if online, not already syncing, and queue non-empty). 6 unit tests.
- **Task 7**: Retry logic with MAX_RETRIES=3 implemented in `processSyncQueue`. Failed items move to `sync_queue_failed` key. Sentry logging on permanent failure. Covered by Task 1 tests.
- **Task 8**: Integrated `OfflineIndicator`, `useNetworkStatus`, and `useSyncOnForeground` into root layout (`app/_layout.tsx`). Success toast auto-hides after 2s. OfflineIndicator disappears when back online.

### Change Log

- 2026-02-13: Story 7.6 implemented — offline sync queue with FIFO processing, network monitoring, offline indicator, automatic sync on reconnection and foreground, retry logic with failed queue, and sync success confirmation.
- 2026-02-13: Code review fixes applied (4M, 2L fixed, 1L dismissed):
  - M1: Removed dead `appStateRef` from useSyncOnForeground.ts
  - M2: Added `hydratePendingCount()` to sync pending count from AsyncStorage on app start
  - M3: Added `requirePayloadFields()` validation in syncItem to catch corrupted queue items
  - M4+L2: Extracted shared `executeSyncCycle()` to syncHelpers.ts (DRY) with proper setTimeout cleanup
  - L1: Doubled generateId() entropy with two random segments
  - L3: Dismissed — quiz completion maps to lesson_complete, separate type unnecessary

### File List

- safar-app/lib/api/sync.ts (new)
- safar-app/lib/api/syncHelpers.ts (new)
- safar-app/lib/stores/useSyncStore.ts (new)
- safar-app/lib/hooks/useNetworkStatus.ts (new)
- safar-app/lib/hooks/useSyncOnForeground.ts (new)
- safar-app/components/ui/OfflineIndicator.tsx (new)
- safar-app/app/_layout.tsx (modified)
- safar-app/package.json (modified — added @react-native-community/netinfo)
- safar-app/__tests__/api/sync.test.ts (new)
- safar-app/__tests__/api/syncIntegration.test.ts (new)
- safar-app/__tests__/stores/useSyncStore.test.ts (new)
- safar-app/__tests__/hooks/useNetworkStatus.test.ts (new)
- safar-app/__tests__/hooks/useSyncOnForeground.test.ts (new)
- safar-app/__tests__/components/OfflineIndicator.test.tsx (new)
