import type { APIRoute } from "astro";

interface DayEntry {
  date: string;
  count: number;
  level: number;
}

function computeStreaks(weeks: { days: DayEntry[] }[]) {
  const allDays = weeks.flatMap((w) => w.days).sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 0;
  let currentRun = 0;
  for (const day of allDays) {
    if (day.count > 0) { currentRun++; if (currentRun > longestStreak) longestStreak = currentRun; }
    else currentRun = 0;
  }
  let currentStreak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].count > 0) currentStreak++;
    else break;
  }
  return { longestStreak, currentStreak };
}

export const GET: APIRoute = async ({ params }) => {
  const username = params.username?.trim();

  if (!username || !/^[a-zA-Z0-9-]+$/.test(username)) {
    return new Response(JSON.stringify({ error: "Invalid username" }), { status: 400 });
  }

  try {
    const res = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; GitHubBattle/1.0)", Accept: "text/html" } }
    );

    if (res.status === 404)
      return new Response(JSON.stringify({ error: `GitHub user '${username}' not found` }), { status: 404 });
    if (!res.ok)
      return new Response(JSON.stringify({ error: `GitHub returned ${res.status}` }), { status: 502 });

    const html = await res.text();
    const daysByWeek = new Map<string, DayEntry[]>();
    let totalContributions = 0;

    const levelPattern = /<rect[^>]+data-level="(\d)"[^>]+data-date="([^"]+)"[^>]+data-count="([^"]+)"/g;
    let lm: RegExpExecArray | null;
    while ((lm = levelPattern.exec(html)) !== null) {
      const level = parseInt(lm[1], 10);
      const date = lm[2];
      const count = parseInt(lm[3], 10);
      totalContributions += count;
      const wk = date.substring(0, 7);
      if (!daysByWeek.has(wk)) daysByWeek.set(wk, []);
      daysByWeek.get(wk)!.push({ date, count, level });
    }

    if (daysByWeek.size === 0)
      return new Response(JSON.stringify({ error: `No data found for '${username}'` }), { status: 404 });

    const weeks = Array.from(daysByWeek.keys()).sort()
      .map((k) => ({ days: daysByWeek.get(k)!.sort((a, b) => a.date.localeCompare(b.date)) }));

    const { longestStreak, currentStreak } = computeStreaks(weeks);

    return new Response(
      JSON.stringify({ username, totalContributions, weeks, longestStreak, currentStreak }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch from GitHub" }), { status: 500 });
  }
};