import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProfileSettings from '@/components/ProfileSettings';
import Status from '@/components/Status';

const AVATAR_W = 'https://cdn.poehali.dev/projects/ca756fe0-1a9b-44c2-b927-80ad70b74e8a/files/432ae09e-7556-4e45-ab34-c76f109dc856.jpg';
const AVATAR_M = 'https://cdn.poehali.dev/projects/ca756fe0-1a9b-44c2-b927-80ad70b74e8a/files/d9249201-26d5-462c-a558-7cc3b40491d1.jpg';
const STORY_BG = 'https://cdn.poehali.dev/projects/ca756fe0-1a9b-44c2-b927-80ad70b74e8a/files/900360dc-01c6-4260-82f9-177e938a0223.jpg';

const stories = [
  { name: 'Твоя история', avatar: AVATAR_M, add: true },
  { name: 'Алина', avatar: AVATAR_W, live: false },
  { name: 'Максим', avatar: AVATAR_M, live: true },
  { name: 'София', avatar: AVATAR_W, live: false },
  { name: 'Артём', avatar: AVATAR_M, live: false },
  { name: 'Дarya', avatar: AVATAR_W, live: true },
  { name: 'Илья', avatar: AVATAR_M, live: false },
];

const navItems = [
  { icon: 'House', label: 'Лента' },
  { icon: 'Search', label: 'Поиск' },
  { icon: 'Radio', label: 'Эфиры' },
  { icon: 'MessageCircle', label: 'Чаты' },
  { icon: 'User', label: 'Профиль' },
];

const channels = [
  { name: 'Дизайн & Тренды', members: '12.4K', private: false, color: 'from-fuchsia-500 to-purple-600', icon: 'Palette' },
  { name: 'IT Сообщество', members: '8.1K', private: false, color: 'from-cyan-400 to-blue-600', icon: 'Code' },
  { name: 'Закрытый клуб', members: '320', private: true, color: 'from-amber-400 to-pink-500', icon: 'Lock' },
  { name: 'Путешествия', members: '24.7K', private: false, color: 'from-emerald-400 to-teal-600', icon: 'Plane' },
];

const lives = [
  { author: 'Максим Орлов', avatar: AVATAR_M, title: 'Дизайним приложение в прямом эфире', viewers: '1.2K' },
  { author: 'Дарья Лис', avatar: AVATAR_W, title: 'Q&A: как набрать первую 1000 подписчиков', viewers: '843' },
];

const chats = [
  { name: 'София Климова', avatar: AVATAR_W, last: 'Скинула фото с эфира 🔥', time: '2 мин', unread: 3, online: true },
  { name: 'Артём Белов', avatar: AVATAR_M, last: 'Печатает...', time: '15 мин', unread: 0, online: true },
  { name: 'Дизайн & Тренды', avatar: AVATAR_W, last: 'Алина: новый разбор готов', time: '1 ч', unread: 12, online: false },
];



