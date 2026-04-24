import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, X, FileText, Save } from 'lucide-react'
import {
  createRegistration,
  editRegistration,
  isRegistrationDraft,
} from '@/api/registrations'
import { formatApiError } from '@/api/client'
import { useRegistrationDetail } from '@/hooks/useRegistrations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { RegistrationFormData } from '@/api/types'

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  assigned_company_voen: z.string().min(1, 'VÖEN kodu tələb olunur').max(32),
  assigned_company_legal_name: z.string().min(1, 'Hüquqi ad tələb olunur').max(255),
  registered_number: z.string().max(255),
  number_assignment: z.string().max(255),
  operator: z.string().max(255),
  license_number: z.string().max(255),
  license_date: z.string(),
  current_status: z.string().max(255),
  usage_level: z.string().max(255),
  given_period: z.string().max(255),
  usage_period: z.string().max(255),
  one_time_payment_status: z.string().max(255),
  annual_payment_status: z.string().max(255),
  contract_number: z.string().max(255),
  contract_date: z.string(),
  contract_file: z.union([z.instanceof(File), z.null()]).optional(),
  application_file: z.union([z.instanceof(File), z.null()]).optional(),
  number_resource_allocation_plan_file: z.union([z.instanceof(File), z.null()]).optional(),
})

type FormValues = z.infer<typeof schema>

// ─── File Upload Field ────────────────────────────────────────────────────────

interface FileFieldProps {
  label: string
  name: keyof FormValues
  value: File | null | undefined
  existingPath?: string | null
  onChange: (file: File | null) => void
  error?: string
}

