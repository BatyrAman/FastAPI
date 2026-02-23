import { useMemo, useState } from "react";
import type { Book, BookCreate } from "../lib/api";

type Props = {
  mode: "create" | "edit";
  initial?: Partial<Book>;
  onSubmit: (data: BookCreate) => Promise<void>;
  onCancel?: () => void;
  busy?: boolean;
};

export function BookForm({ mode, initial, onSubmit, onCancel, busy }: Props) {
  const init = useMemo(() => {
    return {
      title: initial?.title ?? "",
      author: initial?.author ?? "",
      publisher: initial?.publisher ?? "",
      published_date: initial?.published_date ?? "2021-01-01",
      page_count: initial?.page_count ?? 100,
      language: initial?.language ?? "English",
    } satisfies BookCreate;
  }, [initial]);

  const [form, setForm] = useState<BookCreate>(init);
  const [err, setErr] = useState<string>("");

  function set<K extends keyof BookCreate>(k: K, v: BookCreate[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    // простая валидация
    if (!form.title.trim()) return setErr("Введите title");
    if (!form.author.trim()) return setErr("Введите author");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.published_date))
      return setErr("published_date должен быть в формате YYYY-MM-DD");
    if (!Number.isFinite(form.page_count) || form.page_count <= 0)
      return setErr("page_count должен быть положительным числом");

    await onSubmit(form);
  }

  return (
    <form onSubmit={submit} style={styles.form}>
      <div style={styles.row}>
        <label style={styles.label}>Title</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          style={styles.input}
          placeholder="Think Python"
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Author</label>
        <input
          value={form.author}
          onChange={(e) => set("author", e.target.value)}
          style={styles.input}
          placeholder="Allen B. Downey"
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Publisher</label>
        <input
          value={form.publisher}
          onChange={(e) => set("publisher", e.target.value)}
          style={styles.input}
          placeholder="O'Reilly Media"
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Published date</label>
        <input
          value={form.published_date}
          onChange={(e) => set("published_date", e.target.value)}
          style={styles.input}
          placeholder="2021-01-01"
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Page count</label>
        <input
          type="number"
          value={form.page_count}
          onChange={(e) => set("page_count", Number(e.target.value))}
          style={styles.input}
          min={1}
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Language</label>
        <input
          value={form.language}
          onChange={(e) => set("language", e.target.value)}
          style={styles.input}
          placeholder="English"
        />
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}

      <div style={styles.actions}>
        <button type="submit" disabled={busy} style={styles.btnPrimary}>
          {busy ? "..." : mode === "create" ? "Создать" : "Сохранить"}
        </button>
        {onCancel ? (
          <button type="button" disabled={busy} onClick={onCancel} style={styles.btn}>
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "white",
  },
  row: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, marginBottom: 10 },
  label: { fontWeight: 600, color: "#111827", alignSelf: "center" },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
  },
  actions: { display: "flex", gap: 10, marginTop: 14 },
  btnPrimary: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  btn: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  error: { marginTop: 10, color: "#b91c1c", fontWeight: 600 },
};