import { Suspense } from "react";
import ClientSideCode from "./ClientSideCode";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientSideCode />
    </Suspense>
  );
}
