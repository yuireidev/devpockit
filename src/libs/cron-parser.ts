import CronExpressionParser from 'cron-parser';

export interface CronParseResult {
  isValid: boolean;
  humanReadable: string;
  nextRuns: string[];
  error?: string;
}

export interface CronStats {
  expression: string;
  isValid: boolean;
  nextRunCount: number;
  humanReadable: string;
  error?: string;
}

/**
 * Parse a cron expression and return human-readable description
 */
export function parseCronExpression(expression: string, nextRunCount: number = 5, timezone?: string): CronParseResult {
  try {
    // Validate and parse the cron expression
    const interval = CronExpressionParser.parse(
      expression,
      timezone && timezone !== 'local' ? { tz: timezone } : {}
    );

    // Generate human-readable description
    const humanReadable = generateHumanReadable(expression);

    // Get next execution times
    const nextRuns: string[] = [];
    for (let i = 0; i < nextRunCount; i++) {
      const next = interval.next();
      const isoString = next.toISOString();
      if (isoString) {
        nextRuns.push(isoString);
      }
    }

    return {
      isValid: true,
      humanReadable,
      nextRuns
    };
  } catch (error) {
    return {
      isValid: false,
      humanReadable: '',
      nextRuns: [],
      error: error instanceof Error ? error.message : 'Invalid cron expression'
    };
  }
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): boolean {
  try {
    CronExpressionParser.parse(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get next execution time for a cron expression
 */
export function getNextCronRun(expression: string): Date | null {
  try {
    const interval = CronExpressionParser.parse(expression);
    return interval.next().toDate();
  } catch {
    return null;
  }
}

/**
 * Get multiple next execution times
 */
export function getNextCronRuns(expression: string, count: number = 5): Date[] {
  try {
    const interval = CronExpressionParser.parse(expression);
    const runs: Date[] = [];

    for (let i = 0; i < count; i++) {
      const next = interval.next();
      runs.push(next.toDate());
    }

    return runs;
  } catch {
    return [];
  }
}

/**
 * Generate human-readable description of cron expression
 */
function generateHumanReadable(expression: string): string {
  const expressionParts = expression.trim().split(/\s+/);

  if (expressionParts.length !== 5) {
    return 'Invalid cron expression format';
  }

  const [minute, hour, day, month, weekday] = expressionParts;

  // Handle special cases
  if (expression === '* * * * *') {
    return 'Every minute';
  }

  if (expression === '0 * * * *') {
    return 'Every hour';
  }

  if (expression === '0 0 * * *') {
    return 'Every day at midnight';
  }

  if (expression === '0 0 * * 0') {
    return 'Every Sunday at midnight';
  }

  if (expression === '0 0 1 * *') {
    return 'Every month on the 1st at midnight';
  }

  // Generate custom description
  const parts: string[] = [];

  // Helper function to parse field value
  type ParsedCronField =
    | { type: 'every' }
    | { type: 'step'; value: number }
    | { type: 'range'; value: { start: number; end: number } }
    | { type: 'list'; value: number[] }
    | { type: 'specific'; value: number };

  const parseField = (field: string): ParsedCronField => {
    // Every
    if (field === '*') {
      return { type: 'every' };
    }

    // Step: */n
    if (field.startsWith('*/')) {
      const step = parseInt(field.substring(2));
      if (!isNaN(step) && step > 0) {
        return { type: 'step', value: step };
      }
      return { type: 'every' };
    }

    // Range: n-m
    if (field.includes('-') && !field.includes(',')) {
      const [startStr, endStr] = field.split('-');
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (!isNaN(start) && !isNaN(end)) {
        return { type: 'range', value: { start, end } };
      }
    }

    // List: n,m,o
    if (field.includes(',')) {
      const values = field.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
      if (values.length > 0) {
        return { type: 'list', value: values };
      }
    }

    // Specific value
    const value = parseInt(field);
    if (!isNaN(value)) {
      return { type: 'specific', value };
    }

    return { type: 'every' };
  };

  // Minute
  const minuteParsed = parseField(minute);
  if (minuteParsed.type === 'every') {
    parts.push('Every minute');
  } else if (minuteParsed.type === 'step') {
    parts.push(`Every ${minuteParsed.value} minute${minuteParsed.value > 1 ? 's' : ''}`);
  } else if (minuteParsed.type === 'range') {
    const { start, end } = minuteParsed.value;
    parts.push(`Every minutes from ${start} to ${end}`);
  } else if (minuteParsed.type === 'list') {
    const values = minuteParsed.value.join(', ');
    parts.push(`Every minutes at ${values}`);
  } else if (minuteParsed.type === 'specific') {
    if (minuteParsed.value === 0) {
      parts.push('At the top of the hour');
    } else {
      parts.push(`At ${minuteParsed.value} minutes past the hour`);
    }
  }

  // Hour
  const hourParsed = parseField(hour);
  if (hourParsed.type === 'every') {
    // Already covered by "Every minutes"
  } else if (hourParsed.type === 'step') {
    parts.push(`every ${hourParsed.value} hour${hourParsed.value > 1 ? 's' : ''}`);
  } else if (hourParsed.type === 'range') {
    const { start, end } = hourParsed.value;
    parts.push(`between ${start} o'clock and ${end} o'clock`);
  } else if (hourParsed.type === 'list') {
    const values = hourParsed.value.map((v: number) => `${v} o'clock`).join(', ');
    parts.push(`at ${values}`);
  } else if (hourParsed.type === 'specific') {
    const hourNum = hourParsed.value;
    if (hourNum === 0) {
      parts.push('at midnight');
    } else if (hourNum === 12) {
      parts.push('at 12 o\'clock PM');
    } else if (hourNum < 12) {
      parts.push(`at ${hourNum} o'clock AM`);
    } else {
      parts.push(`at ${hourNum - 12} o'clock PM`);
    }
  }

  // Day
  const dayParsed = parseField(day);
  if (dayParsed.type === 'range') {
    const { start, end } = dayParsed.value;
    parts.push(`day ${start} to ${end}`);
  } else if (dayParsed.type === 'list') {
    const values = dayParsed.value.join(', ');
    parts.push(`day ${values}`);
  } else if (dayParsed.type === 'specific') {
    parts.push(`day ${dayParsed.value}`);
  } else if (dayParsed.type === 'step') {
    parts.push(`every ${dayParsed.value} day${dayParsed.value > 1 ? 's' : ''}`);
  }

  // Month
  const monthParsed = parseField(month);
  if (monthParsed.type === 'range') {
    const { start, end } = monthParsed.value;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (start >= 1 && start <= 12 && end >= 1 && end <= 12) {
      parts.push(`from ${monthNames[start - 1]} to ${monthNames[end - 1]}`);
    } else {
      parts.push(`from ${start} to ${end}`);
    }
  } else if (monthParsed.type === 'list') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthList = monthParsed.value.filter((v: number) => v >= 1 && v <= 12).map((v: number) => monthNames[v - 1]).join(', ');
    if (monthList) {
      parts.push(`in ${monthList}`);
    }
  } else if (monthParsed.type === 'specific') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (monthParsed.value >= 1 && monthParsed.value <= 12) {
      parts.push(`in ${monthNames[monthParsed.value - 1]}`);
    }
  } else if (monthParsed.type === 'step') {
    parts.push(`every ${monthParsed.value} month${monthParsed.value > 1 ? 's' : ''}`);
  }

  // Weekday
  const weekdayParsed = parseField(weekday);
  if (weekdayParsed.type === 'range') {
    const { start, end } = weekdayParsed.value;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (start >= 0 && start <= 6 && end >= 0 && end <= 6) {
      parts.push(`on ${dayNames[start]} through ${dayNames[end]}`);
    } else {
      parts.push(`on ${start} through ${end}`);
    }
  } else if (weekdayParsed.type === 'list') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const filteredDays = weekdayParsed.value.filter((v: number) => v >= 0 && v <= 6).map((v: number) => dayNames[v]);
    if (filteredDays.length > 0) {
      if (filteredDays.length === 1) {
        parts.push(`on ${filteredDays[0]}`);
      } else {
        // Space-separated with comma before last item: "Monday Tuesday, Friday"
        const lastDay = filteredDays.pop();
        const dayList = filteredDays.join(' ') + (filteredDays.length > 0 ? ', ' : '') + lastDay;
        parts.push(`on ${dayList}`);
      }
    }
  } else if (weekdayParsed.type === 'specific') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (weekdayParsed.value >= 0 && weekdayParsed.value <= 6) {
      parts.push(`on ${dayNames[weekdayParsed.value]}`);
    }
  } else if (weekdayParsed.type === 'step') {
    parts.push(`every ${weekdayParsed.value} weekday${weekdayParsed.value > 1 ? 's' : ''}`);
  }

  // Join parts with commas
  let description = parts.join(', ');

  // Capitalize the first letter
  if (description) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return description || 'Custom schedule';
}

/**
 * Get statistics for a cron expression
 */
export function getCronStats(expression: string): CronStats {
  const parseResult = parseCronExpression(expression);

  return {
    expression,
    isValid: parseResult.isValid,
    nextRunCount: parseResult.nextRuns.length,
    humanReadable: parseResult.humanReadable,
    error: parseResult.error
  };
}
