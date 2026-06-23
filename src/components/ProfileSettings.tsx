import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProfileSettingsProps {
  avatar: string;
  trigger: React.ReactNode;
}

interface ToggleRowProps {
  icon: string;
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = ({ icon, title, desc, value, onChange }: ToggleRowProps) => (
  <div className="flex items-center gap-3 py-3">
    <div className="w-10 h-10 rounded-xl bg-muted/70 flex items-center justify-center shrink-0">
      <Icon name={icon} size={18} className="text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
    </div>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);

const ProfileSettings = ({ avatar, trigger }: ProfileSettingsProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(avatar);
  const [name, setName] = useState('Иван Космос');
  const [username, setUsername] = useState('ivan.orbit');
  const [bio, setBio] = useState('Исследую цифровую вселенную 🚀');
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideOnline, setHideOnline] = useState(false);
  const [whoCanMessage, setWhoCanMessage] = useState(true);
  const [hideStatusViews, setHideStatusViews] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-20 gradient-brand shrink-0" />
        <DialogHeader className="px-6 -mt-12 shrink-0 text-left space-y-0">
          <DialogTitle className="font-display text-xl">Настройки профиля</DialogTitle>
          <div className="flex items-end gap-4 mt-3">
            <div className="relative">
              <img src={photo} alt="Аватар" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full gradient-brand flex items-center justify-center ring-2 ring-background hover:opacity-90 transition-opacity"
              >
                <Icon name="Camera" size={16} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full mb-1"
              onClick={() => fileRef.current?.click()}
            >
              <Icon name="Upload" size={14} className="mr-1.5" /> Сменить фото
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto scrollbar-hide space-y-5">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Имя</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Имя пользователя</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl pl-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">О себе</label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="border-t border-border pt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground py-2 flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={14} /> Приватность
            </p>
            <div className="divide-y divide-border">
              <ToggleRow
                icon="Lock"
                title="Закрытый профиль"
                desc="Контент видят только одобренные подписчики"
                value={privateProfile}
                onChange={setPrivateProfile}
              />
              <ToggleRow
                icon="EyeOff"
                title="Скрыть статус «в сети»"
                desc="Другие не увидят, когда вы онлайн"
                value={hideOnline}
                onChange={setHideOnline}
              />
              <ToggleRow
                icon="MessageCircle"
                title="Сообщения от всех"
                desc="Писать могут не только подписчики"
                value={whoCanMessage}
                onChange={setWhoCanMessage}
              />
              <ToggleRow
                icon="Eye"
                title="Скрыть просмотры статусов"
                desc="Не показывать, что вы смотрели чужие статусы"
                value={hideStatusViews}
                onChange={setHideStatusViews}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <Button className="w-full rounded-full gradient-brand border-0 text-white hover:opacity-90">
            Сохранить изменения
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;
