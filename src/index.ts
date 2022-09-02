import {run00} from "./00-smoke-test";
import {run01} from "./01-primes";

const port = parseInt(process.env.PORT || '42069');
if (isNaN(port)) {
  throw new Error(`Cannot parse port -p ${process.env.PORT}`);
}

const solutions: Record<string, (port: number) => void> = {
  '00': run00,
  '01': run01
}

const arg = process.argv[2];

if (solutions[arg]) {
  solutions[arg](port);
} else {
  console.error(`No solution specified (got arg ${arg}), usage: yarn run dev -- <${Object.keys(solutions).join(", ")}>`)
}