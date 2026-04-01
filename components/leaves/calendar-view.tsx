"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface Holiday {
  name: string;
  date: string;
}

interface LeaveEntry {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  workingDays: number;
  user: {
    name: string;
    image: string | null;
    department: { name: string; id: string } | null;
  };
  leaveType: { name: string };
}

const DEPT_COLORS = [
  "bg-blue-200",
  "bg-emerald-200",
  "bg-purple-200",
  "bg-amber-200",
  "bg-rose-200",
  "bg-cyan-200",
];

export function CalendarView({
  departments,
  holidays,
}: {
  departments: Department[];
  holidays: Holiday[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [filterDept, setFilterDept] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    fetch(
      `/api/calendar?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
    )
      .then((r) => r.json())
      .then(setLeaves)
      .catch(console.error);
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday start

  const holidayMap = new Map(
    holidays
      .filter((h) => {
        const d = new Date(h.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .map((h) => [new Date(h.date).getDate(), h.name])
  );

  const deptColorMap = new Map(
    departments.map((d, i) => [d.id, DEPT_COLORS[i % DEPT_COLORS.length]])
  );

  const filteredLeaves =
    filterDept === "all"
      ? leaves
      : leaves.filter((l) => l.user.department?.id === filterDept);

  function getLeaveForDay(day: number): LeaveEntry[] {
    const date = new Date(year, month, day);
    return filteredLeaves.filter((l) => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return date >= start && date <= end;
    });
  }

  const monthNames = [
    "Ιανουάριος",
    "Φεβρουάριος",
    "Μάρτιος",
    "Απρίλιος",
    "Μάιος",
    "Ιούνιος",
    "Ιούλιος",
    "Αύγουστος",
    "Σεπτέμβριος",
    "Οκτώβριος",
    "Νοέμβριος",
    "Δεκέμβριος",
  ];

  const dayNames = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(new Date(year, month - 1, 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(new Date(year, month + 1, 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Τμήμα" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλα τα τμήματα</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-xs font-medium text-gray-500 text-center py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
            {/* Empty cells before first day */}
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isHoliday = holidayMap.has(day);
              const isToday =
                new Date().toDateString() === date.toDateString();
              const dayLeaves = getLeaveForDay(day);

              return (
                <div
                  key={day}
                  className={`bg-white p-1.5 min-h-[80px] ${
                    isWeekend ? "bg-gray-50" : ""
                  } ${isHoliday ? "bg-amber-50" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "bg-[#1C4E89] text-white w-6 h-6 rounded-full flex items-center justify-center"
                          : isWeekend
                            ? "text-gray-400"
                            : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {isHoliday && (
                      <span
                        className="text-[10px] text-amber-600 truncate"
                        title={holidayMap.get(day)}
                      >
                        🏖️
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayLeaves.slice(0, 3).map((l) => {
                      const color =
                        l.status === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : deptColorMap.get(l.user.department?.id || "") ||
                            "bg-blue-100";
                      return (
                        <div
                          key={l.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate ${color} ${
                            l.status === "PENDING"
                              ? "opacity-60 border border-dashed border-orange-300"
                              : ""
                          }`}
                          title={`${l.user.name} - ${l.leaveType.name}`}
                        >
                          {l.user.name?.split(" ")[0]}
                        </div>
                      );
                    })}
                    {dayLeaves.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">
                        +{dayLeaves.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
