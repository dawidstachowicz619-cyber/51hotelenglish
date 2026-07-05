"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RefreshCw, ShieldCheck, User } from "lucide-react";

import { Button } from "@/components/ui/button";

type IdentityVerificationProps = {
  onVerified: (photoDataUrl: string) => void;
  onBack?: () => void;
};

export function IdentityVerification({
  onVerified,
  onBack,
}: IdentityVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError(
        "无法访问摄像头，请允许浏览器使用摄像头权限，或使用 Chrome / Safari 浏览器。"
      );
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!photoDataUrl) {
      startCamera();
    }
    return () => stopCamera();
  }, [photoDataUrl, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhotoDataUrl(dataUrl);
    setVerified(true);
    stopCamera();
  }, [cameraReady, stopCamera]);

  const retakePhoto = useCallback(() => {
    setPhotoDataUrl(null);
    setVerified(false);
  }, []);

  const handleStartTest = useCallback(() => {
    if (photoDataUrl && verified) {
      onVerified(photoDataUrl);
    }
  }, [photoDataUrl, verified, onVerified]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)]">
          <ShieldCheck className="size-8" strokeWidth={2} />
        </div>
        <h1 className="mt-6 font-display text-2xl text-foreground md:text-3xl">
          身份验证
        </h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          测评开始前请拍照确认身份，确保成绩真实有效。
        </p>
      </div>

      <div className="mt-8 card-elevated overflow-hidden p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoDataUrl}
              alt="身份验证照片"
              className="size-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                className="size-full -scale-x-100 object-cover"
                playsInline
                muted
              />
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-sm font-semibold text-muted-foreground">
                    正在启动摄像头...
                  </p>
                </div>
              )}
            </>
          )}

          {/* Face guide overlay */}
          {!photoDataUrl && cameraReady && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-48 rounded-full border-4 border-dashed border-white/60" />
            </div>
          )}

          {verified && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-white">
              <CheckCircle2 className="size-3.5" />
              已拍照
            </div>
          )}
        </div>

        {cameraError && (
          <p className="mt-4 rounded-xl bg-red/10 p-3 text-sm font-semibold text-red">
            {cameraError}
          </p>
        )}

        <ul className="mt-4 space-y-2 text-left">
          {[
            "请正对摄像头，确保面部清晰可见",
            "请在光线充足的环境下拍摄",
            "照片仅用于本次测评身份确认",
          ].map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-xs font-semibold text-muted-foreground"
            >
              <User className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {!photoDataUrl ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!cameraReady}
            onClick={capturePhoto}
          >
            <Camera className="size-5" />
            拍照确认身份
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              disabled={!verified}
              onClick={handleStartTest}
            >
              开始测试
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={retakePhoto}
            >
              <RefreshCw className="size-4" />
              重新拍照
            </Button>
          </>
        )}

        {onBack && (
          <Button variant="ghost" className="w-full" onClick={onBack}>
            返回上一步
          </Button>
        )}
      </div>
    </div>
  );
}
