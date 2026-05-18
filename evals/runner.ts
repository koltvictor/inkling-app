import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type {
  EvalProfile,
  RunOutcome,
  ProfileSummary,
  ClassifyResponseBody,
  ExpectedQualities,
  ClassifyExpectedQualities,
} from './schema';
import { checkMustMention, checkMustAvoid, countWords, mean, stddev } from './checks';

const PROFILES_DIR = path.join(__dirname, 'profiles');
const OUTPUT_DIR = path.join(__dirname, 'output');

const API_URL =
  process.env.EVAL_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
const API_SECRET = process.env.EVAL_API_SECRET || process.env.EXPO_PUBLIC_API_SECRET || '';

// CLI args
const args = process.argv.slice(2);
function getArg(flag: string): string | null {
  const m = args.find((a) => a.startsWith(`${flag}=`));
  if (m) return m.split('=', 2)[1] || null;
  const idx = args.indexOf(flag);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return null;
}

const RUNS = parseInt(getArg('--runs') || '1', 10);
const PROFILE_FILTER = getArg('--profiles')
  ?.split(',')
  .map((s) => s.trim())
  .filter(Boolean) || null;

async function runOnce(profile: EvalProfile, runIndex: number): Promise<RunOutcome> {
  const startMs = Date.now();
  const endpoint = profile.endpoint || 'interpret';
  const base: RunOutcome = {
    runIndex,
    ranAt: new Date().toISOString(),
    durationMs: 0,
  };
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify(profile.payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const data = await response.json();
    if (endpoint === 'classify') {
      return {
        ...base,
        classifyResponse: data as ClassifyResponseBody,
        durationMs: Date.now() - startMs,
      };
    }
    return {
      ...base,
      interpretation: (data as { interpretation: string }).interpretation,
      durationMs: Date.now() - startMs,
    };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startMs,
    };
  }
}

