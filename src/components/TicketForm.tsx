import { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import type { Ticket, Priority, Status } from '@/types';
import { CATEGORIES } from '@/types';
import { validateImageFile, compressImage } from '@/lib/image';
import { uid } from '@/lib/storage';

export type FormValues = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 2000;
const LOCATION_MAX_LENGTH = 160;

interface TicketFormProps {
  open: boolean;
  initial: Ticket | null;
  onClose: () => void;
  onSubmit: (values: FormValues, historyEntry?: { action: string; details?: string }) => void;
}

function makeEntry(action: string, details?: string) {
  return {
    id: uid(),
    timestamp: new Date().toISOString(),
    action,
    details,
  };
}

export function TicketForm({ open, initial, onClose, onSubmit }: TicketFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('pending');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imageBusy, setImageBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setCategory(initial?.category ?? CATEGORIES[0]);
    setLocation(initial?.location ?? '');
    setPriority(initial?.priority ?? 'medium');
    setStatus(initial?.status ?? 'pending');
    setImage(initial?.image);
    setErrors({});
    setImageError(null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    titleRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !imageBusy) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, imageBusy]);

  if (!open) return null;

  function validate(): boolean {
    const next: Record<string, string> = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedTitle) next.title = 'Informe um título.';
    else if (trimmedTitle.length < 3) next.title = 'O título deve ter pelo menos 3 caracteres.';
    else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      next.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`;
    }
    if (!trimmedDescription) next.description = 'Descreva o problema.';
    else if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      next.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
    }
    if (!trimmedLocation) next.location = 'Informe o local.';
    else if (trimmedLocation.length > LOCATION_MAX_LENGTH) {
      next.location = `O local deve ter no máximo ${LOCATION_MAX_LENGTH} caracteres.`;
    }
    if (!CATEGORIES.some((option) => option === category)) {
      next.category = 'Selecione uma categoria válida.';
    }

    setErrors(next);
    if (Object.keys(next).length === 0) return true;

    if (next.title) titleRef.current?.focus();
    else if (next.description) descriptionRef.current?.focus();
    else if (next.category) categoryRef.current?.focus();
    else if (next.location) locationRef.current?.focus();
    return false;
  }

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const v = validateImageFile(file);
    if (!v.ok) {
      setImageError(v.error ?? 'Não foi possível validar a imagem.');
      return;
    }

    setImageError(null);
    setImageBusy(true);
    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : 'Não foi possível processar a imagem.'
      );
    } finally {
      setImageBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageBusy || !validate()) return;

    const values: FormValues = {
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority,
      status,
      image,
    };

    if (initial) {
      const changes: string[] = [];
      if (initial.title !== values.title) changes.push('título');
      if (initial.description !== values.description) changes.push('descrição');
      if (initial.category !== values.category) changes.push('categoria');
      if (initial.location !== values.location) changes.push('local');
      if (initial.priority !== values.priority) changes.push(`prioridade → ${values.priority}`);
      if (initial.status !== values.status) changes.push(`status → ${values.status}`);
      if (initial.image !== values.image) changes.push('imagem');

      const history =
        changes.length > 0
          ? makeEntry('Chamado editado', changes.join(', '))
          : undefined;
      onSubmit(values, history);
    } else {
      const history = makeEntry('Chamado aberto');
      onSubmit(values, history);
    }
  }

  const fieldBase =
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={() => !imageBusy && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-form-title"
        className="relative my-4 w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl animate-scale-in"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-5 py-4 backdrop-blur">
          <h2 id="ticket-form-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {initial ? 'Editar chamado' : 'Abrir chamado'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={imageBusy}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="ticket-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              id="ticket-title"
              type="text"
              required
              minLength={3}
              maxLength={TITLE_MAX_LENGTH}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearFieldError('title');
              }}
              placeholder="Ex.: Lâmpada queimada no corredor"
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'ticket-title-error' : undefined}
              className={`${fieldBase} ${
                errors.title
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            {errors.title && (
              <p id="ticket-title-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ticket-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={descriptionRef}
              id="ticket-description"
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearFieldError('description');
              }}
              rows={4}
              placeholder="Descreva o problema com detalhes relevantes..."
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'ticket-description-error' : undefined}
              className={`${fieldBase} resize-y ${
                errors.description
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            {errors.description && (
              <p id="ticket-description-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticket-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                ref={categoryRef}
                id="ticket-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearFieldError('category');
                }}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'ticket-category-error' : undefined}
                className={`${fieldBase} ${
                  errors.category
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="ticket-category-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.category}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="ticket-location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Local <span className="text-red-500">*</span>
              </label>
              <input
                ref={locationRef}
                id="ticket-location"
                type="text"
                required
                maxLength={LOCATION_MAX_LENGTH}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  clearFieldError('location');
                }}
                placeholder="Ex.: Bloco A, 3º andar"
                aria-required="true"
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'ticket-location-error' : undefined}
                className={`${fieldBase} ${
                  errors.location
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {errors.location && (
                <p id="ticket-location-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Prioridade
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    aria-pressed={priority === p}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      priority === p
                        ? 'border-primary-500 bg-primary-50 text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/50'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="ticket-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="ticket-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={`${fieldBase} border-slate-300 dark:border-slate-600`}
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em andamento</option>
                <option value="resolved">Resolvido</option>
              </select>
            </div>
          </div>

          <div>
            <p id="ticket-image-label" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Imagem
            </p>
            <div className="flex items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                {image ? (
                  <img src={image} alt="Pré-visualização" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  id="ticket-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFile}
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={imageBusy}
                  aria-controls="ticket-image"
                  aria-labelledby="ticket-image-label ticket-image-action"
                  aria-describedby={imageError ? 'ticket-image-error' : 'ticket-image-help'}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {imageBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {image ? 'Trocar imagem' : 'Selecionar imagem'}
                </button>
                <span id="ticket-image-action" className="sr-only">
                  {image ? 'Trocar imagem do chamado' : 'Selecionar imagem do chamado'}
                </span>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="ml-2 text-sm text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    Remover
                  </button>
                )}
                <p id="ticket-image-help" className="mt-1 text-xs text-slate-400">
                  JPG, PNG, WebP ou GIF. Máx. 5 MB. A imagem é redimensionada para economizar espaço.
                </p>
                {imageBusy && (
                  <p role="status" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Processando imagem…
                  </p>
                )}
                {imageError && (
                  <p id="ticket-image-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {imageError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={imageBusy}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={imageBusy}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {imageBusy
                ? 'Processando imagem…'
                : initial
                  ? 'Salvar alterações'
                  : 'Abrir chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
