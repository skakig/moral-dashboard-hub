
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { PasswordConfirmData } from "@/types/settings";

const passwordConfirmSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordConfirmFormData = z.infer<typeof passwordConfirmSchema>;

interface PasswordConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: (data: PasswordConfirmData) => Promise<void>;
  saving: boolean;
}

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  saving
}: PasswordConfirmDialogProps) {
  const form = useForm<PasswordConfirmFormData>({
    resolver: zodResolver(passwordConfirmSchema),
    defaultValues: { password: "" }
  });

  const handleSubmit = async (data: PasswordConfirmFormData) => {
    await onConfirm({ password: data.password });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Password</DialogTitle>
          <DialogDescription>
            For security, please enter your password to confirm admin email changes.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false);
                  onCancel();
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Verifying..." : "Confirm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
