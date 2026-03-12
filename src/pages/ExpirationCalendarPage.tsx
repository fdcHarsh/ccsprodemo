import { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredentials } from '@/contexts/CredentialsContext';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useUI } from '@/contexts/UIContext';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  type: 'credential' | 'document' | 'caqh';
  status: 'current' | 'expiring' | 'urgent' | 'expired';
  daysLeft: number;
}

export default function ExpirationCalendarPage() {
  const { credentials } = useCredentials();
  const { documents } = useDocuments();
  const { caqhAttestation } = useUI();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Build calendar events from credentials + documents + CAQH
  const events: CalendarEvent[] = useMemo(() => {
    const evts: CalendarEvent[] = [];
    const seen = new Set<string>();

    credentials.forEach((cred) => {
      if (cred.expirationDate) {
        const key = `${cred.name}-${cred.expirationDate}`;
        if (!seen.has(key)) {
          seen.add(key);
          evts.push({
            id: cred.id,
            name: cred.name,
            date: cred.expirationDate,
            type: 'credential',
            status: cred.status,
            daysLeft: cred.daysLeft,
          });
        }
      }
    });

    documents.forEach((doc) => {
      if (doc.expirationDate) {
        const key = `${doc.name}-${doc.expirationDate}`;
        if (!seen.has(key)) {
          seen.add(key);
          const today = new Date();
          const expDate = new Date(doc.expirationDate);
          const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          evts.push({
            id: doc.id,
            name: doc.name,
            date: doc.expirationDate,
            type: 'document',
            status: doc.status,
            daysLeft,
          });
        }
      }
    });

    // CAQH re-attestation
    if (caqhAttestation.expiryDate) {
      evts.push({
        id: 'caqh-attestation',
        name: 'CAQH Re-Attestation Due',
        date: caqhAttestation.expiryDate,
        type: 'caqh',
        status: (() => {
          const today = new Date();
          const exp = new Date(caqhAttestation.expiryDate);
          const dl = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (dl < 0) return 'expired' as const;
          if (dl <= 30) return 'urgent' as const;
          if (dl <= 90) return 'expiring' as const;
          return 'current' as const;
        })(),
        daysLeft: Math.ceil(
          (new Date(caqhAttestation.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      });
    }

    return evts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [credentials, documents, caqhAttestation]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const selectedEvents = selectedDate
    ? getEventsForDay(selectedDate)
    : [];

  // Upcoming items (next 90 days)
  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => {
        const d = new Date(e.date).getTime();
        return d >= now && d <= now + 90 * 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [events]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-destructive';
      case 'expired': return 'bg-muted-foreground';
      case 'expiring': return 'bg-warning';
      default: return 'bg-success';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent':
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'expiring':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expiration Calendar</h1>
        <p className="text-muted-foreground">
          Visual overview of all upcoming credential and document expirations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekdays.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative min-h-[80px] p-1.5 text-left transition-colors bg-card hover:bg-muted/50',
                      !inMonth && 'opacity-40',
                      isSelected && 'ring-2 ring-primary ring-inset',
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-medium',
                        today && 'bg-primary text-primary-foreground rounded-full px-1.5 py-0.5',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className={cn(
                            'h-1.5 rounded-full',
                            getStatusColor(evt.status)
                          )}
                          title={evt.name}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" /> Urgent / Expired
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" /> Expiring (30-90 days)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> Current
              </span>
            </div>

            {/* Selected day detail */}
            {selectedDate && selectedEvents.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                <h3 className="text-sm font-medium mb-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="space-y-2">
                  {selectedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {getStatusIcon(evt.status)}
                      <span className="font-medium">{evt.name}</span>
                      {evt.type === 'caqh' && (
                        <ShieldAlert className="h-3 w-3 text-warning" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedEvents.length === 0 && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">
                  No expirations on {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming sidebar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Next 90 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-sm text-muted-foreground">No expirations in the next 90 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((evt) => (
                  <div
                    key={evt.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                      evt.status === 'urgent' && 'bg-destructive/5 border-destructive/20',
                      evt.status === 'expiring' && 'bg-warning/5 border-warning/20',
                      evt.status === 'current' && 'bg-muted/30',
                    )}
                    onClick={() => {
                      setCurrentMonth(new Date(evt.date));
                      setSelectedDate(new Date(evt.date));
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(evt.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{evt.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(evt.date), 'MMM d, yyyy')} · {evt.daysLeft} days
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
