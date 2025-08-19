// 🚀 **ULTRA-ADVANCED TIMESTAMP UTILITIES**
class TimeUtils {
  private static readonly MINUTE = 60 * 1000;
  private static readonly HOUR = 60 * this.MINUTE;
  private static readonly DAY = 24 * this.HOUR;

  // Ultra-fast current timestamp
  static now = (): number => Date.now();

  // Advanced formatting with caching
  private static formatCache = new Map<string, string>();
  
  static format = {
    iso: (ts: number): string => new Date(ts).toISOString(),
    date: (ts: number): string => new Date(ts).toLocaleDateString(),
    dateTime: (ts: number): string => new Date(ts).toLocaleString(),
    time: (ts: number): string => new Date(ts).toLocaleTimeString(),
    // Advanced: Custom format with caching
    custom: (ts: number, options?: Intl.DateTimeFormatOptions): string => {
      const key = `${ts}-${JSON.stringify(options)}`;
      if (this.formatCache.has(key)) return this.formatCache.get(key)!;
      
      const formatted = new Intl.DateTimeFormat('en-US', options).format(new Date(ts));
      this.formatCache.set(key, formatted);
      return formatted;
    }
  };

  // Ultra-fast comparisons
  static isNewer = (ts1: number, ts2: number): boolean => ts1 > ts2;
  static isOlder = (ts1: number, ts2: number): boolean => ts1 < ts2;
  static isSameDay = (ts1: number, ts2: number): boolean => 
    Math.floor(ts1 / this.DAY) === Math.floor(ts2 / this.DAY);

  // Advanced time calculations
  static ago = {
    minutes: (ts: number): number => Math.floor((this.now() - ts) / this.MINUTE),
    hours: (ts: number): number => Math.floor((this.now() - ts) / this.HOUR),
    days: (ts: number): number => Math.floor((this.now() - ts) / this.DAY),
    // Advanced: Exact duration
    exact: (ts: number) => {
      const diff = this.now() - ts;
      return {
        days: Math.floor(diff / this.DAY),
        hours: Math.floor((diff % this.DAY) / this.HOUR),
        minutes: Math.floor((diff % this.HOUR) / this.MINUTE),
        seconds: Math.floor((diff % this.MINUTE) / 1000)
      };
    }
  };

  // Ultra-smart relative time with better logic
  static getRelativeTime = (ts: number): string => {
    const { minutes, hours, days } = this.ago;
    const m = minutes(ts);
    const h = hours(ts);
    const d = days(ts);

    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return this.format.date(ts);
  };

  // Advanced: Business hours utilities for shop app
  static business = {
    isToday: (ts: number): boolean => this.isSameDay(ts, this.now()),
    isThisWeek: (ts: number): boolean => this.ago.days(ts) < 7,
    isThisMonth: (ts: number): boolean => {
      const now = new Date();
      const date = new Date(ts);
      return now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
    },
    getWeekStart: (ts: number = this.now()): number => {
      const date = new Date(ts);
      const day = date.getDay();
      return ts - (day * this.DAY);
    },
    getMonthStart: (ts: number = this.now()): number => {
      const date = new Date(ts);
      return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    }
  };
}

// 🎯 **MINIMAL EXPORTS (Backward Compatible)**
export const getCurrentTimestamp = TimeUtils.now;
export const formatTimestamp = TimeUtils.format.iso;
export const formatDate = TimeUtils.format.date;
export const formatDateTime = TimeUtils.format.dateTime;
export const formatTime = TimeUtils.format.time;
export const isNewer = TimeUtils.isNewer;
export const daysSince = TimeUtils.ago.days;
export const hoursAgo = TimeUtils.ago.hours;
export const minutesAgo = TimeUtils.ago.minutes;
export const getRelativeTime = TimeUtils.getRelativeTime;

// 🚀 **ADVANCED EXPORTS**
export const timeUtils = TimeUtils;
export const { format, ago, business } = TimeUtils;
