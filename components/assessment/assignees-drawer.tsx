"use client";

import React, { useEffect, useState } from "react";
import { Search, User, Loader2, Filter, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

/* Types */

interface AssigneesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds?: string[];
  onAssign: (ids: string[]) => void;
  apiBaseUrl: string;
}

interface Student {
  _id: string;
  candidate_name?: string;
  email: string;
  profileInfo?: {
    profileImageS3Key?: string;
  };
  instituteDepartment?: {
    _id: string;
    name: string;
  };
}

interface Department {
  _id: string;
  name: string;
  uuid?: string;
}

/* Component */

export function AssigneesDrawer({
  isOpen,
  onClose,
  selectedIds = [],
  onAssign,
  apiBaseUrl,
}: AssigneesDrawerProps) {
  const [users, setUsers] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);

  const [selection, setSelection] = useState<Set<string>>(new Set(selectedIds));
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const LIMIT = 15;

  /* Fetch Departments */

  useEffect(() => {
    if (!isOpen || !apiBaseUrl) return;

    const fetchDepts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/institute/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setDepartments(json.data || []);
      } catch (e) {
        console.error("Dept fetch error:", e);
      }
    };

    fetchDepts();
  }, [isOpen, apiBaseUrl]);

  /* Initial Fetch */

  useEffect(() => {
    if (isOpen && apiBaseUrl) {
      setSelection(new Set(selectedIds));
      setPage(1);
      setHasMore(true);
      setUsers([]);
      fetchUsers(1, "", "all");
    }
  }, [isOpen, apiBaseUrl, selectedIds]);

  /* Fetch Users */

  const fetchUsers = async (pageNum: number, search: string, dept: string) => {
    if (!apiBaseUrl) return;

    try {
      const isFirstPage = pageNum === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: LIMIT.toString(),
        search,
      });

      if (dept !== "all") params.append("department", dept);

      const res = await fetch(
        `${apiBaseUrl}/institute/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (data.success) {
        const newUsers = Array.isArray(data.data) ? data.data : [];
        setUsers((prev) => (isFirstPage ? newUsers : [...prev, ...newUsers]));
        setTotalCount(data.count || 0);
        setHasMore(newUsers.length === LIMIT);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* Search / Filter */

  useEffect(() => {
    if (!isOpen) return;

    const t = setTimeout(() => {
      setPage(1);
      fetchUsers(1, searchQuery, selectedDept);
    }, 500);

    return () => clearTimeout(t);
  }, [searchQuery, selectedDept, isOpen]);

  /* Actions */

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, selectedDept);
  };

  const toggleUser = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearAll = () => {
    setSelection(new Set());
    toast.success("Selection cleared");
  };

  const handleSelectAll = async (checked: boolean) => {
    if (!checked) {
      setSelection(new Set());
      return;
    }

    try {
      setSelectingAll(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: "1",
        limit: "10000",
        search: searchQuery,
      });

      if (selectedDept !== "all") params.append("department", selectedDept);

      const res = await fetch(
        `${apiBaseUrl}/institute/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const allIds = data.data.map((u: Student) => u._id);
        setSelection(new Set(allIds));
        toast.success(`Selected ${allIds.length} users`);
      }
    } catch {
      toast.error("Failed to select all");
    } finally {
      setSelectingAll(false);
    }
  };

  const handleSave = () => {
    onAssign(Array.from(selection));
    onClose();
  };

  /* Helpers */

  const getDisplayName = (u: Student) =>
    u.candidate_name || u.email.split("@")[0];

  const getDeptName = (u: Student) =>
    u.instituteDepartment?.name || "";

  /* UI */

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gray-50/50">
          <SheetTitle className="text-lg font-semibold flex items-center gap-2">
            Assign Candidates
            {selection.size > 0 && (
              <span className="bg-[#071526] text-white text-xs px-2 py-0.5 rounded-full font-normal">
                {selection.size} Selected
              </span>
            )}
          </SheetTitle>

          <div className="flex flex-col gap-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 bg-white h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-full h-9 bg-white text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter size={14} />
                  <SelectValue placeholder="Filter by Department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept.uuid || dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 pb-1">
            {totalCount > 0 && (
                <div className="flex items-center gap-2">
                {selectingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#071526]" />
                ) : (
                    <Checkbox
                    id="selectAll"
                    checked={selection.size === totalCount && totalCount > 0}
                    onCheckedChange={(v) => handleSelectAll(!!v)}
                    className="data-[state=checked]:bg-[#071526]"
                    />
                )}
                <label
                    htmlFor="selectAll"
                    className="text-xs text-gray-600 cursor-pointer"
                >
                    Select all {totalCount} users
                </label>
                </div>
            )}

            {selection.size > 0 && (
                <button 
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                >
                    <XCircle size={12} /> Clear All
                </button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#071526]" />
              <p className="text-sm">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <User className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">No students found.</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col p-2 space-y-1">
                {users.map((user) => {
                  const isSelected = selection.has(user._id);
                  const name = getDisplayName(user);
                  const deptName = getDeptName(user);

                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUser(user._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
                        isSelected
                          ? "bg-[#EEF1F8] border-[#071526]/30"
                          : "bg-white border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleUser(user._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-[#071526]"
                      />
                      <Avatar className="w-9 h-9 border">
                        <AvatarImage
                          src={user.profileInfo?.profileImageS3Key}
                        />
                        <AvatarFallback className="text-xs bg-[#EEF1F8] text-[#071526]">
                          {name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {deptName && (
                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full truncate max-w-[80px]">
                          {deptName}
                        </span>
                      )}
                    </div>
                  );
                })}

                {hasMore && (
                  <div className="p-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="text-[#071526] text-xs h-8"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <SheetFooter className="p-4 border-t bg-white sm:justify-between flex-row items-center gap-4 z-10">
          <p className="text-xs text-gray-500 font-medium">
            {selection.size} selected
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="sm" className="h-9">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-[#071526] text-white h-9 px-6"
            >
              Confirm
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}