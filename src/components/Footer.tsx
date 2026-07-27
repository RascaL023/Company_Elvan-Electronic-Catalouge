export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ElectroShop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
