import { generateReferenceId } from "@/lib/reference";

export async function GET() {
  return Response.json({
    referenceId: generateReferenceId(),
  });
}