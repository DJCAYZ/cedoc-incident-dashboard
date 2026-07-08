"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createPreparedness,
  deletePreparedness,
  getPreparedness,
  Preparedness,
  Session,
} from "../actions";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Trash2, FileText } from "lucide-react";

function PaginationBar({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
            <button 
                type="button"
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
                Prev
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Page {currentPage} of {totalPages}</span>
            <button 
                type="button"
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
                Next
            </button>
        </div>
    );
}

export function PreparednessForm({
  activeSessions,
}: {
  activeSessions: Session[];
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number>(
    activeSessions.length > 0 ? activeSessions[0].id : 0
  );
  const [items, setItems] = useState<Preparedness[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    getPreparedness(sessionId).then((data) => {
      if (!cancelled) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !sessionId) return;
    setIsAdding(true);
    try {
      await createPreparedness(sessionId, title.trim(), description.trim());
      // Refresh
      const data = await getPreparedness(sessionId);
      setItems(data);
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this preparedness measure?")) return;
    try {
      await deletePreparedness(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  if (activeSessions.length === 0) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <ShieldCheck size={16} />
          <span>Create an event session to add preparedness measures.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-400" />
          <span>Disaster Preparedness Measures</span>
        </h2>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">
          {items.length} Active
        </span>
      </div>

      {/* Session Selector */}
      <select
        value={sessionId}
        onChange={(e) => setSessionId(Number(e.target.value))}
        className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer font-medium"
      >
        {activeSessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} (ID: #{s.id})
          </option>
        ))}
      </select>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Preparedness measure title..."
          className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-slate-600"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description / instructions..."
          rows={2}
          className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-slate-600 resize-none"
          required
        />
        <Button
          type="submit"
          disabled={isAdding || !title.trim() || !description.trim()}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer w-full text-xs py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-amber-500/25 disabled:opacity-40"
        >
          <Plus size={14} className="mr-1.5" />
          {isAdding ? "Adding..." : "Add Preparedness Measure"}
        </Button>
      </form>

      {/* Existing Items */}
      {items.length > 0 && (
        <>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={12} className="text-amber-400 shrink-0" />
                    <h4 className="text-sm font-bold text-white truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed break-words">
                    {item.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-rose-500/50 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer self-start opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <PaginationBar currentPage={currentPage} totalItems={items.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
