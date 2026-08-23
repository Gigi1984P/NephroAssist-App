"use client";

import { Suspense } from "react";
import NProgress from "./nprogress";

export function NProgressWrapper() {
  return (
    <Suspense fallback={null}>
      <NProgress />
    </Suspense>
  );
}
