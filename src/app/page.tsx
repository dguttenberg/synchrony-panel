import fs from "fs";
import path from "path";
import { SynchronyPanel } from "@/components/panel";

export default function Home() {
  const reportMd = fs.readFileSync(
    path.join(process.cwd(), "src/data/report.md"),
    "utf-8"
  );

  return <SynchronyPanel reportMd={reportMd} />;
}
