"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: { name: string };
  author: { name: string };
}

export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/knowledge/articles?search=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Αναζήτηση στα άρθρα..."
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {searched && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white rounded-lg border shadow-lg max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">
              Δεν βρέθηκαν αποτελέσματα
            </div>
          ) : (
            results.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge/${article.slug}`}
                className="block px-4 py-3 hover:bg-gray-50 border-b last:border-0"
                onClick={() => {
                  setQuery("");
                  setSearched(false);
                }}
              >
                <p className="text-sm font-medium">{article.title}</p>
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {article.category.name}
                </Badge>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
