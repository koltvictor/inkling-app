import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { EvalProfile, EvalRunResult } from './schema';

const PROFILES_DIR = path.join(__dirname, 'profiles');
const OUTPUT_DIR = path.join(__dirname, 'output');

const API_URL = process.env.EVAL_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
const API_SECRET = process.env.EVAL_API_SECRET || process.env.EXPO_PUBLIC_API_SECRET || '';

async function runProfile(profile: EvalProfile): Promise<EvalRunResult> {
  const startMs = Date.now();
  const base: EvalRunResult = {
    profileId: profile.id,
    description: profile.description,
    ranAt: new Date().toISOString(),
    durationMs: 0,
    expectedQualities: profile.expectedQualities,
  };
  try {
    const response = await fetch(`${API_URL}/interpret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify(profile.payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const data = await response.json() as { interpretation: string; generatedAt: number };
    return { ...base, interpretation: data.interpretation, durationMs: Date.now() - startMs };
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : String(err), durationMs: Date.now() - startMs };
  }
}

function generateMarkdownReport(results: EvalRunResult[]): string {
  const lines: string[] = [];
  lines.push(`# Inkling Eval Run`);
  lines.push(``);
  lines.push(`Ran ${results.length} profiles at ${new Date().toISOString()}`);
  lines.push(`API: ${API_URL}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  for (const r of results) {
    lines.push(`## ${r.profileId}`);
    lines.push(``);
    lines.push(`*${r.description}*`);
    lines.push(``);
    lines.push(`**Duration:** ${r.durationMs}ms`);
    lines.push(``);

    if (r.error) {
      lines.push(`**Error:** ${r.error}`);
      lines.push(``);
    } else {
      lines.push(`### Interpretation`);
      lines.push(``);
      lines.push(r.interpretation || '(empty)');
      lines.push(``);
    }

    lines.push(`### Expected qualities (for reviewer)`);
    lines.push(``);
    lines.push(`- Holds diagnostic line: ${r.expectedQualities.holdsLine}`);
    if (r.expectedQualities.mustMention?.length) {
      lines.push(`- Must mention: ${r.expectedQualities.mustMention.join(', ')}`);
    }
    if (r.expectedQualities.mustAvoid?.length) {
      lines.push(`- Must avoid: ${r.expectedQualities.mustAvoid.join(', ')}`);
    }
    if (r.expectedQualities.notes) {
      lines.push(`- Notes: ${r.expectedQualities.notes}`);
    }
    lines.push(``);
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

  const profiles: EvalProfile[] = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8'))
  );

  console.log(`Running ${profiles.length} profiles against ${API_URL}...\n`);

  const results: EvalRunResult[] = [];
  for (const profile of profiles) {
    process.stdout.write(`  ${profile.id}... `);
    const result = await runProfile(profile);
    results.push(result);
    if (result.error) {
      console.log(`error (${result.durationMs}ms)`);
    } else {
      console.log(`ok (${result.durationMs}ms)`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(OUTPUT_DIR, timestamp);
  fs.mkdirSync(runDir, { recursive: true });

  fs.writeFileSync(path.join(runDir, 'report.md'), generateMarkdownReport(results));
  fs.writeFileSync(path.join(runDir, 'results.json'), JSON.stringify(results, null, 2));

  console.log(`\nResults written to evals/output/${timestamp}/`);
  console.log(`Review the report: open evals/output/${timestamp}/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
