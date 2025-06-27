// "use client"

// import { useSearchParams } from "next/navigation"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { CheckCircle, Heart, Search, ArrowRight, Eye, MessageCircle } from "lucide-react"
// import Link from "next/link"
// import { useEffect } from "react"


// export default function ReportSuccessPage() {
//   const searchParams = useSearchParams()
//   const reportId = searchParams.get("reportId")
//   const type = searchParams.get("type") as "lost" | "found"
//   const matches = Number.parseInt(searchParams.get("matches") || "0")
//   const referenced = searchParams.get("referenced") === "true"

//   useEffect(() => {
//     // Trigger confetti animation
//     confetti({
//       particleCount: 100,
//       spread: 70,
//       origin: { y: 0.6 },
//     })
//   }, [])

//   const isLost = type === "lost"

//   return (
//     <div className="min-h-screen bg-background py-12">
//       <div className="container mx-auto px-4">
//         <div className="max-w-2xl mx-auto">
//           <Card>
//             <CardContent className="py-16 text-center">
//               <div className="flex flex-col items-center space-y-6">
//                 {/* Success Icon */}
//                 <div
//                   className={`p-4 rounded-full ${isLost ? "bg-blue-100 dark:bg-blue-900/20" : "bg-green-100 dark:bg-green-900/20"}`}
//                 >
//                   {isLost ? (
//                     <Search className="h-16 w-16 text-blue-600 dark:text-blue-400" />
//                   ) : (
//                     <Heart className="h-16 w-16 text-green-600 dark:text-green-400" />
//                   )}
//                 </div>

//                 {/* Success Message */}
//                 <div className="space-y-2">
//                   <h1 className="text-3xl font-bold">
//                     {isLost ? "Lost Report Submitted!" : "Found Report Submitted!"}
//                   </h1>
//                   <p className="text-muted-foreground text-lg">
//                     {isLost
//                       ? "Your lost phone report is now live and searchable by others."
//                       : referenced
//                         ? "The owner has been notified and will contact you soon!"
//                         : "We'll notify you if someone has reported this phone as lost."}
//                   </p>
//                 </div>

//                 {/* Match Status */}
//                 {matches > 0 && (
//                   <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
//                     <div className="flex items-center justify-center gap-2 mb-2">
//                       <CheckCircle className="h-5 w-5 text-yellow-600" />
//                       <span className="font-semibold text-yellow-800 dark:text-yellow-200">
//                         🎯 {matches} Possible Match{matches > 1 ? "es" : ""} Found!
//                       </span>
//                     </div>
//                     <p className="text-sm text-yellow-700 dark:text-yellow-300">
//                       Check your dashboard to review potential matches.
//                     </p>
//                   </div>
//                 )}

//                 {/* Next Steps */}
//                 <div className="w-full max-w-md space-y-3">
//                   <h3 className="font-semibold text-lg">What's Next?</h3>

//                   {isLost ? (
//                     <div className="space-y-2 text-sm text-muted-foreground">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                         <span>We're actively searching for matches</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                         <span>You'll get notified if someone finds your phone</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                         <span>Check your dashboard for updates</span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-2 text-sm text-muted-foreground">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         <span>
//                           {referenced ? "Owner has been notified automatically" : "We're searching for the owner"}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         <span>You'll be contacted when there's a match</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         <span>Thank you for helping reunite lost items!</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
//                   <Button asChild className="flex-1">
//                     <Link href="/dashboard" className="flex items-center gap-2">
//                       <Eye className="h-4 w-4" />
//                       View Dashboard
//                       <ArrowRight className="h-4 w-4" />
//                     </Link>
//                   </Button>

//                   {matches > 0 && (
//                     <Button variant="outline" asChild className="flex-1">
//                       <Link href="/dashboard?tab=matches" className="flex items-center gap-2">
//                         <MessageCircle className="h-4 w-4" />
//                         View Matches
//                       </Link>
//                     </Button>
//                   )}
//                 </div>

//                 {/* Additional Actions */}
//                 <div className="flex gap-4 text-sm">
//                   <Button variant="ghost" asChild>
//                     <Link href="/reports">Browse All Reports</Link>
//                   </Button>
//                   <Button variant="ghost" asChild>
//                     <Link href="/report">Report Another Item</Link>
//                   </Button>
//                 </div>

//                 {/* Report ID */}
//                 {reportId && (
//                   <div className="pt-4 border-t">
//                     <p className="text-xs text-muted-foreground">
//                       Report ID: <Badge variant="secondary">{reportId}</Badge>
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
