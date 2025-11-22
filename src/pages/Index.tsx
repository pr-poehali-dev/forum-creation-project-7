import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Icon from '@/components/ui/icon'
import AuthDialog from '@/components/AuthDialog'
import AuthDialog from '@/components/AuthDialog'

interface ForumTopic {
  id: number
  title: string
  author: string
  category: string
  replies: number
  views: number
  lastReply: string
  isPinned?: boolean
  isClosed?: boolean
  tag?: string
}

interface OnlineUser {
  id: number
  username: string
  avatar: string
  status: 'online' | 'away'
}

interface ProfileMessage {
  id: number
  username: string
  avatar: string
  message: string
  time: string
}

const categories = [
  { name: 'СБОРКИ', subtitle: 'готовые сервера', color: 'gradient-purple', icon: 'Package' },
  { name: 'ПЛАГИНЫ', subtitle: 'новые', color: 'gradient-blue', icon: 'Puzzle' },
  { name: 'ПЛАГИНЫ', subtitle: 'платные', color: 'gradient-red', icon: 'DollarSign' },
  { name: 'СТАТЬИ', subtitle: 'всё о сервере', color: 'gradient-orange', icon: 'BookOpen' },
  { name: 'ТР ПЛАГИНЫ', subtitle: 'плагины', color: 'gradient-lime', icon: 'Sparkles' },
]

const forumTopics: ForumTopic[] = [
  { id: 1, title: 'Превиум сборка RUST только для достойных серверов! [Paid]', author: 'Sempai', category: 'СБОРКА', replies: 25, views: 1205, lastReply: 'Закреплено', isPinned: true, tag: 'СБОРКА' },
  { id: 2, title: 'Изящный дизайн для GameStores Time Rust [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Закреплено', isPinned: true },
  { id: 3, title: 'DeathMessages by VooDoo [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Вчера в 21:05', tag: 'НОВЫЕ' },
  { id: 4, title: 'ServerV Reforged [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Вчера в 19:56', tag: 'НОВЫЕ' },
  { id: 5, title: 'TPBPass [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Четверг в 19:11', tag: 'НОВЫЕ' },
  { id: 6, title: 'Routink [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Среда в 19:13', tag: 'НОВЫЕ' },
  { id: 7, title: 'Space [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Среда в 19:12', tag: 'НОВЫЕ' },
  { id: 8, title: 'Traffic Drivers [Paid]', author: 'Sempai', category: 'НОВЫЕ', replies: 0, views: 0, lastReply: 'Среда в 19:09', tag: 'НОВЫЕ' },
]

const onlineUsers: OnlineUser[] = [
  { id: 1, username: 'saluaDST', avatar: '', status: 'online' },
  { id: 2, username: 'ParagunRAID', avatar: '', status: 'online' },
  { id: 3, username: 'kegi', avatar: '', status: 'online' },
  { id: 4, username: 'Sanckev', avatar: '', status: 'online' },
  { id: 5, username: 'ki_kboycs', avatar: '', status: 'online' },
  { id: 6, username: 'KANK', avatar: '', status: 'online' },
  { id: 7, username: 'Araryyy', avatar: '', status: 'online' },
  { id: 8, username: 'aleeeeee', avatar: '', status: 'online' },
  { id: 9, username: 'Safythew', avatar: '', status: 'online' },
]

const profileMessages: ProfileMessage[] = [
  { id: 1, username: 'Sempai', avatar: '', message: 'В ночь обновлю все плагины', time: '6 Ноя 2025' },
  { id: 2, username: 'unluck4x1', avatar: '', message: 'дружище, скинешь свой дискорд, или добавь меня: un1 вя ная хели', time: '5 Ноя 2025' },
  { id: 3, username: 'YONG', avatar: '', message: 'Привет прими в ДС.', time: '22 Окт 2025' },
  { id: 4, username: 'Sempai', avatar: '', message: 'Пишите если что-то не работает!', time: '2 Окт 2025' },
  { id: 5, username: 'Sempai', avatar: '', message: 'До утра пострались, все плагины обновлю!', time: '4 Сен 2025' },
]

export default function Index() {
  const [activeTab, setActiveTab] = useState('Главная')
  const [searchQuery, setSearchQuery] = useState('')
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const handleAuthSuccess = (user: any, sessionToken: string) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('session_token')
    setCurrentUser(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Icon name="Layers" size={24} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TP</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {['Главная', 'Форум', 'Плагины', 'Новости', 'Профили', 'Правила'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab)}
                  className="text-sm"
                >
                  {tab}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {currentUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{currentUser.username}</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Выход
                </Button>
              </div>
            ) : (
              <>
                <Button size="sm" className="hidden md:inline-flex" onClick={() => { setAuthMode('login'); setAuthDialogOpen(true); }}>ВХОД</Button>
                <Button size="sm" variant="destructive" className="hidden md:inline-flex" onClick={() => { setAuthMode('register'); setAuthDialogOpen(true); }}>РЕГИСТРАЦИЯ</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Список разделов</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {categories.map((category, index) => (
                  <Card
                    key={index}
                    className={`${category.color} p-6 cursor-pointer hover-scale border-0 text-white relative overflow-hidden group`}
                  >
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Icon name={category.icon as any} size={48} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-white/90">{category.subtitle}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                <Button variant="secondary" size="sm">Последние посты</Button>
                <Button variant="ghost" size="sm">Новые темы</Button>
                <Button variant="ghost" size="sm">Горячие темы</Button>
                <Button variant="ghost" size="sm">Наиболее просматриваемые</Button>
              </div>

              <div className="space-y-2">
                {forumTopics.map((topic) => (
                  <Card key={topic.id} className="p-4 hover-scale cursor-pointer">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {topic.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          {topic.tag && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {topic.tag}
                            </Badge>
                          )}
                          <h3 className="text-sm font-medium line-clamp-1 text-foreground">
                            {topic.isPinned && <Icon name="Pin" size={14} className="inline mr-1" />}
                            {topic.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="text-primary">{topic.author}</span>
                          <span className="hidden sm:inline">{topic.lastReply}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                        <div className="hidden md:flex items-center gap-1">
                          <Icon name="MessageSquare" size={16} />
                          <span>{topic.replies}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                          <Icon name="Eye" size={16} />
                          <span>{topic.views}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="Users" size={18} />
                  Пользователи онлайн
                </h3>
                <Badge variant="secondary">{onlineUsers.length}</Badge>
              </div>
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                    </div>
                    <span className="text-primary hover:underline cursor-pointer">{user.username}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                Всего: 59 (пользователей: 9, гостей: 50)
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" size={18} />
                Сообщения профилей
              </h3>
              <div className="space-y-4">
                {profileMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {msg.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-primary">{msg.username}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <Icon name="MoreHorizontal" size={14} />
                          </Button>
                        </div>
                        <p className="text-xs text-foreground mt-1 line-clamp-2">{msg.message}</p>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <section className="border-t border-border bg-card mt-12">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold">Плагины Rust</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="Plus" size={16} />
              Бесплатные плагины
              <Badge variant="secondary" className="ml-2">Новое</Badge>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Бесплатные и приватные плагины раст
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="FileText" size={16} />
              <span>25 темы</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="MessageSquare" size={16} />
              <span>79 сообщения</span>
            </div>
          </div>
        </div>
      </section>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}