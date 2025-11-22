import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Icon from '@/components/ui/icon'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'register'
  onSuccess: (user: any, sessionToken: string) => void
}

export default function AuthDialog({ open, onOpenChange, mode: initialMode, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('https://functions.poehali.dev/ba98c7f6-0bdd-45c5-827a-e875cf11873a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: mode,
          username: formData.username,
          email: mode === 'register' ? formData.email : undefined,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Успешно!',
        description: data.message,
      })

      localStorage.setItem('session_token', data.session_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      onSuccess(data.user, data.session_token)
      onOpenChange(false)
      setFormData({ username: '', email: '', password: '' })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">
              {mode === 'login' ? 'Имя пользователя или Email' : 'Имя пользователя'}
            </Label>
            <Input
              id="username"
              type="text"
              placeholder={mode === 'login' ? 'username или email@example.com' : 'username'}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
            {mode === 'register' && (
              <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              mode === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </Button>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-muted-foreground">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary hover:underline font-medium"
                >
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
