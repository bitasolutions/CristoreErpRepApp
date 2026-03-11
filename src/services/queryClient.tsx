import AsyncStorage from '@react-native-async-storage/async-storage';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {QueryClient, defaultShouldDehydrateQuery} from '@tanstack/react-query';
import React from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 24 * 60 * 60 * 1000, // keep cache for offline fallback
      staleTime: 0,                  // always consider cache stale → refetch on mount
      refetchOnMount: true,          // refetch every time a screen mounts
      refetchOnReconnect: true,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CRISTORE_QUERY_CACHE',
});

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: asyncStoragePersister,
      maxAge: 24 * 60 * 60 * 1000,
      dehydrateOptions: {
        shouldDehydrateQuery: query => {
          if (!defaultShouldDehydrateQuery(query)) return false;
          // Only persist small, rarely-changing queries to avoid CursorWindow overflow
          const key = query.queryKey[0];
          return key === 'company' || key === 'categories' || key === 'subcategories';
        },
      },
    }}
  >
    {children}
  </PersistQueryClientProvider>
);
