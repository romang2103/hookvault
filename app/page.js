"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Helper function to get unique items from a list (used to get each category/subcategory)
const getUniqueByKey = (array, key) => [
  ...new Set(array.map((item) => item[key])),
];

// Helper function: Format date on hook cards
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function: Format category/subcategory names (E.g. personal_info -> Personal info)
const formatLabel = (str) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const [copiedIndex, setCopiedIndex] = useState(null);

  // Pagination variables
  const [currentPage, setCurrentPage] = useState(1);
  const hooksPerPage = 20;

  // API call to fetch data from the database
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/test");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Logic to obtain list subcategories
  useEffect(() => {
    if (!selectedCategory) return;
    const filtered = data.filter((item) => item.category === selectedCategory);
    setSubcategories(getUniqueByKey(filtered, "subcategory"));
  }, [selectedCategory, data]);

  const categories = getUniqueByKey(data, "category");

  // Logic for filtering hooks
  const filteredHooks = data.filter((item) => {
    if (selectedCategory && selectedSubcategory) {
      return (
        item.category === selectedCategory &&
        item.subcategory === selectedSubcategory
      );
    } else if (selectedCategory) {
      return item.category === selectedCategory;
    }
    return true; // no filters applied
  });

  // Pagination
  const totalPages = Math.ceil(filteredHooks.length / hooksPerPage);
  const paginatedHooks = filteredHooks.slice(
    (currentPage - 1) * hooksPerPage,
    currentPage * hooksPerPage
  );

  // Reset page number to 0 when categories/subcategories change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory]);

  // Logic for copying hook to clipboard
  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-16 sm:p-20 border-2">
      {/* Header */}
      <header className="text-center p-4">
        <h1 className="text-4xl font-extrabold">Welcome to HookVault</h1>
        <p className="text-lg mt-2">
          Discover, generate, and save viral social media hooks
        </p>
      </header>

      {/* Category Selection */}
      <section className="text-center p-4">
        <p className="text-xl mb-2">Choose your category</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Button
                key={category}
                className={`px-4 py-2 ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => {
                  if (selectedCategory === category) {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                  } else {
                    setSelectedCategory(category);
                    setSelectedSubcategory("");
                  }
                }}
              >
                {formatLabel(category)}
              </Button>
            ))
          ) : (
            <p className="text-gray-400">No categories available</p>
          )}
        </div>
      </section>

      {/* Subcategory Selection */}
      {selectedCategory && (
        <section className="text-center">
          <p className="text-xl mb-2">Choose your subcategory</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <Button
                  key={subcategory}
                  className={`px-4 py-2 ${
                    selectedSubcategory === subcategory
                      ? "bg-black text-white"
                      : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (selectedSubcategory === subcategory) {
                      setSelectedSubcategory("");
                    } else {
                      setSelectedSubcategory(subcategory);
                    }
                  }}
                >
                  {formatLabel(subcategory)}
                </Button>
              ))
            ) : (
              <p className="text-gray-400">No subcategories available</p>
            )}
          </div>
        </section>
      )}

      {/* Hook Cards */}
      <section className="w-full max-w-6xl">
        <h2 className="text-2xl mb-4 text-center">
          {selectedCategory
            ? `Hooks for "${formatLabel(selectedCategory)}"`
            : "All Hooks"}
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading hooks...</p>
        ) : paginatedHooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
            {paginatedHooks.map((item, i) => (
              <Card
                key={i}
                className="w-full bg-white border border-gray-200 rounded-xl shadow p-6 flex flex-col gap-4"
              >
                <CardHeader className="flex flex-row justify-between items-start gap-2">
                  <CardTitle className="text-gray-800 text-lg font-semibold">
                    {item.hook}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() => handleCopy(item.hook, i)}
                      className="cursor-pointer"
                    >
                      <ClipboardIcon className="h-5 w-5 text-gray-500 hover:text-black" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {copiedIndex === i ? "Copied!" : "Copy to Clipboard"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Category:{" "}
                    <span className="font-medium">
                      {formatLabel(item.category)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Generated on:{" "}
                    {item.generated_at
                      ? formatDate(item.generated_at)
                      : "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No hooks available.</p>
        )}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 || // Always show first page
                    page === totalPages || // Always show last page
                    Math.abs(currentPage - page) <= 1 // Show pages near current
                )
                .map((page, idx, arr) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  );
}

// Clipboard Icon Component
function ClipboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
