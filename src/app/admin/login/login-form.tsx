"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../actions";

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <Image src="/images/logo-grillhousejac.webp" alt="Grill House Jac" width={72} height={72} className="rounded-full" />
        <CardTitle className="font-display text-oro">Grill House Jac Admin</CardTitle>
        <CardDescription>Ingresa la contraseña para editar el sitio.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await login(undefined, formData);
              setError(result?.error);
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" autoFocus required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full font-bold" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
