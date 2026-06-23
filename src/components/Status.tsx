import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Viewer {
  name: string;
  avatar: string;
  time: string;
}

interface StatusProps {
  avatar: string;
  viewers: Viewer[];
  trigger: React.ReactNode;
}

const Status = ({ avatar, viewers, trigger }: StatusProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showViewers, setShowViewers] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    setMedia({ url: URL.createObjectURL(file), type: isVideo ? 'video' : 'image' });
    setShowViewers(false);
  };

  return (
    <Dialog onOpenChange={() => { setMedia(null); setShowViewers(false); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 text-left">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Icon name="CirclePlay" size={20} className="text-primary" /> Мой статус
          </DialogTitle>
        </DialogHeader>

        {!media ? (
          <div className="px-6 pb-6 space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center">
                <Icon name="Plus" size={28} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Добавить статус</p>
              <p className="text-xs text-muted-foreground text-center px-6">Фото или видео до 1 минуты, исчезнет через 24 часа</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => fileRef.current?.click()}>
                <Icon name="Image" size={16} className="mr-1.5" /> Фото
              </Button>
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => fileRef.current?.click()}>
                <Icon name="Video" size={16} className="mr-1.5" /> Видео
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
              {media.type === 'image' ? (
                <img src={media.url} alt="Статус" className="w-full h-full object-cover" />
              ) : (
                <video src={media.url} controls className="w-full h-full object-cover" />
              )}
              <div className="absolute top-0 inset-x-0 p-3 flex gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden">
                  <div className="h-full w-1/3 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowViewers((v) => !v)}
              className="w-full flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="Eye" size={18} className="text-primary" /> Просмотры
                <span className="text-muted-foreground font-normal">{viewers.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {viewers.slice(0, 3).map((v, i) => (
                    <img key={i} src={v.avatar} alt={v.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-muted" />
                  ))}
                </div>
                <Icon name={showViewers ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
              </div>
            </button>

            {showViewers && (
              <div className="space-y-1 animate-fade-in max-h-48 overflow-y-auto scrollbar-hide">
                {viewers.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 px-1 py-2">
                    <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.time}</p>
                    </div>
                    <Icon name="Eye" size={14} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full rounded-full gradient-brand border-0 text-white hover:opacity-90">
              <Icon name="Send" size={16} className="mr-1.5" /> Опубликовать статус
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Status;
