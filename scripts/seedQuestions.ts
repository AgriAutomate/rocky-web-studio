import { QUESTION_SETS, branchMap } from "@/app/lib/questionnaireConfig";

async function main() {
  const totalQuestions = QUESTION_SETS.reduce((acc, set) => acc + set.questions.length, 0);
  const sectors = Object.keys(branchMap);

  console.log("Rocky Web Studio questionnaire seeder");
  console.log("------------------------------------");
  console.log(`Total questions defined: ${totalQuestions}`);

  sectors.forEach((sector) => {
    const list = (branchMap as Record<string, string[]>)[sector] ?? [];
    console.log(`• ${sector}: ${list.length} branch questions`);
  });

  console.log("\nSeed complete: questionnaireConfig is ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
