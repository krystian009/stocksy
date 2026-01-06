import { vi } from "vitest";
import type { SupabaseClient } from "@/db/supabase.client";

export const createMockQueryBuilder = (defaultData: unknown = [], defaultError: unknown = null) => {
  // thenFn handles await on the chain itself (e.g. await query.eq())
  const thenFn = vi.fn((resolve) => {
    // Mimic Supabase behavior: it resolves with { data, error } object
    // It does not reject the promise itself usually, unless network error,
    // but the client usually wraps errors in the object.
    resolve({ data: defaultData, error: defaultError });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(), // Re-adding range method
    // Terminal methods that return promises
    single: vi.fn().mockResolvedValue({ data: defaultData, error: defaultError }),
    maybeSingle: vi.fn().mockResolvedValue({ data: defaultData, error: defaultError }),
    // Thenable interface
    then: thenFn,
  };

  return builder;
};

export const createMockSupabase = () => {
  const queryBuilder = createMockQueryBuilder();

  const client = {
    from: vi.fn().mockReturnValue(queryBuilder),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
    },
  } as unknown as SupabaseClient;

  return { client, queryBuilder };
};
