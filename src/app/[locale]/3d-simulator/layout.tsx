export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer, .back-to-top, .cookie-consent { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
      `}} />
      {children}
    </>
  );
}
