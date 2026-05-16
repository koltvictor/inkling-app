# Inkling Evals

Test profiles for the interpretation pipeline. Each profile is a synthetic user payload that gets POSTed to the running Worker. Outputs are captured for human review against expected qualities.

## Running

Start the Worker locally first:

    cd ~/Projects/inkling/inkling-proxy
    npm run dev

Then run evals from this directory:

    cd ~/Projects/inkling/inkling-app
    npm run eval

Results land in `evals/output/<timestamp>/` as `report.md` and `results.json`. Review the markdown by hand. Check each interpretation against the `expectedQualities` block on its profile.

## Adding profiles

Drop a JSON file in `evals/profiles/` following the schema in `schema.ts`. The `payload` field matches exactly what the app sends to `/interpret`. The `expectedQualities` block is for human reviewers — the runner does not enforce it automatically (yet).

## Targets

- Family TestFlight: 20-30 profiles covering each path, clear and ambiguous signals, edge cases (very young adult, very high masking, recent identification), crisis-adjacent cases.
- Public launch: 100+ profiles, with at least one round of clinical advisor review.
