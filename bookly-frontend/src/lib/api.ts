export type Book = {
  uid: string;
  title: string;
  author: string;
  publisher: string;
  published_date: string; // "YYYY-MM-DD"
  page_count: number;
  language: string;
};

export type BookCreate = Omit<Book, "uid">;
export type BookUpdate = Partial<BookCreate>;

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  // DELETE 204 -> без body
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const api = {
  listBooks: () => http<Book[]>("/api/v1/books"),
  createBook: (payload: BookCreate) =>
    http<Book>("/api/v1/books", { method: "POST", body: JSON.stringify(payload) }),
  updateBook: (uid: string, payload: BookUpdate) =>
    http<Book>(`/api/v1/book/${uid}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBook: (uid: string) =>
    http<void>(`/api/v1/book/${uid}`, { method: "DELETE" }),
};