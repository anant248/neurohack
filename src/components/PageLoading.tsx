/**
 * Route-level loading fallback. Next renders this instantly on navigation
 * (while the RSC payload + middleware resolve), so clicks feel immediate
 * instead of hanging on the previous page. Self-contained styling so it works
 * on any route regardless of which stylesheet is loaded.
 */
export default function PageLoading() {
  return (
    <div
      style={{
        flex: 1,
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#10b981",
          display: "inline-block",
          animation: "pageSpin 0.8s linear infinite",
        }}
      />
      <style>{"@keyframes pageSpin{to{transform:rotate(360deg)}}"}</style>
    </div>
  )
}