function FileField({ label, value, existingPath, onChange, error }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const fileName = value?.name || (existingPath ? existingPath.split('/').pop() : null)

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
          dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
          error && 'border-red-300',
        )}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) onChange(file)
        }}
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={`${label} faylını seçin`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            onChange(file || null)
          }}
        />
        {fileName ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{fileName}</span>
            <button
              type="button"
              className="ml-1 rounded p-0.5 text-slate-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              aria-label="Faylı sil"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Upload className="h-6 w-6" />
            <span className="text-sm">
              Faylı buraya atın və ya{' '}
              <span className="text-blue-600 font-medium">seçin</span>
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Form Field Wrapper ───────────────────────────────────────────────────────

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RegistrationFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const { data: existing, loading: loadingExisting } = useRegistrationDetail(id || null)

  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assigned_company_voen: '',
      assigned_company_legal_name: '',
      registered_number: '',
      number_assignment: '',
      operator: '',
      license_number: '',
      license_date: '',
      current_status: '',
      usage_level: '',
      given_period: '',
      usage_period: '',
      one_time_payment_status: '',
      annual_payment_status: '',
      contract_number: '',
      contract_date: '',
      contract_file: null,
      application_file: null,
      number_resource_allocation_plan_file: null,
    },
  })

  useEffect(() => {
    if (!existing) return
    if (!isRegistrationDraft(existing)) {
      navigate(`/registrations/${id}`, { replace: true })
      return
    }
    reset({
      assigned_company_voen: existing.assigned_company_voen || '',
      assigned_company_legal_name: existing.assigned_company_legal_name || '',
      registered_number: existing.registered_number || '',
      number_assignment: existing.number_assignment || '',
      operator: existing.operator || '',
      license_number: existing.license_number || '',
      license_date: existing.license_date?.split('T')[0] || '',
      current_status: existing.current_status || '',
      usage_level: existing.usage_level || '',
      given_period: existing.given_period || '',
      usage_period: existing.usage_period || '',
      one_time_payment_status: existing.one_time_payment_status || '',
      annual_payment_status: existing.annual_payment_status || '',
      contract_number: existing.contract_number || '',
      contract_date: existing.contract_date?.split('T')[0] || '',
      contract_file: null,
      application_file: null,
      number_resource_allocation_plan_file: null,
    })
  }, [existing, id, navigate, reset])

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      const formData: RegistrationFormData = {
        assigned_company_voen: values.assigned_company_voen,
        assigned_company_legal_name: values.assigned_company_legal_name,
        registered_number: values.registered_number || '',
        number_assignment: values.number_assignment || '',
        operator: values.operator || '',
        license_number: values.license_number || '',
        license_date: values.license_date || '',
        current_status: values.current_status || '',
        usage_level: values.usage_level || '',
        given_period: values.given_period || '',
        usage_period: values.usage_period || '',
        one_time_payment_status: values.one_time_payment_status || '',
        annual_payment_status: values.annual_payment_status || '',
        contract_number: values.contract_number || '',
        contract_date: values.contract_date || '',
        contract_file: values.contract_file || null,
        application_file: values.application_file || null,
        number_resource_allocation_plan_file: values.number_resource_allocation_plan_file || null,
      }

      const res = isEdit
        ? await editRegistration(id!, formData)
        : await createRegistration(formData)

      if (res.success) {
        navigate('/registrations')
      } else {
        setApiError(res.message || 'Saxlama alınmadı')
      }
    } catch (e) {
      setApiError(formatApiError(e))
    }
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
          <span>Yüklənir…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Geri">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Qeydiyyatı redaktə et' : 'Yeni qeydiyyat'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Qaralama məlumatlarını dəyişdirin' : 'Qaralama kimi saxlanılacaq'}
          </p>
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Company */}
        <Section title="Şirkət">
          <div className="sm:col-span-1">
            <Field label="Şirkətin VÖEN kodu" required error={errors.assigned_company_voen?.message}>
              <Input
                {...register('assigned_company_voen')}
                placeholder="Məs: 1234567890"
                maxLength={32}
                error={!!errors.assigned_company_voen}
                autoComplete="organization"
              />
            </Field>
          </div>
          <div className="sm:col-span-1">
            <Field label="Şirkətin hüquqi adı" required error={errors.assigned_company_legal_name?.message}>
              <Input
                {...register('assigned_company_legal_name')}
                placeholder="Şirkətin tam adı"
                maxLength={255}
                error={!!errors.assigned_company_legal_name}
              />
            </Field>
          </div>
        </Section>

        {/* Number & License */}
        <Section title="Nömrə və lisenziya">
          <Field label="Nömrə resursu" error={errors.registered_number?.message}>
            <Input {...register('registered_number')} placeholder="Məs: +994 50 XXX" />
          </Field>
          <Field label="Nömrə resursunun təyinatı" error={errors.number_assignment?.message}>
            <Input {...register('number_assignment')} placeholder="Coğrafi / qeyri-coğrafi" />
          </Field>
          <Field label="Operator" error={errors.operator?.message}>
            <Input {...register('operator')} placeholder="Operator adı" />
          </Field>
          <Field label="Lisenziya nömrəsi" error={errors.license_number?.message}>
            <Input {...register('license_number')} placeholder="Lisenziya nömrəsi" />
          </Field>
          <Field label="Lisenziya tarixi" error={errors.license_date?.message}>
            <Input {...register('license_date')} type="date" placeholder="YYYY-MM-DD" />
          </Field>
        </Section>

        {/* Status & Usage */}
        <Section title="Status və istifadə">
          <Field label="Status" error={errors.current_status?.message}>
            <Input {...register('current_status')} placeholder="Status" />
          </Field>
          <Field label="İstifadə səviyyəsi" error={errors.usage_level?.message}>
            <Input {...register('usage_level')} placeholder="İstifadə səviyyəsi" />
          </Field>
          <Field label="Ayrılma tarixi" error={errors.given_period?.message}>
            <Input {...register('given_period')} placeholder="Ayrılma tarixi" />
          </Field>
          <Field label="İstifadə müddəti" error={errors.usage_period?.message}>
            <Input {...register('usage_period')} placeholder="İstifadə müddəti" />
          </Field>
          <Field label="Birdəfəlik ödəniş statusu" error={errors.one_time_payment_status?.message}>
            <Input {...register('one_time_payment_status')} placeholder="Ödəniş statusu" />
          </Field>
          <Field label="İllik ödəniş statusu" error={errors.annual_payment_status?.message}>
            <Input {...register('annual_payment_status')} placeholder="İllik ödəniş statusu" />
          </Field>
        </Section>

        {/* Contract */}
        <Section title="Müqavilə">
          <Field label="Müqavilənin nömrəsi" error={errors.contract_number?.message}>
            <Input {...register('contract_number')} placeholder="Müqavilə nömrəsi" />
          </Field>
          <Field label="Müqavilənin tarixi" error={errors.contract_date?.message}>
            <Input {...register('contract_date')} type="date" />
          </Field>
        </Section>

        {/* Files */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Əlavələr</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <Controller
              control={control}
              name="contract_file"
              render={({ field }) => (
                <FileField
                  label="Müqavilə faylı"
                  name="contract_file"
                  value={field.value}
                  existingPath={existing?.contract_file}
                  onChange={field.onChange}
                  error={errors.contract_file?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="application_file"
              render={({ field }) => (
                <FileField
                  label="Ərizə faylı"
                  name="application_file"
                  value={field.value}
                  existingPath={existing?.application_file}
                  onChange={field.onChange}
                  error={errors.application_file?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="number_resource_allocation_plan_file"
              render={({ field }) => (
                <FileField
                  label="Nömrə resurslarının bölüşdürülməsi planı faylı"
                  name="number_resource_allocation_plan_file"
                  value={field.value}
                  existingPath={existing?.number_resource_allocation_plan_file}
                  onChange={field.onChange}
                  error={errors.number_resource_allocation_plan_file?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 py-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Ləğv et
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {!isSubmitting && <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saxlanılır…' : isEdit ? 'Dəyişiklikləri saxla' : 'Qaralama kimi saxla'}
          </Button>
        </div>
      </form>
    </div>
  )
}
