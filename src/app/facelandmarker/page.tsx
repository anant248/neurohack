import { redirect } from "next/navigation"

// Backward-compat redirect — the canonical route is now /practice
export default function FaceLandmarkerRedirect() {
  redirect("/practice")
}
