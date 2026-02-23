import { useEffect, useMemo, useState } from "react";
import { api, type Book, type BookCreate } from "./lib/api";
import { BookForm } from "./components/BookForm";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) =>
      [b.title, b.author, b.publisher, b.language].some((x) =>
        x.toLowerCase().includes(q)
      )
    );
  }, [books, query]);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const data = await api.listBooks();
      setBooks(data);
    } catch (e: any) {
      setError(e?.message ?? "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createBook(payload: BookCreate) {
    setBusy(true);
    setError("");
    try {
      const created = await api.createBook(payload);
      setBooks((p) => [created, ...p]);
    } catch (e: any) {
      setError(e?.message ?? "Ошибка создания");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(payload: BookCreate) {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api.updateBook(editing.uid, payload);
      setBooks((p) => p.map((b) => (b.uid === updated.uid ? updated : b)));
      setEditing(null);
    } catch (e: any) {
      setError(e?.message ?? "Ошибка обновления");
    } finally {
      setBusy(false);
    }
  }

  async function remove(uid: string) {
    if (!confirm("Удалить книгу?")) return;
    setBusy(true);
    setError("");
    try {
      await api.deleteBook(uid);
      setBooks((p) => p.filter((b) => b.uid !== uid));
    } catch (e: any) {
      setError(e?.message ?? "Ошибка удаления");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Bookly — Frontend</h1>
          <div style={styles.sub}>
            API: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}</code>
          </div>
        </div>
        <button onClick={refresh} disabled={loading || busy} style={styles.btn}>
          Обновить
        </button>
      </header>

      {error ? <div style={styles.error}>{error}</div> : null}

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.h2}>{editing ? "Редактировать" : "Создать книгу"}</h2>
          <BookForm
            mode={editing ? "edit" : "create"}
            initial={editing ?? undefined}
            onSubmit={editing ? saveEdit : createBook}
            onCancel={editing ? () => setEditing(null) : undefined}
            busy={busy}
          />
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.h2}>Книги</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по title/author/publisher/language..."
              style={styles.search}
            />
          </div>

          {loading ? (
            <div>Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div>Пока нет книг.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>Published</th>
                    <th style={styles.th}>Pages</th>
                    <th style={styles.th}>Lang</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.uid}>
                      <td style={styles.td}>{b.title}</td>
                      <td style={styles.td}>{b.author}</td>
                      <td style={styles.td}>{b.published_date}</td>
                      <td style={styles.td}>{b.page_count}</td>
                      <td style={styles.td}>{b.language}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            style={styles.btnSmall}
                            disabled={busy}
                            onClick={() => setEditing(b)}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.btnSmallDanger}
                            disabled={busy}
                            onClick={() => remove(b.uid)}
                          >
                            Delete
                          </button>
                        </div>
                        <div style={styles.uid}>
                          uid: <code>{b.uid}</code>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <footer style={styles.footer}>
        Если видишь ошибку CORS — проверь middleware в FastAPI и URL в <code>.env</code>.
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: "0 auto", padding: 18, fontFamily: "system-ui, Arial" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  h1: { margin: 0, fontSize: 28 },
  sub: { color: "#374151", marginTop: 6 },
  grid: { display: "grid", gridTemplateColumns: "420px 1fr", gap: 16, alignItems: "start" },
  card: { border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#fff" },
  h2: { margin: "0 0 12px 0" },
  btn: {
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  error: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontWeight: 600,
    whiteSpace: "pre-wrap",
  },
  listHeader: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
  search: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 12px",
    width: "55%",
    outline: "none",
  },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 10, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  td: { padding: 10, borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },
  btnSmall: {
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
  },
  btnSmallDanger: {
    border: "1px solid #ef4444",
    background: "white",
    color: "#b91c1c",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
  },
  uid: { marginTop: 6, color: "#6b7280", fontSize: 12 },
  footer: { marginTop: 18, color: "#6b7280" },
};