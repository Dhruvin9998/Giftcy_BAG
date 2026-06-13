import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export function WhatsAppButton() {
  const [waNumber, setWaNumber] = useState("919999999999");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data?.contact_info?.whatsapp) {
          const cleanNum = res.data.contact_info.whatsapp.replace(/\D/g, "");
          if (cleanNum) {
            setWaNumber(cleanNum);
          }
        }
      } catch (err) {
        console.error("Failed to load settings in WhatsAppButton", err);
      }
    })();
  }, []);

  return (
    <a
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-luxury flex items-center justify-center hover:scale-110 transition-transform"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/30" />
    </a>
  );
}
