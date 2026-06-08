import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneCall, LogIn, Loader2 } from "lucide-react";
import { login } from "@/api/auth";
import { formatApiError, apiClient } from "@/api/client";
import { useDigitalLoginStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserRole } from "@/api/types";

const schema = z.object({
  selectedCertificate: z.string(),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { initialize } = useDigitalLoginStore();
  useEffect(() => {
    initialize();
  }, [initialize]);

  const location = useLocation();
  const navigate = useNavigate();

  const code: string | null = new URLSearchParams(location.search).get("code");
  const { setAuth, getAuthToken } = useDigitalLoginStore();

  if (getAuthToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!getAuthToken() && !code) {
    useEffect(() => {
      apiClient
        .post("/getDigitalLoginUrl")
        .then((res) => {
          const url = res.data.payload.loginUrl;
          window.location.href = url;
          // window.location.href =
          //   "http://localhost:5173/login?code=6f85fbce4cee4b799eba6ef559af8dfc";
        })
        .catch((err) => {
          console.log(err);
          navigate("/unauthorized");
        });
    }, []);

    return;
  }

  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const selectedCertificate = JSON.parse(data.selectedCertificate);
    console.log(selectedCertificate);
    setApiError(null);
    try {
      const res = await login(selectedCertificate); // pin, voen, is_legal, has_stamp, ...
      console.log(res);
      const { authToken, companyType } = res.payload;
      setAuth(authToken, companyType as UserRole);
      navigate(from, { replace: true });
    } catch (e) {
      setApiError(formatApiError(e));
    }
  }

  const [certificates, setCertificates] = useState<any[]>([]);

  const hasFetched = useRef(false);
  const accessToken = useRef<string | null>(null);
  const idToken = useRef<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchDigitalLoginData = async () => {
      try {
        const tokenRes = await apiClient.post("/getDigitalLoginAccessToken", {
          code,
        });
        const { access_token, id_token } = tokenRes.data.payload;
        accessToken.current = access_token;
        idToken.current = id_token;

        const sessionRes = await apiClient.post("/getDigitalLoginSession", {
          access_token: access_token,
        });

        const { session_id, login_type, error } =
          sessionRes.data.payload.login_session;

        if (error) {
          navigate("/unauthorized"); // digital login giris ucun yonlendirilecek
          return;
        }

        const certificatesRes = await apiClient.post(
          "/getDigitalLoginCertificates",
          {
            access_token: access_token,
          },
        );

        if (certificatesRes.data.payload.certificates.error) {
          navigate("/unauthorized"); // digital login giris ucun yonlendirilecek
          return;
        }

        const certificates =
          certificatesRes.data.payload.certificates.certificates || [];
        setCertificates(certificates);

        console.log({
          idToken,
          session_id,
          login_type,
          certificates,
        });
      } catch (error) {
        console.error("Digital login flow failed:", error);
        navigate("/unauthorized"); // digital login giris ucun yonlendirilecek
      } finally {
        setIsLoading(false);
      }
    };

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchDigitalLoginData();
  }, [code]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl mb-4">
            <PhoneCall className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">E-Nömrə Reyestri</h1>
          <p className="text-slate-400 text-sm mt-1">
            Nömrə ehtiyatları idarəetmə sistemi
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            Daxil ol
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Kabinetinizi seçin və daxil olun
          </p>

          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Yüklənir…</span>
            </div>
          )}

          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {!isLoading && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="mb-6">
                <legend className="text-sm font-medium text-slate-700 mb-3">
                  Kabinet / Rol seçin
                </legend>
                {/* <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'icta', label: 'IKTA', desc: 'Tam idarəetmə', color: 'blue' },
                  { value: 'rinn', label: 'RINN', desc: 'Oxumaq/Analiz', color: 'slate' },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className="relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 border-slate-200 hover:border-slate-300"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('role')}
                      className="sr-only"
                    />
                    <span className="text-base font-bold text-slate-900">{opt.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                  </label>
                ))}
              </div> */}

                <div className="grid grid-cols-2 gap-3">
                  {certificates?.length > 0 &&
                    certificates.map((opt) => (
                      <label
                        key={opt.serialNumber}
                        className="relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 border-slate-200 hover:border-slate-300"
                      >
                        <input
                          type="radio"
                          value={JSON.stringify({
                            access_token: accessToken.current,
                            pin: JSON.parse(
                              atob(
                                idToken
                                  .current!.split(".")[1]
                                  .replace(/-/g, "+")
                                  .replace(/_/g, "/"),
                              ),
                            )?.user?.pin,
                            voen: opt.structureData.voen,
                            is_legal: opt.structureData.legal,
                            has_stamp: opt.structureData.hasStamp,
                            certificate_payload: btoa(
                              unescape(encodeURIComponent(JSON.stringify(opt))),
                            ),
                            login_session_payload: btoa(
                              unescape(encodeURIComponent(JSON.stringify(opt))),
                            ),
                          })}
                          {...register("selectedCertificate")}
                          className="sr-only"
                        />
                        <span className="text-base font-bold text-slate-900">
                          {opt.structureData.voen}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {opt.structureData.structureName}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {opt.structureData.position}
                        </span>
                      </label>
                    ))}

                  {certificates?.length === 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500">
                        Sertifikat tapılmadı
                      </p>
                    </div>
                  )}
                </div>
              </fieldset>

              {certificates?.length > 0 && (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting}
                >
                  {!isSubmitting && <LogIn className="h-4 w-4" />}
                  {isSubmitting ? "Daxil olunur…" : "Daxil ol"}
                </Button>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          İKTA — İnformasiya Kommunikasiya Texnologiyaları Agentliyi
        </p>
      </div>
    </div>
  );
}