function summarize(profile: EvalProfile, runs: RunOutcome[]): ProfileSummary {
  const endpoint = profile.endpoint || 'interpret';
  const successfulRuns = runs.filter((r) => !r.error);
  const summary: ProfileSummary = {
    profileId: profile.id,
    description: profile.description,
    endpoint,
    expectedQualities: profile.expectedQualities,
    runs,
    runCount: runs.length,
    errorCount: runs.length - successfulRuns.length,
    durationMsMean: Math.round(mean(runs.map((r) => r.durationMs))),
    durationMsMax: runs.length ? Math.max(...runs.map((r) => r.durationMs)) : 0,
  };

  if (endpoint === 'interpret') {
    const quals = profile.expectedQualities as ExpectedQualities;
    const interpretations = successfulRuns.map((r) => r.interpretation || '');
    const wordCounts = interpretations.map(countWords);
    if (wordCounts.length) {
      summary.wordCountMean = Math.round(mean(wordCounts));
      summary.wordCountStddev = Math.round(stddev(wordCounts));
      summary.wordCountMin = Math.min(...wordCounts);
      summary.wordCountMax = Math.max(...wordCounts);
    }
    if (quals.mustMention?.length) {
      summary.mustMentionHitCounts = {};
      for (const item of quals.mustMention) summary.mustMentionHitCounts[item] = 0;
      for (const text of interpretations) {
        const checks = checkMustMention(text, quals.mustMention);
        for (const [item, hit] of Object.entries(checks)) {
          if (hit) summary.mustMentionHitCounts[item]++;
        }
      }
    }
    if (quals.mustAvoid?.length) {
      summary.mustAvoidViolationCounts = {};
      for (const item of quals.mustAvoid) summary.mustAvoidViolationCounts[item] = 0;
      for (const text of interpretations) {
        const checks = checkMustAvoid(text, quals.mustAvoid);
        for (const [item, violated] of Object.entries(checks)) {
          if (violated) summary.mustAvoidViolationCounts[item]++;
        }
      }
    }
  } else {
    const quals = profile.expectedQualities as ClassifyExpectedQualities;
    summary.expectedPathHitCount = 0;
    summary.mustNotIncludeViolationCount = 0;
    summary.crisisCorrectCount = 0;
    summary.outOfScopeCorrectCount = 0;
    summary.outOfScopeCategoryCorrectCount = 0;
    if (quals.rationaleMustReference?.length) {
      summary.rationaleReferenceHitCounts = {};
      for (const item of quals.rationaleMustReference) {
        summary.rationaleReferenceHitCounts[item] = 0;
      }
    }
    for (const run of successfulRuns) {
      const resp = run.classifyResponse;
      if (!resp) continue;
      const recommendedIds = resp.recommendations.map((r) => r.pathId);
      const allRationales = resp.recommendations.map((r) => r.rationale).join(' ');
      if (quals.expectedPathIds?.length) {
        if (quals.expectedPathIds.some((id) => recommendedIds.includes(id))) {
          summary.expectedPathHitCount!++;
        }
      }
      if (quals.mustNotIncludePathIds?.length) {
        if (quals.mustNotIncludePathIds.some((id) => recommendedIds.includes(id))) {
          summary.mustNotIncludeViolationCount!++;
        }
      }
      if (typeof quals.expectedCrisis === 'boolean') {
        if (resp.crisis === quals.expectedCrisis) {
          summary.crisisCorrectCount!++;
        }
      }
      if (typeof quals.expectedOutOfScope === 'boolean') {
        const got = resp.outOfScope !== null;
        if (got === quals.expectedOutOfScope) {
          summary.outOfScopeCorrectCount!++;
        }
      }
      if (quals.expectedOutOfScopeCategory) {
        if (resp.outOfScope?.category === quals.expectedOutOfScopeCategory) {
          summary.outOfScopeCategoryCorrectCount!++;
        }
      }
      if (quals.rationaleMustReference?.length && summary.rationaleReferenceHitCounts) {
        const checks = checkMustMention(allRationales, quals.rationaleMustReference);
        for (const [item, hit] of Object.entries(checks)) {
          if (hit) summary.rationaleReferenceHitCounts[item]++;
        }
      }
    }
  }

  return summary;
}

