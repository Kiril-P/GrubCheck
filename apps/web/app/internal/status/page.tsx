import { StatusBoard } from "../../../src/components/status-board";
import { getInternalStatus } from "../../../src/lib/api";

export default async function InternalStatusPage() {
  const status = await getInternalStatus();

  return <StatusBoard status={status} />;
}

