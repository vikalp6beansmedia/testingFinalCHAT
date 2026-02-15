import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "CreatorFarm",
  description: "Exclusive Creator Access",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0b0c] text-white antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col items-center">

            {/* Compact Header */}
            <div className="w-full max-w-[420px] px-4 pt-4">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-3 flex items-center justify-between backdrop-blur-xl">
                <div className="text-[15px] font-semibold tracking-wide">
                  CreatorFarm
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-9 px-3 rounded-full border border-white/10 bg-black/30 text-[12px] flex items-center">
                    Member
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="w-full flex justify-center">
              {children}
            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}