function renderSingleRunMarkdown(summaries: ProfileSummary[]): string {
  const lines: string[] = [];
  lines.push(`# Inkling Eval Run`);
  lines.push(``);
  lines.push(`Ran ${summaries.length} profiles at ${new Date().toISOString()}`);
  lines.push(`API: ${API_URL}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const s of summaries) {
    const run = s.runs[0];
    lines.push(`## ${s.profileId}`);
    lines.push(``);
    lines.push(`*${s.description}*`);
    lines.push(``);
    lines.push(`**Duration:** ${run.durationMs}ms`);
    lines.push(``);

    if (run.error) {
      lines.push(`**Error:** ${run.error}`);
      lines.push(``);
    } else if (s.endpoint === 'classify') {
      lines.push(`### Classification`);
      lines.push(``);
      const resp = run.classifyResponse;
      if (resp) {
        lines.push(`**Crisis flag:** ${resp.crisis}`);
        if (resp.outOfScope) {
          lines.push(`**Out-of-scope:** ${resp.outOfScope.category} — ${resp.outOfScope.rationale}`);
        }
        lines.push(``);
        if (resp.recommendations.length === 0) {
          lines.push(`(no recommendations)`);
        } else {
          for (const rec of resp.recommendations) {
            lines.push(`- **${rec.pathId}**: ${rec.rationale}`);
          }
        }
      }
      lines.push(``);
    } else {
      lines.push(`### Interpretation`);
      lines.push(``);
      lines.push(run.interpretation || '(empty)');
      lines.push(``);
    }

    const quals = s.expectedQualities as any;
    lines.push(`### Expected qualities (for reviewer)`);
    lines.push(``);
    lines.push(`- Holds diagnostic line: ${quals.holdsLine}`);
    if (quals.mustMention?.length) {
      lines.push(`- Must mention: ${quals.mustMention.join(', ')}`);
    }
    if (quals.mustAvoid?.length) {
      lines.push(`- Must avoid: ${quals.mustAvoid.join(', ')}`);
    }
    if (quals.expectedPathIds?.length) {
      lines.push(`- Expected path IDs (at least one): ${quals.expectedPathIds.join(', ')}`);
    }
    if (quals.mustNotIncludePathIds?.length) {
      lines.push(`- Must NOT include path IDs: ${quals.mustNotIncludePathIds.join(', ')}`);
    }
    if (quals.rationaleMustReference?.length) {
      lines.push(`- Rationale must reference: ${quals.rationaleMustReference.join(', ')}`);
    }
    if (typeof quals.expectedCrisis === 'boolean') {
      lines.push(`- Expected crisis flag: ${quals.expectedCrisis}`);
    }
    if (typeof quals.expectedOutOfScope === 'boolean') {
      lines.push(`- Expected out-of-scope: ${quals.expectedOutOfScope}`);
    }
    if (quals.expectedOutOfScopeCategory) {
      lines.push(`- Expected out-of-scope category: ${quals.expectedOutOfScopeCategory}`);
    }
    if (quals.notes) {
      lines.push(`- Notes: ${quals.notes}`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join('\n');
}

function flag(hits: number, total: number, allowAtLeast90 = true): string {
  if (total === 0) return '—';
  if (hits === total) return '✓';
  if (allowAtLeast90 && hits / total >= 0.9) return '⚠';
  return '✗';
}

function renderVarianceMarkdown(summaries: ProfileSummary[], runs: number): string {
  const lines: string[] = [];
  lines.push(`# Inkling Variance Report — ${runs} runs per profile`);
  lines.push(``);
  lines.push(`Ran at ${new Date().toISOString()}`);
  lines.push(`API: ${API_URL}`);
  lines.push(``);
  lines.push(`Legend: ✓ = 10/10 (or all successful runs), ⚠ = ≥90%, ✗ = <90% for must-mention; ✓ = 0 violations for must-avoid.`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const s of summaries) {
    const successCount = s.runCount - s.errorCount;
    lines.push(`## ${s.profileId}`);
    lines.push(``);
    lines.push(`*${s.description}*`);
    lines.push(``);
    if (s.errorCount > 0) {
      lines.push(`**Errors: ${s.errorCount}/${s.runCount}**`);
      lines.push(``);
    }
    lines.push(`Duration: mean ${(s.durationMsMean / 1000).toFixed(1)}s, max ${(s.durationMsMax / 1000).toFixed(1)}s`);

    if (s.endpoint === 'interpret') {
      if (typeof s.wordCountMean === 'number') {
        lines.push(`Words:    mean ${s.wordCountMean}, stddev ${s.wordCountStddev}, range ${s.wordCountMin}-${s.wordCountMax}`);
      }
      lines.push(``);

      if (s.mustMentionHitCounts && Object.keys(s.mustMentionHitCounts).length) {
        lines.push(`**Must-mention:**`);
        lines.push(``);
        for (const [item, hits] of Object.entries(s.mustMentionHitCounts)) {
          lines.push(`- ${item} — ${hits}/${successCount} ${flag(hits, successCount)}`);
        }
        lines.push(``);
      }

      if (s.mustAvoidViolationCounts && Object.keys(s.mustAvoidViolationCounts).length) {
        lines.push(`**Must-avoid:**`);
        lines.push(``);
        for (const [item, v] of Object.entries(s.mustAvoidViolationCounts)) {
          const f = v === 0 ? '✓' : '✗';
          lines.push(`- ${item} — ${v} violations ${f}`);
        }
        lines.push(``);
      }
    } else {
      const quals = s.expectedQualities as ClassifyExpectedQualities;
      lines.push(``);
      if (quals.expectedPathIds?.length) {
        const f = flag(s.expectedPathHitCount || 0, successCount, false);
        lines.push(`- Expected path returned (one of ${quals.expectedPathIds.join('/')}): ${s.expectedPathHitCount}/${successCount} ${f}`);
      }
      if (quals.mustNotIncludePathIds?.length) {
        const v = s.mustNotIncludeViolationCount || 0;
        const f = v === 0 ? '✓' : '✗';
        lines.push(`- Must-not-include path violations: ${v}/${successCount} ${f}`);
      }
      if (typeof quals.expectedCrisis === 'boolean') {
        const f = flag(s.crisisCorrectCount || 0, successCount, false);
        lines.push(`- Crisis flag correct (expected ${quals.expectedCrisis}): ${s.crisisCorrectCount}/${successCount} ${f}`);
      }
      if (typeof quals.expectedOutOfScope === 'boolean') {
        const f = flag(s.outOfScopeCorrectCount || 0, successCount, false);
        lines.push(`- OutOfScope flag correct (expected ${quals.expectedOutOfScope}): ${s.outOfScopeCorrectCount}/${successCount} ${f}`);
      }
      if (quals.expectedOutOfScopeCategory) {
        const f = flag(s.outOfScopeCategoryCorrectCount || 0, successCount, false);
        lines.push(`- OutOfScope category correct (expected ${quals.expectedOutOfScopeCategory}): ${s.outOfScopeCategoryCorrectCount}/${successCount} ${f}`);
      }
      if (s.rationaleReferenceHitCounts && Object.keys(s.rationaleReferenceHitCounts).length) {
        lines.push(``);
        lines.push(`**Rationale must reference:**`);
        for (const [item, hits] of Object.entries(s.rationaleReferenceHitCounts)) {
          lines.push(`- ${item} — ${hits}/${successCount} ${flag(hits, successCount)}`);
        }
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  return lines.join('\n');
}

async function main() {
  if (!API_SECRET) {
    console.error('Missing API secret. Set EVAL_API_SECRET or EXPO_PUBLIC_API_SECRET.');
    process.exit(1);
  }

  const files = fs.readdirSync(PROFILES_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('No profiles found in evals/profiles/');
    process.exit(1);
  }

  let profiles: EvalProfile[] = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8'))
  );

  if (PROFILE_FILTER) {
    profiles = profiles.filter((p) => PROFILE_FILTER.includes(p.id));
    if (profiles.length === 0) {
      console.error(`No profiles matched filter: ${PROFILE_FILTER.join(',')}`);
      process.exit(1);
    }
  }

  console.log(`Running ${profiles.length} profile(s) against ${API_URL}`);
  console.log(`Runs per profile: ${RUNS}`);
  console.log(``);

  const summaries: ProfileSummary[] = [];
  for (const profile of profiles) {
    process.stdout.write(`  ${profile.id} (${RUNS} run${RUNS > 1 ? 's' : ''})... `);
    const runs: RunOutcome[] = [];
    for (let i = 0; i < RUNS; i++) {
      const outcome = await runOnce(profile, i);
      runs.push(outcome);
    }
    const summary = summarize(profile, runs);
    summaries.push(summary);
    const errors = summary.errorCount;
    if (errors > 0) {
      console.log(`done with ${errors} error(s) (mean ${summary.durationMsMean}ms)`);
    } else {
      console.log(`done (mean ${summary.durationMsMean}ms)`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(OUTPUT_DIR, timestamp);
  fs.mkdirSync(runDir, { recursive: true });

  const reportName = RUNS > 1 ? 'variance-report.md' : 'report.md';
  const markdown =
    RUNS > 1 ? renderVarianceMarkdown(summaries, RUNS) : renderSingleRunMarkdown(summaries);

  fs.writeFileSync(path.join(runDir, reportName), markdown);
  fs.writeFileSync(path.join(runDir, 'summaries.json'), JSON.stringify(summaries, null, 2));

  console.log(``);
  console.log(`Results written to evals/output/${timestamp}/`);
  console.log(`Review: open evals/output/${timestamp}/${reportName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
