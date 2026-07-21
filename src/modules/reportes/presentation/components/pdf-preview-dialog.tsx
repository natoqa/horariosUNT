import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string | null;
}

export function PdfPreviewDialog({ isOpen, onClose, title, pdfUrl }: PdfPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-muted rounded-md overflow-hidden relative mt-4">
          {!pdfUrl ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
