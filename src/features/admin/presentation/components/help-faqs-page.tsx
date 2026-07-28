"use client";

import { useState } from "react";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import type { HelpFaqRow, HelpFaqViewModel } from "@/features/admin/domain/entities/help-faqs";

type ApiFaqRow = { id: number; question: string; answer: string; is_active: boolean; updated_at: string | null };

function fromApiRow(row: ApiFaqRow): HelpFaqRow {
  return { id: row.id, question: row.question, answer: row.answer, isActive: row.is_active, updatedAt: row.updated_at };
}

async function readApiMessage(response: Response, fallback: string): Promise<string> {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;
  return data?.message ?? fallback;
}

export function HelpFaqsPage({ viewModel }: { viewModel: HelpFaqViewModel }) {
  const [rows, setRows] = useState<HelpFaqRow[]>(viewModel.rows);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingAnswer, setEditingAnswer] = useState("");
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [message, setMessage] = useState<string | null>(viewModel.loadError ?? null);
  const [messageTone, setMessageTone] = useState<"success" | "error">(viewModel.loadError ? "error" : "success");

  async function createEntry() {
    const question = newQuestion.trim();
    const answer = newAnswer.trim();
    if (!question || !answer) return;
    setBusyId("new");
    setMessage(null);
    const response = await fetch("/api/admin/help-faqs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to add this FAQ entry."));
      setBusyId(null);
      return;
    }
    const created = (await response.json()) as ApiFaqRow;
    setRows((previous) => [...previous, fromApiRow(created)]);
    setNewQuestion("");
    setNewAnswer("");
    setBusyId(null);
    setMessageTone("success");
    setMessage("FAQ entry added.");
  }

  async function saveEdit(row: HelpFaqRow) {
    const question = editingQuestion.trim();
    const answer = editingAnswer.trim();
    if (!question || !answer) return;
    setBusyId(row.id);
    setMessage(null);
    const response = await fetch(`/api/admin/help-faqs/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to update this FAQ entry."));
      setBusyId(null);
      return;
    }
    const updated = (await response.json()) as ApiFaqRow;
    setRows((previous) => previous.map((item) => (item.id === updated.id ? fromApiRow(updated) : item)));
    setEditingId(null);
    setBusyId(null);
    setMessageTone("success");
    setMessage("FAQ entry updated.");
  }

  async function toggleActive(row: HelpFaqRow) {
    setBusyId(row.id);
    setMessage(null);
    const response = await fetch(`/api/admin/help-faqs/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: !row.isActive }),
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to update this FAQ entry's status."));
      setBusyId(null);
      return;
    }
    const updated = (await response.json()) as ApiFaqRow;
    setRows((previous) => previous.map((item) => (item.id === updated.id ? fromApiRow(updated) : item)));
    setBusyId(null);
    setMessageTone("success");
    setMessage(row.isActive ? "FAQ entry hidden from the app." : "FAQ entry shown in the app again.");
  }

  async function removeEntry(row: HelpFaqRow) {
    setBusyId(row.id);
    setMessage(null);
    const response = await fetch(`/api/admin/help-faqs/${row.id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to remove this FAQ entry."));
      setBusyId(null);
      return;
    }
    setRows((previous) => previous.filter((item) => item.id !== row.id));
    setBusyId(null);
    setMessageTone("success");
    setMessage("FAQ entry removed.");
  }

  async function move(row: HelpFaqRow, direction: "up" | "down") {
    const index = rows.findIndex((item) => item.id === row.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;

    const reordered = [...rows];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setRows(reordered);
    setBusyId(row.id);
    setMessage(null);
    const response = await fetch("/api/admin/help-faqs/reorder", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ordered_ids: reordered.map((item) => item.id) }),
    });
    if (!response.ok) {
      setRows(rows);
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to reorder FAQ entries."));
    }
    setBusyId(null);
  }

  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[720px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
        </div>

        <div className="bg-[var(--color-surface-strong)] px-4 py-6">
          {message ? (
            <p className={`mb-4 text-[13px] ${messageTone === "error" ? "text-[#ef4335]" : "text-[#6BFFB4]"}`}>{message}</p>
          ) : null}

          <div className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/50">Add a question</h2>
            <div className="mt-3 space-y-3">
              <input
                value={newQuestion}
                onChange={(event) => setNewQuestion(event.target.value)}
                placeholder="Question"
                className="h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
              />
              <textarea
                value={newAnswer}
                onChange={(event) => setNewAnswer(event.target.value)}
                placeholder="Answer"
                rows={3}
                className="w-full resize-y rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] text-white outline-none focus:border-[#9B68D5]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={createEntry}
                  disabled={busyId === "new" || !newQuestion.trim() || !newAnswer.trim()}
                  className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  {busyId === "new" ? "Adding..." : "Add FAQ"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-[12px] border border-white/6 bg-[var(--color-surface-elevated)] px-4 py-4"
              >
                {editingId === row.id ? (
                  <div className="space-y-3">
                    <input
                      value={editingQuestion}
                      onChange={(event) => setEditingQuestion(event.target.value)}
                      className="h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                    />
                    <textarea
                      value={editingAnswer}
                      onChange={(event) => setEditingAnswer(event.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 py-2 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(row)}
                        disabled={busyId === row.id || !editingQuestion.trim() || !editingAnswer.trim()}
                        className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/85 disabled:opacity-50"
                      >
                        {busyId === row.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={busyId === row.id}
                        className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/70 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-white">{row.question}</p>
                      <p className="mt-1 text-[13px] text-white/70">{row.answer}</p>
                      <p className="mt-2 text-[11px] text-white/40">{row.isActive ? "Shown in app" : "Hidden from app"}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => move(row, "up")}
                          disabled={index === 0 || busyId === row.id}
                          aria-label={`Move "${row.question}" up`}
                          className="rounded-[6px] border border-white/15 px-2 py-1 text-[12px] text-white/70 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(row, "down")}
                          disabled={index === rows.length - 1 || busyId === row.id}
                          aria-label={`Move "${row.question}" down`}
                          className="rounded-[6px] border border-white/15 px-2 py-1 text-[12px] text-white/70 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(row.id);
                            setEditingQuestion(row.question);
                            setEditingAnswer(row.answer);
                          }}
                          disabled={busyId === row.id}
                          className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/85 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(row)}
                          disabled={busyId === row.id}
                          className="rounded-[8px] border border-[#9B68D5] px-3 py-1 text-[12px] text-[#cba7ff] disabled:opacity-50"
                        >
                          {row.isActive ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEntry(row)}
                          disabled={busyId === row.id}
                          className="rounded-[8px] border border-[#ef4335]/40 px-3 py-1 text-[12px] text-[#ef4335] disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {rows.length === 0 ? <p className="text-[13px] text-white/55">No FAQ entries yet.</p> : null}
          </div>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