const Index = () => {
  const [active, setActive] = useState('Лента');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px]" />

      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/30">
              <Icon name="Orbit" className="text-white" size={20} />
            </div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:block">Orbit</span>
          </div>

          <div className="flex-1 max-w-md mx-auto relative">
            <Icon name="Search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Найти людей, каналы, эфиры…" className="pl-10 rounded-full bg-muted/60 border-transparent focus-visible:ring-primary h-11" />
          </div>

          <button className="relative w-11 h-11 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <Icon name="Bell" size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse-ring" />
          </button>
          <img src={AVATAR_M} alt="Профиль" className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40 hidden sm:block" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_320px] gap-6 pb-28 lg:pb-12">
        <div className="space-y-6 min-w-0">
          <section className="animate-fade-in">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {stories.map((s, i) => {
                const inner = (
                  <button className="flex flex-col items-center gap-2 shrink-0 group">
                    <div className={`p-[3px] rounded-full ${s.add ? 'bg-muted' : 'story-ring'} group-hover:scale-105 transition-transform`}>
                      <div className="p-[2px] bg-background rounded-full relative">
                        <img src={s.avatar} alt={s.name} className="w-16 h-16 rounded-full object-cover" />
                        {s.add && (
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-brand flex items-center justify-center ring-2 ring-background">
                            <Icon name="Plus" size={14} className="text-white" />
                          </span>
                        )}
                        {s.live && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-secondary px-2 py-0.5 rounded-full ring-2 ring-background">LIVE</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground max-w-[68px] truncate">{s.name}</span>
                  </button>
                );
                return s.add ? (
                  <Status key={i} trigger={inner} />
                ) : (
                  <span key={i}>{inner}</span>
                );
              })}
            </div>
          </section>

          <section className="relative rounded-3xl overflow-hidden animate-scale-in shadow-xl shadow-primary/10">
            <img src={STORY_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative p-6 sm:p-8 min-h-[220px] flex flex-col justify-end text-white">
              <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full mb-3">
                <Icon name="Sparkles" size={14} /> Рекомендуем
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight max-w-md">Делись историями, создавай каналы и веди прямые эфиры</h2>
              <div className="flex gap-3 mt-5">
                <Button className="rounded-full gradient-brand border-0 text-white shadow-lg shadow-secondary/30 hover:opacity-90">
                  <Icon name="Plus" size={18} className="mr-1" /> Создать историю
                </Button>
                <Button variant="outline" className="rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Icon name="Radio" size={18} className="mr-1" /> Начать эфир
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" /> В прямом эфире
              </h3>
              <button className="text-sm text-primary font-medium hover:underline">Все эфиры</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {lives.map((l, i) => (
                <div key={i} className="group relative rounded-2xl border border-border bg-card p-4 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img src={l.avatar} alt={l.author} className="w-11 h-11 rounded-full object-cover ring-2 ring-secondary/50" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-secondary px-1.5 rounded-full ring-2 ring-card">LIVE</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{l.author}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Icon name="Eye" size={12} /> {l.viewers} смотрят</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-snug">{l.title}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Каналы и сообщества</h3>
              <button className="text-sm text-primary font-medium hover:underline">Открыть все</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {channels.map((c, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                    <Icon name={c.icon} size={22} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {c.name}
                      {c.private && <Icon name="Lock" size={13} className="text-muted-foreground shrink-0" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.members} участников</p>
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-full text-primary hover:bg-primary/10 shrink-0">
                    {c.private ? 'Запрос' : 'Вступить'}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl overflow-hidden border border-border bg-card animate-fade-in">
            <div className="h-20 gradient-brand" />
            <div className="px-5 pb-5 -mt-10">
              <img src={AVATAR_M} alt="Профиль" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-card" />
              <h3 className="font-display font-bold text-lg mt-3">Иван Космос</h3>
              <p className="text-sm text-muted-foreground">@ivan.orbit · Москва</p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {[['248', 'постов'], ['12.8K', 'подписчиков'], ['356', 'подписок']].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-muted/60 py-2">
                    <p className="font-display font-bold text-sm">{n}</p>
                    <p className="text-[11px] text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <ProfileSettings
                trigger={
                  <Button className="w-full mt-4 rounded-full gradient-brand border-0 text-white">
                    <Icon name="Settings" size={16} className="mr-1.5" /> Настройки профиля
                  </Button>
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Сообщения</h3>
              <button className="text-primary"><Icon name="SquarePen" size={18} /></button>
            </div>
            <div className="space-y-1">
              {chats.map((c, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors text-left">
                  <div className="relative shrink-0">
                    <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-full object-cover" />
                    {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className={`text-xs truncate ${c.last === 'Печатает...' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{c.last}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full gradient-brand text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setActive(item.label)} className="relative flex flex-col items-center gap-0.5 px-3 py-1">
              <Icon name={item.icon} size={22} className={active === item.label ? 'text-primary' : 'text-muted-foreground'} />
              <span className={`text-[10px] ${active === item.label ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{item.label}</span>
              {active === item.label && <span className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;