import { useRef, useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  fetchStatuses,
  uploadStatusMedia,
  createStatus,
  fetchStatusViews,
  USER_ID,
  StatusItem,
  StatusViewer,
} from '@/lib/api';

interface StatusProps {
  trigger: React.ReactNode;
}

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

const Status = ({ trigger }: StatusProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [current, setCurrent] = useState<StatusItem | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [viewers, setViewers] = useState<StatusViewer[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPreview(null);
    setShowViewers(false);
    setPublished(false);
    fetchStatuses(USER_ID).then((list) => {
      setStatuses(list);
      if (list.length > 0) {
        setCurrent(list[0]);
        fetchStatusViews(list[0].id).then(setViewers);
      } else {
        setCurrent(null);
        setViewers([]);
      }
    });
  }, [open]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');
    setPreview({ url: localUrl, type: isVideo ? 'video' : 'image' });
    setCurrent(null);
    setUploading(true);
    try {
      const { media_url, media_type } = await uploadStatusMedia(USER_ID, file);
      setPreview({ url: media_url, type: media_type });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    try {
      const { status_id } = await createStatus(USER_ID, preview.url, preview.type);
      const newStatus: StatusItem = {
        id: status_id,
        user_id: USER_ID,
        media_url: preview.url,
        media_type: preview.type,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      setStatuses([newStatus, ...statuses]);
      setCurrent(newStatus);
      setPreview(null);
      setViewers([]);
      setPublished(true);
      setTimeout(() => setPublished(false), 2000);
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleViewers = async () => {
    if (!current) return;
    if (!showViewers) {
      const views = await fetchStatusViews(current.id);
      setViewers(views);
    }
    setShowViewers((v) => !v);
  };

  const activeMedia = preview ?? (current ? { url: current.media_url, type: current.media_type } : null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 text-left">
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Icon name="CirclePlay" size={20} className="text-primary" /> Мой статус
          </DialogTitle>
        </DialogHeader>

        {!activeMedia ? (
          <div className="px-6 pb-6 space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center">
                <Icon name="Plus" size={28} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Добавить статус</p>
              <p className="text-xs text-muted-foreground text-center px-6">Фото или видео до 1 минуты — исчезнет через 24 часа</p>
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
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <Icon name="Loader" size={16} className="animate-spin text-primary" /> Загрузка медиа...
              </div>
            )}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black">
              {activeMedia.type === 'image'
                ? <img src={activeMedia.url} alt="Статус" className="w-full h-full object-cover" />
                : <video src={activeMedia.url} controls className="w-full h-full object-cover" />}
              <div className="absolute top-0 inset-x-0 p-3 flex gap-1.5">
                <div className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden">
                  <div className="h-full w-full bg-white rounded-full" />
                </div>
              </div>
              {published && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
                  <div className="text-white text-center">
                    <Icon name="CheckCircle" size={40} className="mx-auto mb-2 text-emerald-400" />
                    <p className="font-semibold">Статус опубликован!</p>
                  </div>
                </div>
              )}
            </div>

            {current && (
              <>
                <button
                  onClick={handleToggleViewers}
                  className="w-full flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="Eye" size={18} className="text-primary" /> Просмотры
                    <span className="text-muted-foreground font-normal">{viewers.length}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {viewers.length > 0 && (
                      <div className="flex -space-x-2">
                        {viewers.slice(0, 3).map((v, i) => (
                          <img key={i} src={v.viewer_avatar} alt={v.viewer_name} className="w-7 h-7 rounded-full object-cover ring-2 ring-muted" />
                        ))}
                      </div>
                    )}
                    <Icon name={showViewers ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
                  </div>
                </button>

                {showViewers && (
                  <div className="space-y-1 animate-fade-in max-h-48 overflow-y-auto scrollbar-hide">
                    {viewers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Пока никто не смотрел</p>
                    ) : viewers.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 px-1 py-2">
                        <img src={v.viewer_avatar} alt={v.viewer_name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{v.viewer_name}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(v.viewed_at)}</p>
                        </div>
                        <Icon name="Eye" size={14} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {preview && (
              <>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Icon name="RefreshCw" size={16} className="mr-1.5" /> Заменить
                  </Button>
                  <Button
                    className="flex-1 rounded-full gradient-brand border-0 text-white hover:opacity-90 disabled:opacity-60"
                    onClick={handlePublish}
                    disabled={uploading || publishing}
                  >
                    {publishing
                      ? <><Icon name="Loader" size={16} className="mr-1.5 animate-spin" /> Публикую...</>
                      : <><Icon name="Send" size={16} className="mr-1.5" /> Опубликовать</>}
                  </Button>
                </div>
              </>
            )}

            {current && !preview && (
              <Button variant="outline" className="w-full rounded-full" onClick={() => fileRef.current?.click()}>
                <Icon name="Plus" size={16} className="mr-1.5" /> Добавить новый статус
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Status;
