import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useChangePassword, useDeleteAccount } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, User, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const pwdMutation = useChangePassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Success", description: "Password updated successfully." });
        setPasswords({ current: "", new: "", confirm: "" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  });

  const delMutation = useDeleteAccount({
    mutation: {
      onSuccess: () => {
        logout();
        window.location.href = "/register";
      }
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
    }
    pwdMutation.mutate({ data: { currentPassword: passwords.current, newPassword: passwords.new } });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary"/> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-md">
                Admin Plan
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/> Security</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <Input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <Input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <Input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required />
            </div>
            <Button type="submit" disabled={pwdMutation.isPending}>
              {pwdMutation.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5"/> Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all associated server data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => {
            if(confirm("Are you sure? This cannot be undone.")) delMutation.mutate();
          }} disabled={delMutation.isPending}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
