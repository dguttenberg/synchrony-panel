import fs from "fs";
import path from "path";
import { SynchronyPanel } from "@/components/panel";

export default function Home() {
  // Prefer the Claude-generated report (analyzes actual sim data)
  // Fall back to the MiroFish auto-report if Claude version doesn't exist
  const claudeReportPath = path.join(process.cwd(), "src/data/claude-report.md");
  const fallbackPath = path.join(process.cwd(), "src/data/report.md");
  const reportPath = fs.existsSync(claudeReportPath) ? claudeReportPath : fallbackPath;
  const reportMd = fs.readFileSync(reportPath, "utf-8");

  return <SynchronyPanel reportMd={reportMd} />;
}
