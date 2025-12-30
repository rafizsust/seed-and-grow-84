import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotaWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  estimatedCost: number;
  remainingTokens: number;
  percentUsed: number;
  operationType: string;
}

export function QuotaWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  estimatedCost,
  remainingTokens,
  percentUsed,
  operationType,
}: QuotaWarningDialogProps) {
  const hasEnough = remainingTokens >= estimatedCost;
  const willExceed = !hasEnough;
  const isLow = percentUsed >= 70;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {willExceed ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Zap className="w-5 h-5 text-warning" />
            )}
            {willExceed ? "Insufficient Quota" : "Quota Warning"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {willExceed 
                  ? `You don't have enough tokens remaining to complete this ${operationType}. The operation may fail mid-way.`
                  : `This ${operationType} will use a significant portion of your remaining daily quota.`
                }
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estimated cost:</span>
                  <Badge variant="outline">{formatTokens(estimatedCost)} tokens</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Remaining today:</span>
                  <Badge variant={willExceed ? "destructive" : isLow ? "outline" : "secondary"}>
                    {formatTokens(remainingTokens)} tokens
                  </Badge>
                </div>
                
                <Progress 
                  value={percentUsed} 
                  className={cn(
                    "h-2",
                    percentUsed >= 90 ? "bg-destructive/20" : percentUsed >= 70 ? "bg-warning/20" : ""
                  )} 
                />
                
                <p className="text-xs text-muted-foreground text-center">
                  {percentUsed.toFixed(1)}% of daily quota used
                </p>
              </div>

              {/* External usage disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This quota tracking only reflects usage within this app. 
                  If you use this API key on other platforms (Google AI Studio, other apps), 
                  those tokens are not tracked here. You can reset the counter in Settings if needed.
                </p>
              </div>

              {willExceed && (
                <p className="text-sm text-destructive">
                  Consider waiting until midnight UTC when your quota resets, or proceed with caution.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={cn(willExceed && "bg-warning text-warning-foreground hover:bg-warning/90")}
          >
            {willExceed ? "Proceed Anyway" : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
