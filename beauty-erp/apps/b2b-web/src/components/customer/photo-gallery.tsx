'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  TrashSimple,
  X,
  SpinnerGap,
  Plus,
  Image as ImageIcon,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';

type PhotoType = 'BEFORE' | 'AFTER' | 'PROGRESS';

const typeLabels: Record<PhotoType, string> = {
  BEFORE: '시술 전',
  AFTER: '시술 후',
  PROGRESS: '경과',
};

const typeTabs: { value: PhotoType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'BEFORE', label: '시술 전' },
  { value: 'AFTER', label: '시술 후' },
  { value: 'PROGRESS', label: '경과' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

interface PhotoGalleryProps {
  customerId: string;
}

export function PhotoGallery({ customerId }: PhotoGalleryProps) {
  const [activeTab, setActiveTab] = useState<PhotoType | 'ALL'>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<PhotoType>('AFTER');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const queryType = activeTab === 'ALL' ? undefined : activeTab;
  const { data: photos = [], isLoading } = usePhotos(customerId, queryType);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('error', '이미지 파일만 업로드할 수 있습니다');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('error', '파일 크기는 5MB 이하여야 합니다');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setUploadPreview(base64);
      setUploadOpen(true);
    } catch {
      toast('error', '파일을 읽을 수 없습니다');
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  async function handleUpload() {
    if (!uploadPreview) return;

    try {
      await uploadPhoto.mutateAsync({
        customerId,
        type: uploadType,
        caption: uploadCaption || undefined,
        imageUrl: uploadPreview,
      });
      toast('success', '사진이 업로드되었습니다');
      resetUploadForm();
    } catch (err: any) {
      toast('error', err.message || '업로드에 실패했습니다');
    }
  }

  async function handleDelete() {
    if (!deleteConfirmId) return;
    try {
      await deletePhoto.mutateAsync({ id: deleteConfirmId, customerId });
      toast('success', '사진이 삭제되었습니다');
      setDeleteConfirmId(null);
      // Close lightbox if it's open
      if (lightboxIndex !== null) setLightboxIndex(null);
    } catch (err: any) {
      toast('error', err.message || '삭제에 실패했습니다');
    }
  }

  function resetUploadForm() {
    setUploadOpen(false);
    setUploadPreview(null);
    setUploadCaption('');
    setUploadType('AFTER');
  }

  function navigateLightbox(direction: -1 | 1) {
    if (lightboxIndex === null) return;
    const next = lightboxIndex + direction;
    if (next >= 0 && next < photos.length) {
      setLightboxIndex(next);
    }
  }

  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                activeTab === tab.value
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-medium text-white shadow-soft cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-600 hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]">
          <Plus size={14} weight="bold" />
          사진 추가
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-zinc-200/50 shadow-soft px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
            <Camera size={22} className="text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-500">등록된 사진이 없습니다</p>
          <p className="mt-1 text-xs text-zinc-400">사진을 추가하여 시술 결과를 기록하세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo: any, idx: number) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-zinc-200/50 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption || '시술 사진'}
                className="h-full w-full object-cover"
              />
              {/* Type badge */}
              <span className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
                {typeLabels[photo.type as PhotoType] || photo.type}
              </span>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Image */}
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.caption || '시술 사진'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl"
            />

            {/* Info bar */}
            <div className="mt-3 flex items-center justify-between gap-4 w-full max-w-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                  {typeLabels[lightboxPhoto.type as PhotoType]}
                </span>
                <span className="text-xs text-white/60">
                  {formatDate(lightboxPhoto.createdAt)}
                </span>
                {lightboxPhoto.caption && (
                  <span className="text-xs text-white/80">
                    {lightboxPhoto.caption}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDeleteConfirmId(lightboxPhoto.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
              >
                <TrashSimple size={14} />
              </button>
            </div>

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                {lightboxIndex! > 0 && (
                  <button
                    onClick={() => navigateLightbox(-1)}
                    className="absolute left-[-3rem] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                  >
                    <CaretLeft size={20} />
                  </button>
                )}
                {lightboxIndex! < photos.length - 1 && (
                  <button
                    onClick={() => navigateLightbox(1)}
                    className="absolute right-[-3rem] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                  >
                    <CaretRight size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadOpen}
        onOpenChange={(open) => {
          if (!open) resetUploadForm();
          else setUploadOpen(open);
        }}
        title="사진 업로드"
        description="시술 사진을 업로드합니다"
      >
        <div className="space-y-5">
          {/* Preview */}
          {uploadPreview && (
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-zinc-200/50">
              <img
                src={uploadPreview}
                alt="미리보기"
                className="w-full max-h-[300px] object-contain bg-zinc-50"
              />
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-2">
              사진 유형
            </label>
            <div className="flex gap-2">
              {(['BEFORE', 'AFTER', 'PROGRESS'] as PhotoType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setUploadType(type)}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    uploadType === type
                      ? 'bg-brand-500 text-white shadow-soft'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                  )}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-2">
              설명 (선택)
            </label>
            <input
              type="text"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              placeholder="사진에 대한 간단한 설명"
              className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 ring-1 ring-zinc-200/50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetUploadForm}
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-200 active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadPhoto.isPending || !uploadPreview}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60"
            >
              {uploadPhoto.isPending && <SpinnerGap size={16} className="animate-spin" />}
              업로드
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
        title="사진 삭제"
        description="이 작업은 되돌릴 수 없습니다"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            이 사진을 삭제하시겠습니까?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-200 active:scale-[0.98]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePhoto.isPending}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
            >
              {deletePhoto.isPending && <SpinnerGap size={16} className="animate-spin" />}
              삭제
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
