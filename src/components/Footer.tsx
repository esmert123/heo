export function Footer() {
  return (
    <footer className="py-8 px-4 bg-corporate-900 border-t border-corporate-700">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-corporate-400 text-sm">
          &copy; {new Date().getFullYear()} HEO. Tum haklari saklidir.
        </p>
      </div>
    </footer>
  );
}
